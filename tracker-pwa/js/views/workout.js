// Vista: Registro de Sesiones de Entrenamiento (Núcleo)
import { state } from '../state.js';
import { getProgressionAdvice } from '../modules/progression.js';
import { openPlateCalculator } from '../components/plate-modal.js';
import { formatTimeSpanish, triggerHaptic, unlockAudio, generateId } from '../utils.js';

let workoutViewEl = null;

export function renderWorkoutView(container) {
  workoutViewEl = container;
  container.innerHTML = '';

  if (!state.activeSession) {
    renderEmptyOrStartScreen(container);
  } else {
    renderActiveWorkout(container);
  }
}

// Pantalla cuando no hay sesión activa: Iniciar vacía o elegir rutina
function renderEmptyOrStartScreen(container) {
  const templates = state.templates || [];

  const templateCardsHtml = templates.map(t => `
    <div class="card" style="margin-bottom: 12px; cursor: pointer;" data-template-id="${t.id}">
      <div class="card-header" style="margin-bottom: 4px;">
        <strong style="font-size: 1.1rem; color: #fff;">${t.nombre}</strong>
        <span class="badge primary-muscle">${t.ejercicios ? t.ejercicios.length : 0} ejercicios</span>
      </div>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 10px;">${t.descripcion || ''}</p>
      <button type="button" class="btn btn-secondary btn-full btn-start-template" data-template-id="${t.id}">
        Entrenar rutina
      </button>
    </div>
  `).join('');

  container.innerHTML = `
    <div class="workout-empty-state">
      <svg class="workout-empty-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M6 5v14M18 5v14M2 9v6M22 9v6M6 12h12"></path>
      </svg>
      <div>
        <h2 style="font-size: 1.5rem; font-weight: 900; margin-bottom: 6px;">Listo para entrenar</h2>
        <p style="font-size: 0.9rem; color: var(--text-secondary);">Inicia una sesión libre o selecciona una de tus rutinas</p>
      </div>
      <button type="button" class="btn btn-primary btn-large btn-full" id="btn-start-empty-session">
        + Iniciar sesión vacía
      </button>
    </div>

    <div style="margin-top: 10px;">
      <h3 style="font-size: 1rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px;">
        Rutinas guardadas
      </h3>
      ${templateCardsHtml}
    </div>
  `;

  // Listener para iniciar sesión vacía
  container.querySelector('#btn-start-empty-session').addEventListener('click', async () => {
    unlockAudio();
    triggerHaptic('medium');
    await state.startSession(null);
    renderWorkoutView(container);
  });

  // Listeners para iniciar desde plantilla
  container.querySelectorAll('.btn-start-template').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      unlockAudio();
      triggerHaptic('medium');
      const tmplId = btn.getAttribute('data-template-id');
      const tmpl = templates.find(t => t.id === tmplId);
      await state.startSession(tmpl);
      renderWorkoutView(container);
    });
  });
}

