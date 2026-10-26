// Gestor de estado reactivo y persistencia para Fuerza PWA
import {
  openDB,
  dbGetAll,
  dbPut,
  dbDelete,
  getActiveSession,
  saveActiveSession,
  clearActiveSession,
  requestStoragePersistence
} from './db.js';
import { DEFAULT_EXERCISES, DEFAULT_TEMPLATES } from './seed-data.js';
import { requestWakeLock, releaseWakeLock, playTimerFinishSound, triggerHaptic } from './utils.js';

const SETTINGS_STORAGE_KEY = 'fuerza_settings_v1';

const DEFAULT_SETTINGS = {
  unit: 'kg', // 'kg' | 'lb'
  intensityMode: 'rir', // 'rir' | 'rpe' | 'none'
  e1rmFormula: 'epley', // 'epley' | 'brzycki'
  weightStep: 2.5,
  repsStep: 1,
  lowerBodyIncrement: 5.0,
  soundEnabled: true,
  hapticEnabled: true,
  wakeLockEnabled: true,
  barWeight: 20,
  plateInventory: [25, 20, 15, 10, 5, 2.5, 1.25, 0.5],
  weeklyTargetMin: 10,
  weeklyTargetMax: 20,
  secondaryFactor: 0.5,
  lastBackupReminder: null
};

class AppState {
  constructor() {
    this.settings = this.loadSettings();
    this.exercises = [];
    this.templates = [];
    this.sessions = [];
    this.activeSession = null;
    this.currentTab = 'workout'; // 'workout' | 'history' | 'progress' | 'routines' | 'settings'
    this.isFocusedMode = false;
    this.focusedExerciseIdx = 0;
    this.focusedSetIdx = 0;

    // Temporizador de descanso (basado en timestamp para iOS)
    this.timer = {
      active: false,
      totalDuration: 90,
      endTimestamp: null,
      remainingSeconds: 0,
      intervalId: null
    };

    this.listeners = new Map();
  }

