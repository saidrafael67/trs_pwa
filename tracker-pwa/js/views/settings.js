// Vista: Ajustes, Exportación/Importación y Configuración del Sistema
import { state } from '../state.js';
import { dbGetAll, dbPut, dbClear } from '../db.js';
import { calculateE1RM } from '../modules/e1rm.js';
import { playTimerFinishSound, triggerHaptic, unlockAudio, requestWakeLock } from '../utils.js';

export function renderSettingsView(container) {
  const s = state.settings;

  container.innerHTML = `
    <div style="margin-bottom: 16px;">
      <h2 style="font-size: 1.35rem; font-weight: 900;">Ajustes</h2>
      <p style="font-size: 0.85rem; color: var(--text-secondary);">Personalización, métricas y respaldo de datos</p>
    </div>

    <!-- Aviso importante para iOS -->
    <div class="ios-notice-card">
      <div style="display: flex; gap: 8px; align-items: flex-start;">
        <span style="font-size: 1.2rem;">⚠️</span>
        <div>
          <strong style="color: #fff;">Aviso para usuarios de iPhone (iOS):</strong>
          <div style="margin-top: 4px;">
            WebKit de Safari puede purgar el almacenamiento IndexedDB si no abres la app en 7 días continuos.
            <strong>Recomendamos exportar un respaldo JSON periódicamente.</strong>
            Además, para mantener la pantalla encendida o alertas sonoras con el teléfono bloqueado, Safari requiere mantener la app en primer plano.
          </div>
        </div>
      </div>
    </div>

    <!-- GRUPO: UNIDADES Y FÓRMULAS -->
    <div class="settings-group">
      <div class="settings-item">
        <div>
          <div class="settings-label">Unidad de peso</div>
          <div class="settings-sublabel">Afecta todas las cargas e históricos</div>
        </div>
        <select id="cfg-unit" class="settings-select">
          <option value="kg" ${s.unit === 'kg' ? 'selected' : ''}>Kilogramos (kg)</option>
          <option value="lb" ${s.unit === 'lb' ? 'selected' : ''}>Libras (lb)</option>
        </select>
      </div>

      <div class="settings-item">
        <div>
          <div class="settings-label">Métrica de intensidad</div>
          <div class="settings-sublabel">Selector en cada serie registrada</div>
        </div>
        <select id="cfg-intensity" class="settings-select">
          <option value="rir" ${s.intensityMode === 'rir' ? 'selected' : ''}>RIR (Reps en recámara)</option>
          <option value="rpe" ${s.intensityMode === 'rpe' ? 'selected' : ''}>RPE (Esfuerzo percibido)</option>
          <option value="none" ${s.intensityMode === 'none' ? 'selected' : ''}>Ninguno (Solo peso y reps)</option>
        </select>
      </div>

      <div class="settings-item">
        <div>
          <div class="settings-label">Fórmula de 1RM estimado</div>
          <div class="settings-sublabel">Epley: peso*(1+reps/30) | Brzycki: peso*36/(37-reps)</div>
        </div>
        <select id="cfg-formula" class="settings-select">
          <option value="epley" ${s.e1rmFormula === 'epley' ? 'selected' : ''}>Epley (Estándar)</option>
          <option value="brzycki" ${s.e1rmFormula === 'brzycki' ? 'selected' : ''}>Brzycki</option>
        </select>
      </div>

      <div class="settings-item">
        <div>
          <div class="settings-label">Incremento estándar (Paso +/-)</div>
          <div class="settings-sublabel">Salto por pulsación de botón</div>
        </div>
        <select id="cfg-step" class="settings-select">
          <option value="1" ${s.weightStep === 1 ? 'selected' : ''}>1.0 ${s.unit}</option>
          <option value="2" ${s.weightStep === 2 ? 'selected' : ''}>2.0 ${s.unit}</option>
          <option value="2.5" ${s.weightStep === 2.5 ? 'selected' : ''}>2.5 ${s.unit} (Recomendado)</option>
          <option value="5" ${s.weightStep === 5 ? 'selected' : ''}>5.0 ${s.unit}</option>
        </select>
      </div>
    </div>

    <!-- GRUPO: AUDIO, HÁPTICOS Y PANTALLA -->
    <div class="settings-group">
      <div class="settings-item">
        <div>
          <div class="settings-label">Alerta sonora de descanso</div>
          <div class="settings-sublabel">Sintetizador Web Audio API</div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button type="button" class="btn btn-secondary" id="btn-test-sound" style="min-height: 36px; padding: 0 10px; font-size: 0.75rem;">Probar</button>
          <input type="checkbox" id="cfg-sound" style="width: 24px; height: 24px; accent-color: var(--accent-primary);" ${s.soundEnabled ? 'checked' : ''}>
        </div>
      </div>

      <div class="settings-item">
        <div>
          <div class="settings-label">Respuesta háptica (Vibración)</div>
          <div class="settings-sublabel">Vibrate API + Switch Taptic en iOS</div>
        </div>
        <div style="display: flex; gap: 8px; align-items: center;">
          <button type="button" class="btn btn-secondary" id="btn-test-haptic" style="min-height: 36px; padding: 0 10px; font-size: 0.75rem;">Probar</button>
          <input type="checkbox" id="cfg-haptic" style="width: 24px; height: 24px; accent-color: var(--accent-primary);" ${s.hapticEnabled ? 'checked' : ''}>
        </div>
      </div>

      <div class="settings-item">
        <div>
          <div class="settings-label">Mantener pantalla encendida</div>
          <div class="settings-sublabel">Screen Wake Lock durante entrenamientos activos</div>
        </div>
        <input type="checkbox" id="cfg-wakelock" style="width: 24px; height: 24px; accent-color: var(--accent-primary);" ${s.wakeLockEnabled ? 'checked' : ''}>
      </div>
    </div>

    <!-- GRUPO: RESPALDO Y EXPORTACIÓN -->
    <div class="settings-group">
      <div class="settings-item" style="flex-direction: column; align-items: stretch; gap: 10px;">
        <div>
          <div class="settings-label">Copia de seguridad y exportación</div>
          <div class="settings-sublabel">Tus datos nunca salen de tu dispositivo</div>
        </div>

        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-secondary btn-full" id="btn-export-csv" style="font-size: 0.85rem;">
            Exportar CSV
          </button>
          <button type="button" class="btn btn-primary btn-full" id="btn-export-json" style="font-size: 0.85rem;">
            Exportar JSON (Completo)
          </button>
        </div>

        <div style="margin-top: 6px;">
          <input type="file" id="input-import-json" accept=".json" style="display: none;">
          <button type="button" class="btn btn-secondary btn-full" id="btn-trigger-import" style="font-size: 0.85rem;">
            Restaurar respaldo JSON
          </button>
        </div>
      </div>
    </div>

    <!-- GRUPO: ZONA DE PELIGRO -->
    <div class="settings-group">
      <div class="settings-item">
        <div>
          <div class="settings-label" style="color: var(--accent-danger);">Restablecer aplicación</div>
          <div class="settings-sublabel">Borra sesiones e inicializa la biblioteca</div>
        </div>
        <button type="button" class="btn btn-danger" id="btn-reset-app" style="font-size: 0.8rem; min-height: 40px;">
          Borrar todo
        </button>
      </div>
    </div>
  `;

  // Listeners de configuración
  container.querySelector('#cfg-unit').addEventListener('change', (e) => {
    state.saveSettings({ unit: e.target.value });
    renderSettingsView(container);
  });

  container.querySelector('#cfg-intensity').addEventListener('change', (e) => {
    state.saveSettings({ intensityMode: e.target.value });
  });

  container.querySelector('#cfg-formula').addEventListener('change', (e) => {
    state.saveSettings({ e1rmFormula: e.target.value });
  });

  container.querySelector('#cfg-step').addEventListener('change', (e) => {
    state.saveSettings({ weightStep: parseFloat(e.target.value) });
  });

  container.querySelector('#cfg-sound').addEventListener('change', (e) => {
    state.saveSettings({ soundEnabled: e.target.checked });
  });

  container.querySelector('#cfg-haptic').addEventListener('change', (e) => {
    state.saveSettings({ hapticEnabled: e.target.checked });
  });

  container.querySelector('#cfg-wakelock').addEventListener('change', (e) => {
    state.saveSettings({ wakeLockEnabled: e.target.checked });
  });

  // Botón probar sonido
  container.querySelector('#btn-test-sound').addEventListener('click', () => {
    unlockAudio();
    playTimerFinishSound();
  });

  // Botón probar háptico
  container.querySelector('#btn-test-haptic').addEventListener('click', () => {
    triggerHaptic('success');
  });

  // Exportar CSV
  container.querySelector('#btn-export-csv').addEventListener('click', () => {
    triggerHaptic('light');
    exportHistoryToCSV();
  });

  // Exportar JSON
  container.querySelector('#btn-export-json').addEventListener('click', () => {
    triggerHaptic('light');
    exportFullBackupJSON();
  });

  // Importar JSON
  const fileInput = container.querySelector('#input-import-json');
  container.querySelector('#btn-trigger-import').addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      importBackupJSON(file, () => {
        alert('Copia de respaldo restaurada con éxito.');
        renderSettingsView(container);
      });
    }
  });

  // Borrar todo
  container.querySelector('#btn-reset-app').addEventListener('click', async () => {
    triggerHaptic('heavy');
    if (confirm('¿ATENCIÓN: Borrar todos los entrenamientos e historial de la app? Esta acción no se puede deshacer.')) {
      await dbClear('sessions');
      await dbClear('templates');
      await dbClear('exercises');
      state.sessions = [];
      localStorage.clear();
      await state.init();
      alert('Aplicación restablecida con éxito.');
      state.setTab('workout');
    }
  });
}