// Pantalla principal de la sesión activa
function renderActiveWorkout(container) {
  const session = state.activeSession;
  if (!session) return;

  const startTimeStr = formatTimeSpanish(session.inicio);

  container.innerHTML = `
    <div class="session-header-card">
      <div class="session-title-row">
        <div>
          <h2 style="font-size: 1.35rem; font-weight: 900;">${session.templateName || 'Sesión libre'}</h2>
          <span class="session-time-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
            Iniciada a las ${startTimeStr}
          </span>
        </div>
        <button type="button" class="btn btn-secondary btn-icon" id="btn-toggle-focus" title="Modo enfocado pantalla completa">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
        </button>
      </div>

      <div class="session-actions-row">
        <button type="button" class="btn btn-primary" style="flex: 2;" id="btn-finish-session">
          Terminar entrenamiento
        </button>
        <button type="button" class="btn btn-danger" style="flex: 1;" id="btn-cancel-session">
          Descartar
        </button>
      </div>
    </div>

    <!-- Lista de ejercicios en la sesión -->
    <div id="workout-exercises-container"></div>

    <button type="button" class="btn btn-secondary btn-full btn-large" id="btn-add-exercise-to-workout" style="margin-top: 10px; margin-bottom: 24px;">
      + Añadir ejercicio a la sesión
    </button>
  `;

  // Renderizar cada ejercicio
  const exContainer = container.querySelector('#workout-exercises-container');
  renderExercisesList(exContainer, session);

  // Botón Terminar
  container.querySelector('#btn-finish-session').addEventListener('click', async () => {
    triggerHaptic('success');
    if (confirm('¿Terminar y guardar este entrenamiento en el historial?')) {
      await state.finishSession();
      state.setTab('history');
    }
  });

  // Botón Descartar
  container.querySelector('#btn-cancel-session').addEventListener('click', async () => {
    triggerHaptic('heavy');
    if (confirm('¿Seguro que deseas descartar esta sesión? Los cambios no se guardarán.')) {
      await state.cancelActiveSession();
      renderWorkoutView(container);
    }
  });

  // Botón Añadir Ejercicio
  container.querySelector('#btn-add-exercise-to-workout').addEventListener('click', () => {
    triggerHaptic('light');
    openExercisePickerModal((selectedEx) => {
      addExerciseToSession(selectedEx);
    });
  });

  // Botón Modo Enfocado
  container.querySelector('#btn-toggle-focus').addEventListener('click', () => {
    triggerHaptic('medium');
    openFocusedMode();
  });
}