  // --- CONFIGURACIÓN (localStorage) ---
  loadSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('[State] Error al leer ajustes:', e);
    }
    return { ...DEFAULT_SETTINGS };
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
    } catch (e) {
      console.error('[State] Error al guardar ajustes en localStorage:', e);
    }
    this.emit('settings_changed', this.settings);
  }

  // --- PUB / SUB ---
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.listeners.get(event).delete(callback);
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      for (const cb of this.listeners.get(event)) {
        try {
          cb(data);
        } catch (err) {
          console.error(`[State] Error en listener de ${event}:`, err);
        }
      }
    }
  }

  // --- INICIALIZACIÓN ---
  async init() {
    await openDB();
    await requestStoragePersistence();

    // 1. Cargar o sembrar ejercicios (asegurando que nuevos ejercicios se sincronicen)
    let exs = await dbGetAll('exercises');
    const existingExIds = new Set((exs || []).map(e => e.id));
    let newExercisesAdded = false;
    for (const ex of DEFAULT_EXERCISES) {
      if (!existingExIds.has(ex.id)) {
        await dbPut('exercises', ex);
        newExercisesAdded = true;
      }
    }
    if (newExercisesAdded || !exs || exs.length === 0) {
      exs = await dbGetAll('exercises');
    }
    this.exercises = exs;

    // 2. Cargar o sembrar plantillas (asegurando que nuevas rutinas y actualizaciones se sincronicen)
    let tmpls = await dbGetAll('templates');
    const existingTmplMap = new Map((tmpls || []).map(t => [t.id, t]));
    let templatesUpdated = false;
    for (const tmpl of DEFAULT_TEMPLATES) {
      const existing = existingTmplMap.get(tmpl.id);
      if (!existing) {
        await dbPut('templates', tmpl);
        templatesUpdated = true;
      } else if (tmpl.id.startsWith('custom-') && existing.ejercicios.length !== tmpl.ejercicios.length) {
        // Sincronizar actualización de ejercicios predeterminados de la plantilla
        await dbPut('templates', tmpl);
        templatesUpdated = true;
      }
    }
    if (templatesUpdated || !tmpls || tmpls.length === 0) {
      tmpls = await dbGetAll('templates');
    }
    this.templates = tmpls;

    // 3. Cargar historial de sesiones
    this.sessions = await dbGetAll('sessions');

    // 4. Cargar sesión activa si quedó abierta (recuperación de cierre en iOS)
    const savedActive = await getActiveSession();
    if (savedActive) {
      this.activeSession = savedActive;
      if (this.settings.wakeLockEnabled) {
        requestWakeLock();
      }
    }

    // Exponer globalmente para helpers de visibilidad/wake lock
    window._appState = this;

    // Inicializar listener de visibilidad para corregir timer tras retorno de segundo plano
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.timer.active) {
        this.recalculateTimer();
      }
    });

    this.emit('ready', {
      exercises: this.exercises,
      templates: this.templates,
      sessions: this.sessions,
      activeSession: this.activeSession
    });
  }

  // --- NAVEGACIÓN ---
  setTab(tab) {
    if (this.currentTab === tab) return;
    this.currentTab = tab;
    this.emit('tab_changed', tab);
  }

  // --- SESIÓN ACTIVA ---
  async startSession(template = null) {
    const now = Date.now();
    const id = `sess_${now}_${Math.random().toString(36).substring(2, 6)}`;

    let sessionExercises = [];
    if (template && template.ejercicios) {
      for (const item of template.ejercicios) {
        // Encontrar datos del ejercicio para notas persistentes y descanso por defecto
        const exData = this.exercises.find(e => e.id === item.exerciseId);
        // Pre-cargar series con el peso/reps de la última vez que se hizo
        const prevHistory = this.getLastSessionForExercise(item.exerciseId);
        const prevSets = prevHistory ? prevHistory.sets : [];

        const initialSets = [];
        const targetSetsCount = item.targetSets || 3;
        for (let i = 0; i < targetSetsCount; i++) {
          const prevSet = prevSets[i] || (prevSets.length > 0 ? prevSets[prevSets.length - 1] : null);
          initialSets.push({
            id: `set_${now}_${Math.random().toString(36).substring(2, 6)}`,
            peso: prevSet ? prevSet.peso : 0,
            reps: prevSet ? prevSet.reps : item.minReps || 8,
            tipo: 'efectiva',
            rir: item.targetRir !== undefined ? item.targetRir : 2,
            rpe: 8,
            completed: false,
            timestamp: null
          });
        }

        sessionExercises.push({
          exerciseId: item.exerciseId,
          targetSets: item.targetSets || 3,
          minReps: item.minReps || 8,
          maxReps: item.maxReps || 10,
          targetRir: item.targetRir !== undefined ? item.targetRir : 2,
          sessionNotes: '',
          defaultRest: exData ? exData.descansoPorDefecto : 120,
          sets: initialSets
        });
      }
    }

    this.activeSession = {
      id,
      templateId: template ? template.id : null,
      templateName: template ? template.nombre : 'Sesión libre',
      inicio: now,
      fecha: new Date(now).toISOString(),
      fin: null,
      notaGeneral: '',
      exercises: sessionExercises
    };

    await saveActiveSession(this.activeSession);
    if (this.settings.wakeLockEnabled) {
      requestWakeLock();
    }

    this.emit('session_started', this.activeSession);
  }

  async updateActiveSession(updater) {
    if (!this.activeSession) return;
    updater(this.activeSession);
    await saveActiveSession(this.activeSession);
    this.emit('session_updated', this.activeSession);
  }

  async finishSession() {
    if (!this.activeSession) return;

    this.activeSession.fin = Date.now();

    // Guardar en sessions (IndexedDB)
    await dbPut('sessions', this.activeSession);

    // Actualizar lista en memoria
    this.sessions.unshift(this.activeSession);

    // Limpiar sesión activa
    const finished = this.activeSession;
    this.activeSession = null;
    await clearActiveSession();

    releaseWakeLock();
    this.stopTimer();

    this.emit('session_finished', finished);
    return finished;
  }

  async cancelActiveSession() {
    this.activeSession = null;
    await clearActiveSession();
    releaseWakeLock();
    this.stopTimer();
    this.emit('session_cancelled', null);
  }

  // --- CONSULTAS DE HISTORIAL ---
  getLastSessionForExercise(exerciseId) {
    // Buscar en sesiones finalizadas, ordenadas descendente por fecha
    for (const session of this.sessions) {
      const exEntry = session.exercises && session.exercises.find(e => e.exerciseId === exerciseId);
      if (exEntry && exEntry.sets && exEntry.sets.some(s => s.completed || s.peso > 0)) {
        return exEntry;
      }
    }
    return null;
  }

  // --- EJERCICIOS (CRUD) ---
  async addExercise(exData) {
    const id = exData.id || `custom_${Date.now()}`;
    const newEx = { ...exData, id, custom: true };
    await dbPut('exercises', newEx);
    this.exercises.push(newEx);
    this.emit('exercise_added', newEx);
    return newEx;
  }

  async updateExercise(exData) {
    await dbPut('exercises', exData);
    const idx = this.exercises.findIndex(e => e.id === exData.id);
    if (idx !== -1) {
      this.exercises[idx] = exData;
    }
    this.emit('exercise_updated', exData);
  }

  async updateExercisePersistentNote(exerciseId, note) {
    const ex = this.exercises.find(e => e.id === exerciseId);
    if (ex) {
      ex.notasPersistentes = note;
      await dbPut('exercises', ex);
      this.emit('exercise_updated', ex);
    }
  }

  // --- PLANTILLAS (CRUD) ---
  async addTemplate(tmplData) {
    const id = tmplData.id || `tmpl_${Date.now()}`;
    const newTmpl = { ...tmplData, id };
    await dbPut('templates', newTmpl);
    this.templates.push(newTmpl);
    this.emit('template_added', newTmpl);
    return newTmpl;
  }

  async updateTemplate(tmplData) {
    await dbPut('templates', tmplData);
    const idx = this.templates.findIndex(t => t.id === tmplData.id);
    if (idx !== -1) {
      this.templates[idx] = tmplData;
    }
    this.emit('template_updated', tmplData);
  }

  async deleteTemplate(templateId) {
    await dbDelete('templates', templateId);
    this.templates = this.templates.filter(t => t.id !== templateId);
    this.emit('template_deleted', templateId);
  }

  // --- TEMPORIZADOR DE DESCANSO RESILIENTE PARA IOS ---
  startTimer(seconds) {
    this.stopTimer();

    const duration = Number(seconds) || 90;
    const end = Date.now() + duration * 1000;

    this.timer = {
      active: true,
      totalDuration: duration,
      endTimestamp: end,
      remainingSeconds: duration,
      intervalId: null
    };

    this.timer.intervalId = setInterval(() => {
      this.tickTimer();
    }, 500);

    this.emit('timer_started', this.timer);
  }

  tickTimer() {
    if (!this.timer.active || !this.timer.endTimestamp) return;

    const remaining = Math.max(0, Math.round((this.timer.endTimestamp - Date.now()) / 1000));
    this.timer.remainingSeconds = remaining;

    this.emit('timer_tick', this.timer);

    if (remaining <= 0) {
      this.onTimerFinished();
    }
  }

  recalculateTimer() {
    if (!this.timer.active || !this.timer.endTimestamp) return;
    const remaining = Math.max(0, Math.round((this.timer.endTimestamp - Date.now()) / 1000));
    this.timer.remainingSeconds = remaining;

    if (remaining <= 0) {
      this.onTimerFinished();
    } else {
      this.emit('timer_tick', this.timer);
    }
  }

  adjustTimer(deltaSeconds) {
    if (!this.timer.active || !this.timer.endTimestamp) return;
    this.timer.endTimestamp += deltaSeconds * 1000;
    this.recalculateTimer();
  }

  stopTimer() {
    if (this.timer.intervalId) {
      clearInterval(this.timer.intervalId);
    }
    this.timer.active = false;
    this.timer.endTimestamp = null;
    this.timer.remainingSeconds = 0;
    this.timer.intervalId = null;
    this.emit('timer_stopped', null);
  }

  onTimerFinished() {
    this.stopTimer();
    if (this.settings.soundEnabled) {
      playTimerFinishSound();
    }
    if (this.settings.hapticEnabled) {
      triggerHaptic('success');
    }
    this.emit('timer_finished', null);
  }
}

export const state = new AppState();