// Helper: Exportar CSV de series
function exportHistoryToCSV() {
  const sessions = state.sessions || [];
  if (sessions.length === 0) {
    alert('No hay sesiones registradas para exportar.');
    return;
  }

  const rows = [
    ['Fecha', 'Hora', 'Rutina', 'Ejercicio', 'Grupo', 'Tipo', 'Peso', 'Unidad', 'Reps', 'RIR', 'e1RM', 'Notas']
  ];

  for (const s of sessions) {
    const d = new Date(s.fecha || s.inicio);
    const dateStr = d.toISOString().split('T')[0];
    const timeStr = d.toTimeString().split(' ')[0];
    const tmplName = s.templateName || 'Sesion libre';

    for (const ex of s.exercises || []) {
      const exData = state.exercises.find(e => e.id === ex.exerciseId) || { nombre: 'Ejercicio', grupoPrimario: '' };
      for (const set of ex.sets || []) {
        if (!set.completed && !set.peso) continue;
        const e1rm = calculateE1RM(set.peso, set.reps, state.settings.e1rmFormula).e1rm;
        rows.push([
          dateStr,
          timeStr,
          `"${tmplName}"`,
          `"${exData.nombre}"`,
          exData.grupoPrimario,
          set.tipo || 'efectiva',
          set.peso,
          state.settings.unit,
          set.reps,
          set.rir !== undefined ? set.rir : '',
          e1rm,
          `"${ex.sessionNotes || ''}"`
        ]);
      }
    }
  }

  const csvContent = '\uFEFF' + rows.map(r => r.join(',')).join('\n');
  downloadOrShareFile(csvContent, `tracker_historial_${Date.now()}.csv`, 'text/csv');
}