function renderExercisesList(container, session) {
  container.innerHTML = '';

  session.exercises.forEach((item, exIndex) => {
    const exData = state.exercises.find(e => e.id === item.exerciseId) || {
      nombre: 'Ejercicio desconocido',
      grupoPrimario: 'general',
      equipo: 'barra',
      notasPersistentes: ''
    };

    const prevHistory = state.getLastSessionForExercise(item.exerciseId);
    const prevSets = prevHistory ? prevHistory.sets : [];

    // Sugerencia de Doble Progresión
    const progression = getProgressionAdvice(
      prevSets,
      { min: item.minReps || 8, max: item.maxReps || 10 },
      item.targetRir !== undefined ? item.targetRir : 2,
      {
        increment: state.settings.weightStep || 2.5,
        lowerBodyIncrement: state.settings.lowerBodyIncrement || 5,
        isLowerBody: ['cuádriceps', 'isquios', 'glúteos', 'pantorrillas'].includes(exData.grupoPrimario),
        unit: state.settings.unit
      }
    );

    const card = document.createElement('div');
    card.className = 'exercise-card';

    card.innerHTML = `
      <div class="exercise-header">
        <div>
          <h3 class="exercise-title">${exData.nombre}</h3>
          <div class="exercise-badges">
            <span class="badge primary-muscle">${exData.grupoPrimario}</span>
            <span class="badge">${exData.equipo}</span>
            <span class="badge" style="color: var(--accent-warning);">⏱ ${item.defaultRest || 120}s</span>
          </div>
        </div>
        <button type="button" class="btn btn-secondary btn-icon btn-remove-ex" title="Eliminar ejercicio de la sesión" style="width: 36px; height: 36px;">✕</button>
      </div>

      <!-- Nota persistente editable (ej. agujero 4 en jalón) -->
      <div class="persistent-note-box">
        <span style="font-weight: 700; margin-right: 6px;">Nota:</span>
        <input type="text" class="input-persistent-note" placeholder="Toca para añadir nota (ej. banco en posición 3)..." value="${exData.notasPersistentes || ''}">
      </div>

      <!-- Sugerencia de Progresión -->
      <div class="progression-banner">
        <span>⚡ <strong>Sobrecarga:</strong> ${progression.message}</span>
      </div>

      <!-- Encabezado de columnas de series -->
      <div style="display: grid; grid-template-columns: 36px 1fr 1fr 70px 48px; gap: 8px; font-size: 0.72rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; padding: 6px 0; border-bottom: 1px solid var(--border-subtle);">
        <div style="text-align: center;">Serie</div>
        <div style="text-align: center;">${state.settings.unit}</div>
        <div style="text-align: center;">Reps</div>
        <div style="text-align: center;">${state.settings.intensityMode.toUpperCase()}</div>
        <div style="text-align: center;">Listo</div>
      </div>

      <div class="sets-rows-container"></div>

      <div style="display: flex; gap: 8px; margin-top: 10px;">
        <button type="button" class="btn btn-secondary btn-full btn-add-set" style="min-height: 42px; font-size: 0.9rem;">
          + Añadir serie
        </button>
        <button type="button" class="btn btn-secondary btn-icon btn-calc-plates" title="Calculadora de discos" style="width: 44px; height: 42px; flex-shrink: 0;">
          🏋️‍♂️
        </button>
      </div>
    `;

    // Guardar nota persistente en IndexedDB al cambiar
    const noteInput = card.querySelector('.input-persistent-note');
    noteInput.addEventListener('change', () => {
      state.updateExercisePersistentNote(item.exerciseId, noteInput.value.trim());
    });

    // Botón eliminar ejercicio
    card.querySelector('.btn-remove-ex').addEventListener('click', () => {
      triggerHaptic('medium');
      if (confirm(`¿Quitar ${exData.nombre} de la sesión?`)) {
        session.exercises.splice(exIndex, 1);
        state.updateActiveSession(() => {});
        renderExercisesList(container, session);
      }
    });

    // Botón añadir serie
    card.querySelector('.btn-add-set').addEventListener('click', () => {
      triggerHaptic('light');
      const lastSet = item.sets[item.sets.length - 1];
      item.sets.push({
        id: generateId('set'),
        peso: lastSet ? lastSet.peso : 0,
        reps: lastSet ? lastSet.reps : item.minReps || 8,
        tipo: 'efectiva',
        rir: item.targetRir !== undefined ? item.targetRir : 2,
        rpe: 8,
        completed: false,
        timestamp: null
      });
      state.updateActiveSession(() => {});
      renderExercisesList(container, session);
    });

    // Botón calculadora de discos para este ejercicio
    card.querySelector('.btn-calc-plates').addEventListener('click', () => {
      triggerHaptic('light');
      const currentSet = item.sets.find(s => !s.completed) || item.sets[0] || { peso: 60 };
      openPlateCalculator(currentSet.peso || 60, (appliedWeight) => {
        if (currentSet) {
          currentSet.peso = appliedWeight;
          state.updateActiveSession(() => {});
          renderExercisesList(container, session);
        }
      });
    });

    // Renderizar cada fila de serie
    const setsContainer = card.querySelector('.sets-rows-container');
    renderSetRows(setsContainer, item, exIndex, prevSets);

    container.appendChild(card);
  });
}

