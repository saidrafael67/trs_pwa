// Vista: Gestor y Creador de Plantillas / Rutinas
import { state } from '../state.js';
import { triggerHaptic, generateId } from '../utils.js';

export function renderRoutinesView(container) {
  const templates = state.templates || [];

  const cardsHtml = templates.map(tmpl => {
    const exCount = (tmpl.ejercicios || []).length;
    const exercisesPreview = (tmpl.ejercicios || []).slice(0, 4).map(item => {
      const exData = state.exercises.find(e => e.id === item.exerciseId) || { nombre: 'Ejercicio' };
      return `<li class="routine-exercise-item">
        <span>${exData.nombre}</span>
        <span style="color: var(--accent-primary); font-weight: 700;">${item.targetSets} × ${item.minReps}-${item.maxReps}</span>
      </li>`;
    }).join('');

    return `
      <div class="routine-card" data-tmpl-id="${tmpl.id}">
        <div class="routine-header">
          <div>
            <h3 style="font-size: 1.2rem; font-weight: 900; color: #fff;">${tmpl.nombre}</h3>
            <p style="font-size: 0.82rem; color: var(--text-muted); margin-top: 2px;">${tmpl.descripcion || `${exCount} ejercicios`}</p>
          </div>
          <span class="badge primary-muscle">${exCount} ejercicios</span>
        </div>

        <ul class="routine-exercise-list">
          ${exercisesPreview}
          ${exCount > 4 ? `<li style="font-size: 0.75rem; color: var(--text-muted); padding-top: 4px;">+ ${exCount - 4} ejercicios más...</li>` : ''}
        </ul>

        <div style="display: flex; gap: 8px; margin-top: 14px;">
          <button type="button" class="btn btn-primary btn-start-tmpl" style="flex: 2;" data-tmpl-id="${tmpl.id}">
            Entrenar
          </button>
          <button type="button" class="btn btn-secondary btn-icon btn-edit-tmpl" data-tmpl-id="${tmpl.id}" title="Editar rutina">
            ✏️
          </button>
          <button type="button" class="btn btn-secondary btn-icon btn-copy-tmpl" data-tmpl-id="${tmpl.id}" title="Duplicar rutina">
            📋
          </button>
          <button type="button" class="btn btn-danger btn-icon btn-delete-tmpl" data-tmpl-id="${tmpl.id}" title="Eliminar rutina">
            🗑
          </button>
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
      <div>
        <h2 style="font-size: 1.35rem; font-weight: 900;">Mis Rutinas</h2>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">${templates.length} plantillas disponibles</p>
      </div>
      <button type="button" class="btn btn-primary" id="btn-create-routine">
        + Nueva
      </button>
    </div>

    ${cardsHtml}
  `;

  // Iniciar sesión con la rutina
  container.querySelectorAll('.btn-start-tmpl').forEach(btn => {
    btn.addEventListener('click', async () => {
      triggerHaptic('medium');
      const id = btn.getAttribute('data-tmpl-id');
      const tmpl = templates.find(t => t.id === id);
      await state.startSession(tmpl);
      state.setTab('workout');
    });
  });

  // Editar rutina
  container.querySelectorAll('.btn-edit-tmpl').forEach(btn => {
    btn.addEventListener('click', () => {
      triggerHaptic('light');
      const id = btn.getAttribute('data-tmpl-id');
      const tmpl = templates.find(t => t.id === id);
      openRoutineEditorModal(tmpl, container);
    });
  });

  // Duplicar rutina
  container.querySelectorAll('.btn-copy-tmpl').forEach(btn => {
    btn.addEventListener('click', async () => {
      triggerHaptic('light');
      const id = btn.getAttribute('data-tmpl-id');
      const tmpl = templates.find(t => t.id === id);
      if (tmpl) {
        const copy = JSON.parse(JSON.stringify(tmpl));
        copy.id = generateId('tmpl');
        copy.nombre = `${copy.nombre} (Copia)`;
        await state.addTemplate(copy);
        renderRoutinesView(container);
      }
    });
  });

  // Eliminar rutina
  container.querySelectorAll('.btn-delete-tmpl').forEach(btn => {
    btn.addEventListener('click', async () => {
      triggerHaptic('heavy');
      const id = btn.getAttribute('data-tmpl-id');
      const tmpl = templates.find(t => t.id === id);
      if (confirm(`¿Eliminar la rutina "${tmpl.nombre}"?`)) {
        await state.deleteTemplate(id);
        renderRoutinesView(container);
      }
    });
  });

  // Crear nueva rutina
  container.querySelector('#btn-create-routine').addEventListener('click', () => {
    triggerHaptic('light');
    openRoutineEditorModal(null, container);
  });
}

function openRoutineEditorModal(existingTmpl, mainContainer) {
  const isEditing = Boolean(existingTmpl);
  const tmpl = isEditing ? JSON.parse(JSON.stringify(existingTmpl)) : {
    id: generateId('tmpl'),
    nombre: 'Nueva rutina',
    descripcion: '',
    ejercicios: []
  };

  const modal = document.createElement('div');
  modal.className = 'modal-overlay';

  modal.innerHTML = `
    <div class="modal-sheet" style="height: 90vh;">
      <div class="modal-handle"></div>
      <div class="modal-header">
        <h3 class="card-title">${isEditing ? 'Editar Rutina' : 'Crear Rutina'}</h3>
        <button type="button" class="btn btn-secondary btn-icon" id="editor-close" style="width: 40px; height: 40px;">✕</button>
      </div>

      <div class="modal-body" style="flex: 1; display: flex; flex-direction: column;">
        <div style="margin-bottom: 12px;">
          <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Nombre de la rutina</label>
          <input type="text" id="editor-name" class="stepper-input" style="width: 100%; height: 46px; background: var(--bg-surface-2); border-radius: 10px; border: 1px solid var(--border-subtle); padding: 0 14px; text-align: left; font-size: 1.1rem; margin-top: 4px;" value="${tmpl.nombre}">
        </div>

        <div style="margin-bottom: 14px;">
          <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Descripción</label>
          <input type="text" id="editor-desc" class="stepper-input" style="width: 100%; height: 42px; background: var(--bg-surface-2); border-radius: 10px; border: 1px solid var(--border-subtle); padding: 0 14px; text-align: left; font-size: 0.9rem; margin-top: 4px;" placeholder="Ej. Lunes y Jueves, pectoral y tríceps..." value="${tmpl.descripcion || ''}">
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <label style="font-size: 0.8rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Ejercicios de la rutina</label>
          <button type="button" class="btn btn-secondary" id="editor-add-ex" style="min-height: 36px; padding: 0 12px; font-size: 0.85rem;">
            + Añadir ejercicio
          </button>
        </div>

        <div id="editor-exercises-list" style="flex: 1; overflow-y: auto;"></div>

        <div style="display: flex; gap: 8px; margin-top: 14px;">
          <button type="button" class="btn btn-secondary btn-full" id="editor-cancel">Cancelar</button>
          <button type="button" class="btn btn-primary btn-full" id="editor-save">Guardar rutina</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  const nameInput = modal.querySelector('#editor-name');
  const descInput = modal.querySelector('#editor-desc');
  const exListContainer = modal.querySelector('#editor-exercises-list');
  const addExBtn = modal.querySelector('#editor-add-ex');
  const saveBtn = modal.querySelector('#editor-save');
  const cancelBtn = modal.querySelector('#editor-cancel');
  const closeBtn = modal.querySelector('#editor-close');

  const renderExList = () => {
    if (tmpl.ejercicios.length === 0) {
      exListContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 30px;">Añade al menos un ejercicio a esta rutina.</div>';
      return;
    }

    exListContainer.innerHTML = tmpl.ejercicios.map((item, idx) => {
      const exData = state.exercises.find(e => e.id === item.exerciseId) || { nombre: 'Ejercicio' };
      return `
        <div class="card" style="margin-bottom: 8px; padding: 12px;" data-idx="${idx}">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <strong style="color: #fff; font-size: 0.95rem;">${idx + 1}. ${exData.nombre}</strong>
            <div style="display: flex; gap: 4px;">
              <button type="button" class="btn btn-secondary btn-icon btn-move-up" data-idx="${idx}" style="width: 32px; height: 32px;" ${idx === 0 ? 'disabled' : ''}>▲</button>
              <button type="button" class="btn btn-secondary btn-icon btn-move-down" data-idx="${idx}" style="width: 32px; height: 32px;" ${idx === tmpl.ejercicios.length - 1 ? 'disabled' : ''}>▼</button>
              <button type="button" class="btn btn-danger btn-icon btn-remove" data-idx="${idx}" style="width: 32px; height: 32px;">✕</button>
            </div>
          </div>

          <!-- Configuración de series, rango de reps y RIR -->
          <div style="display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: 8px; font-size: 0.8rem;">
            <div>
              <span style="color: var(--text-muted);">Series:</span>
              <input type="number" class="stepper-input cfg-sets" data-idx="${idx}" value="${item.targetSets || 3}" style="width: 100%; height: 36px; background: var(--bg-surface-2); border-radius: 6px; border: 1px solid var(--border-subtle);">
            </div>
            <div>
              <span style="color: var(--text-muted);">Reps (min-max):</span>
              <div style="display: flex; gap: 4px;">
                <input type="number" class="stepper-input cfg-min-reps" data-idx="${idx}" value="${item.minReps || 8}" style="width: 50%; height: 36px; background: var(--bg-surface-2); border-radius: 6px; border: 1px solid var(--border-subtle);">
                <input type="number" class="stepper-input cfg-max-reps" data-idx="${idx}" value="${item.maxReps || 10}" style="width: 50%; height: 36px; background: var(--bg-surface-2); border-radius: 6px; border: 1px solid var(--border-subtle);">
              </div>
            </div>
            <div>
              <span style="color: var(--text-muted);">RIR Meta:</span>
              <input type="number" class="stepper-input cfg-rir" data-idx="${idx}" value="${item.targetRir !== undefined ? item.targetRir : 2}" style="width: 100%; height: 36px; background: var(--bg-surface-2); border-radius: 6px; border: 1px solid var(--border-subtle);">
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Reordenar botones
    exListContainer.querySelectorAll('.btn-move-up').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHaptic('light');
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (idx > 0) {
          const temp = tmpl.ejercicios[idx];
          tmpl.ejercicios[idx] = tmpl.ejercicios[idx - 1];
          tmpl.ejercicios[idx - 1] = temp;
          renderExList();
        }
      });
    });

    exListContainer.querySelectorAll('.btn-move-down').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHaptic('light');
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        if (idx < tmpl.ejercicios.length - 1) {
          const temp = tmpl.ejercicios[idx];
          tmpl.ejercicios[idx] = tmpl.ejercicios[idx + 1];
          tmpl.ejercicios[idx + 1] = temp;
          renderExList();
        }
      });
    });

    exListContainer.querySelectorAll('.btn-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        triggerHaptic('light');
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        tmpl.ejercicios.splice(idx, 1);
        renderExList();
      });
    });

    // Inputs de configuración
    exListContainer.querySelectorAll('.cfg-sets').forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = parseInt(inp.getAttribute('data-idx'), 10);
        tmpl.ejercicios[idx].targetSets = parseInt(inp.value, 10) || 3;
      });
    });

    exListContainer.querySelectorAll('.cfg-min-reps').forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = parseInt(inp.getAttribute('data-idx'), 10);
        tmpl.ejercicios[idx].minReps = parseInt(inp.value, 10) || 8;
      });
    });

    exListContainer.querySelectorAll('.cfg-max-reps').forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = parseInt(inp.getAttribute('data-idx'), 10);
        tmpl.ejercicios[idx].maxReps = parseInt(inp.value, 10) || 10;
      });
    });

    exListContainer.querySelectorAll('.cfg-rir').forEach(inp => {
      inp.addEventListener('change', () => {
        const idx = parseInt(inp.getAttribute('data-idx'), 10);
        tmpl.ejercicios[idx].targetRir = parseInt(inp.value, 10) || 2;
      });
    });
  };

  addExBtn.addEventListener('click', () => {
    // Reutilizar selector de ejercicio
    triggerHaptic('light');
    import('./workout.js').then(({ renderWorkoutView }) => {
      // Abrir modal de biblioteca
      const picker = document.createElement('div');
      picker.className = 'modal-overlay';
      picker.style.zIndex = '250';
      picker.innerHTML = `
        <div class="modal-sheet" style="height: 80vh;">
          <div class="modal-header">
            <h3 class="card-title">Añadir a la rutina</h3>
            <button type="button" class="btn btn-secondary btn-icon" id="picker2-close" style="width: 40px; height: 40px;">✕</button>
          </div>
          <div class="modal-body" style="flex: 1;">
            ${state.exercises.map(e => `
              <div class="card p-ex-item" data-ex-id="${e.id}" style="margin-bottom: 8px; padding: 10px; cursor: pointer;">
                <div style="font-weight: 700; color: #fff;">${e.nombre}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${e.grupoPrimario} • ${e.equipo}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
      document.body.appendChild(picker);

      picker.querySelector('#picker2-close').addEventListener('click', () => picker.remove());
      picker.querySelectorAll('.p-ex-item').forEach(item => {
        item.addEventListener('click', () => {
          const id = item.getAttribute('data-ex-id');
          tmpl.ejercicios.push({
            exerciseId: id,
            targetSets: 3,
            minReps: 8,
            maxReps: 10,
            targetRir: 2
          });
          picker.remove();
          renderExList();
        });
      });
    });
  });

  const closeModal = () => modal.remove();
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  saveBtn.addEventListener('click', async () => {
    triggerHaptic('success');
    tmpl.nombre = nameInput.value.trim() || 'Rutina sin nombre';
    tmpl.descripcion = descInput.value.trim();

    if (isEditing) {
      await state.updateTemplate(tmpl);
    } else {
      await state.addTemplate(tmpl);
    }

    closeModal();
    renderRoutinesView(mainContainer);
  });

  renderExList();
}