// Helper: Exportar JSON completo
async function exportFullBackupJSON() {
  const fullBackup = {
    version: '1.0.0',
    exportDate: new Date().toISOString(),
    settings: state.settings,
    exercises: await dbGetAll('exercises'),
    templates: await dbGetAll('templates'),
    sessions: await dbGetAll('sessions')
  };

  const jsonStr = JSON.stringify(fullBackup, null, 2);
  downloadOrShareFile(jsonStr, `tracker_respaldo_${Date.now()}.json`, 'application/json');
}

// Helper: Descargar o compartir archivo en iOS
function downloadOrShareFile(content, fileName, mimeType) {
  const blob = new Blob([content], { type: mimeType });

  // Web Share API en iOS si es compatible con archivos
  if (navigator.canShare && navigator.canShare({ files: [new File([blob], fileName, { type: mimeType })] })) {
    const file = new File([blob], fileName, { type: mimeType });
    navigator.share({
      files: [file],
      title: 'Tracker - Respaldo',
      text: 'Respaldo de entrenamientos de Tracker'
    }).catch((err) => {
      console.log('WebShare cancelado o error:', err);
      fallbackDownload(blob, fileName);
    });
  } else {
    fallbackDownload(blob, fileName);
  }
}

function fallbackDownload(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 300);
}

// Helper: Importar archivo JSON
function importBackupJSON(file, onDone) {
  const reader = new FileReader();
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.sessions && !data.exercises) {
        alert('El archivo no parece ser un respaldo válido de Tracker.');
        return;
      }

      if (data.settings) {
        state.saveSettings(data.settings);
      }

      if (Array.isArray(data.exercises)) {
        for (const ex of data.exercises) {
          await dbPut('exercises', ex);
        }
        state.exercises = await dbGetAll('exercises');
      }

      if (Array.isArray(data.templates)) {
        for (const tmpl of data.templates) {
          await dbPut('templates', tmpl);
        }
        state.templates = await dbGetAll('templates');
      }

      if (Array.isArray(data.sessions)) {
        for (const sess of data.sessions) {
          await dbPut('sessions', sess);
        }
        state.sessions = await dbGetAll('sessions');
      }

      if (typeof onDone === 'function') onDone();
    } catch (err) {
      alert('Error al leer el archivo JSON: ' + err.message);
    }
  };
  reader.readAsText(file);
}