function renderSetRows(container, item, exIndex, prevSets) {
  container.innerHTML = '';

  item.sets.forEach((set, sIndex) => {
    const prevSet = prevSets[sIndex];
    const prevText = prevSet ? `${prevSet.peso} ${state.settings.unit} × ${prevSet.reps} @RIR ${prevSet.rir ?? '-'}` : null;

    const row = document.createElement('div');
    row.innerHTML = `
      <div class="set-row">
        <!-- Índice y tipo de serie conmutador -->
        <div class="set-index-col">
          <span>${sIndex + 1}</span>
          <span class="set-tag ${set.tipo || 'efectiva'}" style="cursor: pointer;" title="Cambiar tipo de serie">${(set.tipo || 'efectiva').substring(0, 3)}</span>
        </div>

        <!-- Input Peso -->
        <div>
          <input type="text" inputmode="decimal" class="stepper-input set-weight-input" style="width: 100%; height: 44px; background: var(--bg-surface-2); border-radius: 8px; border: 1px solid var(--border-subtle);" value="${set.peso}">
        </div>

        <!-- Input Reps -->
        <div>
          <input type="text" inputmode="decimal" class="stepper-input set-reps-input" style="width: 100%; height: 44px; background: var(--bg-surface-2); border-radius: 8px; border: 1px solid var(--border-subtle);" value="${set.reps}">
        </div>

        <!-- Selector RIR / RPE -->
        <div>
          <select class="settings-select set-rir-select" style="width: 100%; height: 44px; padding: 4px; text-align: center;">
            <option value="0" ${set.rir === 0 ? 'selected' : ''}>RIR 0</option>
            <option value="1" ${set.rir === 1 ? 'selected' : ''}>RIR 1</option>
            <option value="2" ${set.rir === 2 ? 'selected' : ''}>RIR 2</option>
            <option value="3" ${set.rir === 3 ? 'selected' : ''}>RIR 3</option>
            <option value="4" ${set.rir === 4 ? 'selected' : ''}>RIR 4</option>
            <option value="5" ${set.rir === 5 ? 'selected' : ''}>RIR 5</option>
          </select>
        </div>

        <!-- Checkmark completado -->
        <div>
          <button type="button" class="set-check-btn ${set.completed ? 'completed' : ''}" aria-label="Marcar serie completada">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </button>
        </div>
      </div>

      <!-- Hint de sesión anterior con auto-copia en 1 toque -->
      ${prevText ? `
        <div class="previous-history-hint" title="Toca para copiar peso y reps de la última vez">
          <span>Última vez: <strong>${prevText}</strong></span>
          <span class="copy-icon">COPIAR ↵</span>
        </div>
      ` : ''}
    `;

    const weightInput = row.querySelector('.set-weight-input');
    const repsInput = row.querySelector('.set-reps-input');
    const rirSelect = row.querySelector('.set-rir-select');
    const checkBtn = row.querySelector('.set-check-btn');
    const tagEl = row.querySelector('.set-tag');
    const prevHint = row.querySelector('.previous-history-hint');

    // Auto-copia en 1 solo toque desde el histórico
    if (prevHint && prevSet) {
      prevHint.addEventListener('click', () => {
        triggerHaptic('light');
        set.peso = prevSet.peso;
        set.reps = prevSet.reps;
        if (prevSet.rir !== undefined) set.rir = prevSet.rir;
        weightInput.value = set.peso;
        repsInput.value = set.reps;
        if (rirSelect) rirSelect.value = set.rir;
        state.updateActiveSession(() => {});
      });
    }

    weightInput.addEventListener('change', () => {
      const val = parseFloat(weightInput.value.replace(',', '.'));
      set.peso = !isNaN(val) ? val : 0;
      state.updateActiveSession(() => {});
    });

    repsInput.addEventListener('change', () => {
      const val = parseInt(repsInput.value, 10);
      set.reps = !isNaN(val) ? val : 0;
      state.updateActiveSession(() => {});
    });

    if (rirSelect) {
      rirSelect.addEventListener('change', () => {
        set.rir = parseInt(rirSelect.value, 10);
        state.updateActiveSession(() => {});
      });
    }

    // Alternar tipo de serie: efectiva -> calentamiento -> dropset -> backoff -> myoreps
    tagEl.addEventListener('click', () => {
      triggerHaptic('light');
      const types = ['efectiva', 'calentamiento', 'dropset', 'backoff', 'myoreps'];
      const nextIdx = (types.indexOf(set.tipo || 'efectiva') + 1) % types.length;
      set.tipo = types[nextIdx];
      state.updateActiveSession(() => {});
      tagEl.className = `set-tag ${set.tipo}`;
      tagEl.textContent = set.tipo.substring(0, 3);
    });

    // Checkmark completado -> Inicia el temporizador de descanso automáticamente
    checkBtn.addEventListener('click', () => {
      triggerHaptic('medium');
      set.completed = !set.completed;
      set.timestamp = set.completed ? Date.now() : null;
      checkBtn.classList.toggle('completed', set.completed);
      state.updateActiveSession(() => {});

      if (set.completed) {
        // Iniciar temporizador con el descanso por defecto del ejercicio
        const restSeconds = item.defaultRest || 120;
        state.startTimer(restSeconds);
      }
    });

    container.appendChild(row);
  });
}

// Selector modal para añadir ejercicios a la sesión
function openExercisePickerModal(onSelect) {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  const exercises = state.exercises || [];
  let filterMuscle = 'todos';
  let searchTerm = '';

  const groups = ['todos', 'pecho', 'espalda', 'hombros', 'cuádriceps', 'isquios', 'glúteos', 'bíceps', 'tríceps', 'pantorrillas', 'abdomen', 'antebrazos', 'trapecio'];

  modal.innerHTML = `
    <div class="modal-sheet" style="height: 85vh;">
      <div class="modal-handle"></div>
      <div class="modal-header">
        <h3 class="card-title">Seleccionar Ejercicio</h3>
        <button type="button" class="btn btn-secondary btn-icon" id="picker-close" style="width: 40px; height: 40px;">✕</button>
      </div>

      <div style="margin-bottom: 12px;">
        <input type="text" id="picker-search" placeholder="Buscar ejercicio..." class="stepper-input" style="width: 100%; height: 46px; background: var(--bg-surface-2); border-radius: 10px; border: 1px solid var(--border-subtle); padding: 0 14px; text-align: left; font-size: 1rem;">
      </div>

      <div class="chips-row" id="picker-muscle-chips" style="margin-bottom: 12px;">
        ${groups.map(g => `<button type="button" class="chip-btn ${g === 'todos' ? 'active' : ''}" data-group="${g}">${g.toUpperCase()}</button>`).join('')}
      </div>

      <div class="modal-body" id="picker-list" style="flex: 1;"></div>
    </div>
  `;

  document.body.appendChild(modal);

  const searchInput = modal.querySelector('#picker-search');
  const chipContainer = modal.querySelector('#picker-muscle-chips');
  const listContainer = modal.querySelector('#picker-list');
  const closeBtn = modal.querySelector('#picker-close');

  const renderList = () => {
    const filtered = exercises.filter(e => {
      const matchSearch = e.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchMuscle = filterMuscle === 'todos' || e.grupoPrimario === filterMuscle;
      return matchSearch && matchMuscle;
    });

    if (filtered.length === 0) {
      listContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 20px;">No se encontraron ejercicios.</div>';
      return;
    }

    listContainer.innerHTML = filtered.map(e => `
      <div class="card" style="margin-bottom: 8px; padding: 12px; cursor: pointer;" data-ex-id="${e.id}">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <strong style="color: #fff; font-size: 0.95rem;">${e.nombre}</strong>
          <span class="badge primary-muscle">${e.grupoPrimario}</span>
        </div>
        <div style="font-size: 0.78rem; color: var(--text-muted); margin-top: 4px;">
          Equipo: ${e.equipo} • Descanso: ${e.descansoPorDefecto}s
        </div>
      </div>
    `).join('');

    listContainer.querySelectorAll('[data-ex-id]').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.getAttribute('data-ex-id');
        const ex = exercises.find(e => e.id === id);
        triggerHaptic('light');
        modal.remove();
        if (typeof onSelect === 'function') onSelect(ex);
      });
    });
  };

  searchInput.addEventListener('input', () => {
    searchTerm = searchInput.value.trim();
    renderList();
  });

  chipContainer.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      chipContainer.querySelectorAll('.chip-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterMuscle = btn.getAttribute('data-group');
      renderList();
    });
  });

  closeBtn.addEventListener('click', () => modal.remove());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

  renderList();
}

function addExerciseToSession(ex) {
  if (!state.activeSession || !ex) return;

  const prevHistory = state.getLastSessionForExercise(ex.id);
  const prevSets = prevHistory ? prevHistory.sets : [];

  const initialSets = [];
  for (let i = 0; i < 3; i++) {
    const prev = prevSets[i];
    initialSets.push({
      id: generateId('set'),
      peso: prev ? prev.peso : 0,
      reps: prev ? prev.reps : 10,
      tipo: 'efectiva',
      rir: 2,
      rpe: 8,
      completed: false,
      timestamp: null
    });
  }

  state.activeSession.exercises.push({
    exerciseId: ex.id,
    targetSets: 3,
    minReps: 8,
    maxReps: 12,
    targetRir: 2,
    sessionNotes: '',
    defaultRest: ex.descansoPorDefecto || 120,
    sets: initialSets
  });

  state.updateActiveSession(() => {});
  if (workoutViewEl) {
    renderWorkoutView(workoutViewEl);
  }
}

// ==========================================================
// MODO DE EJECUCIÓN ENFOCADO (FULLSCREEN)
// ==========================================================
function openFocusedMode() {
  const session = state.activeSession;
  if (!session || session.exercises.length === 0) return;

  let exIdx = 0;
  let setIdx = 0;

  // Encontrar la primera serie no completada
  outer: for (let e = 0; e < session.exercises.length; e++) {
    for (let s = 0; s < session.exercises[e].sets.length; s++) {
      if (!session.exercises[e].sets[s].completed) {
        exIdx = e;
        setIdx = s;
        break outer;
      }
    }
  }

  const overlay = document.createElement('div');
  overlay.className = 'focused-mode-overlay';

  const updateFocusedView = () => {
    const item = session.exercises[exIdx];
    if (!item) {
      overlay.remove();
      return;
    }
    const currentSet = item.sets[setIdx] || item.sets[0];
    const exData = state.exercises.find(e => e.id === item.exerciseId) || { nombre: 'Ejercicio' };

    const prevHistory = state.getLastSessionForExercise(item.exerciseId);
    const prevSet = prevHistory && prevHistory.sets ? prevHistory.sets[setIdx] : null;

    overlay.innerHTML = `
      <div class="focused-header">
        <button type="button" class="btn btn-secondary" id="btn-focused-exit">✕ Salir de Modo Enfocado</button>
        <button type="button" class="btn btn-secondary btn-icon" id="btn-focused-plates" style="font-size: 1.2rem;">🏋️‍♂️</button>
      </div>

      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center;">
        <h2 class="focused-exercise-title">${exData.nombre}</h2>
        <div class="focused-set-indicator">
          Serie ${setIdx + 1} de ${item.sets.length} (${(currentSet.tipo || 'efectiva').toUpperCase()})
        </div>

        <div class="focused-inputs-card">
          <div class="focused-input-group">
            <div class="focused-input-label">Peso (${state.settings.unit})</div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-secondary btn-icon" id="f-weight-minus" style="width: 56px; height: 56px; font-size: 1.6rem;">&minus;</button>
              <input type="text" inputmode="decimal" id="f-weight-input" class="stepper-input" style="flex: 1; height: 56px; background: var(--bg-surface-2); font-size: 1.8rem; border-radius: 12px; border: 1.5px solid var(--border-subtle);" value="${currentSet.peso}">
              <button type="button" class="btn btn-secondary btn-icon" id="f-weight-plus" style="width: 56px; height: 56px; font-size: 1.6rem; color: var(--accent-primary);">&plus;</button>
            </div>
          </div>

          <div class="focused-input-group">
            <div class="focused-input-label">Repeticiones</div>
            <div style="display: flex; gap: 8px;">
              <button type="button" class="btn btn-secondary btn-icon" id="f-reps-minus" style="width: 56px; height: 56px; font-size: 1.6rem;">&minus;</button>
              <input type="text" inputmode="decimal" id="f-reps-input" class="stepper-input" style="flex: 1; height: 56px; background: var(--bg-surface-2); font-size: 1.8rem; border-radius: 12px; border: 1.5px solid var(--border-subtle);" value="${currentSet.reps}">
              <button type="button" class="btn btn-secondary btn-icon" id="f-reps-plus" style="width: 56px; height: 56px; font-size: 1.6rem; color: var(--accent-primary);">&plus;</button>
            </div>
          </div>

          <div class="focused-input-group">
            <div class="focused-input-label">RIR Objetivo / Real</div>
            <div class="chips-row" id="f-rir-chips">
              ${[0, 1, 2, 3, 4, 5].map(r => `
                <button type="button" class="chip-btn ${currentSet.rir === r ? 'active' : ''}" data-rir="${r}" style="min-width: 48px; height: 44px; font-size: 1rem;">
                  RIR ${r}
                </button>
              `).join('')}
            </div>
          </div>

          ${prevSet ? `
            <div class="previous-history-hint" id="f-copy-prev" style="padding: 10px; font-size: 0.9rem;">
              <span>Última vez: <strong>${prevSet.peso} ${state.settings.unit} × ${prevSet.reps} @RIR ${prevSet.rir ?? '-'}</strong></span>
              <span class="copy-icon">COPIAR ↵</span>
            </div>
          ` : ''}
        </div>

        <button type="button" class="btn btn-primary btn-full focused-btn-log" id="btn-focused-log">
          ${currentSet.completed ? '✓ Serie Completada (Siguiente)' : '✓ Registrar Serie'}
        </button>
      </div>
    `;

    // Listeners
    overlay.querySelector('#btn-focused-exit').addEventListener('click', () => {
      overlay.remove();
      if (workoutViewEl) renderWorkoutView(workoutViewEl);
    });

    overlay.querySelector('#btn-focused-plates').addEventListener('click', () => {
      openPlateCalculator(currentSet.peso || 60, (applied) => {
        currentSet.peso = applied;
        state.updateActiveSession(() => {});
        updateFocusedView();
      });
    });

    const wInput = overlay.querySelector('#f-weight-input');
    const rInput = overlay.querySelector('#f-reps-input');

    overlay.querySelector('#f-weight-minus').addEventListener('click', () => {
      triggerHaptic('light');
      currentSet.peso = Math.max(0, currentSet.peso - (state.settings.weightStep || 2.5));
      wInput.value = currentSet.peso;
      state.updateActiveSession(() => {});
    });

    overlay.querySelector('#f-weight-plus').addEventListener('click', () => {
      triggerHaptic('light');
      currentSet.peso += (state.settings.weightStep || 2.5);
      wInput.value = currentSet.peso;
      state.updateActiveSession(() => {});
    });

    overlay.querySelector('#f-reps-minus').addEventListener('click', () => {
      triggerHaptic('light');
      currentSet.reps = Math.max(1, currentSet.reps - 1);
      rInput.value = currentSet.reps;
      state.updateActiveSession(() => {});
    });

    overlay.querySelector('#f-reps-plus').addEventListener('click', () => {
      triggerHaptic('light');
      currentSet.reps += 1;
      rInput.value = currentSet.reps;
      state.updateActiveSession(() => {});
    });

    overlay.querySelectorAll('#f-rir-chips .chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHaptic('light');
        const rVal = parseInt(btn.getAttribute('data-rir'), 10);
        currentSet.rir = rVal;
        state.updateActiveSession(() => {});
        overlay.querySelectorAll('#f-rir-chips .chip-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    const copyBtn = overlay.querySelector('#f-copy-prev');
    if (copyBtn && prevSet) {
      copyBtn.addEventListener('click', () => {
        triggerHaptic('light');
        currentSet.peso = prevSet.peso;
        currentSet.reps = prevSet.reps;
        if (prevSet.rir !== undefined) currentSet.rir = prevSet.rir;
        state.updateActiveSession(() => {});
        updateFocusedView();
      });
    }

    overlay.querySelector('#btn-focused-log').addEventListener('click', () => {
      triggerHaptic('medium');
      currentSet.completed = true;
      currentSet.timestamp = Date.now();
      state.updateActiveSession(() => {});

      // Iniciar timer
      state.startTimer(item.defaultRest || 120);

      // Avanzar a la siguiente serie o siguiente ejercicio
      if (setIdx + 1 < item.sets.length) {
        setIdx++;
      } else if (exIdx + 1 < session.exercises.length) {
        exIdx++;
        setIdx = 0;
      } else {
        alert('¡Todas las series de la sesión han sido completadas!');
        overlay.remove();
        if (workoutViewEl) renderWorkoutView(workoutViewEl);
        return;
      }

      updateFocusedView();
    });
  };

  document.body.appendChild(overlay);
  updateFocusedView();
}
