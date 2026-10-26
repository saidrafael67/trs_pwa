// Componente: Modal de Calculadora Gráfica de Discos
import { calculatePlates } from '../modules/plates.js';
import { state } from '../state.js';
import { triggerHaptic } from '../utils.js';

let modalOverlay = null;

export function openPlateCalculator(initialWeight = 60, onApplyWeight = null) {
  if (modalOverlay) {
    modalOverlay.remove();
  }

  let currentTargetWeight = Number(initialWeight) || 60;
  let currentBarWeight = state.settings.barWeight || 20;

  modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';

  modalOverlay.innerHTML = `
    <div class="modal-sheet">
      <div class="modal-handle"></div>
      <div class="modal-header">
        <h3 class="card-title" style="font-size: 1.25rem;">Calculadora de Discos</h3>
        <button type="button" class="btn btn-secondary btn-icon" id="plate-modal-close" style="width: 40px; height: 40px;">✕</button>
      </div>

      <div class="modal-body">
        <div style="display: flex; gap: 12px; margin-bottom: 14px; align-items: center;">
          <div style="flex: 1;">
            <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Peso Total (${state.settings.unit})</label>
            <input type="text" inputmode="decimal" id="plate-target-input" class="stepper-input" style="background: var(--bg-surface-2); border-radius: 10px; height: 48px; width: 100%; border: 1px solid var(--border-subtle); margin-top: 4px;" value="${currentTargetWeight}">
          </div>
          <div>
            <label style="font-size: 0.75rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase;">Barra</label>
            <select id="plate-bar-select" class="settings-select" style="height: 48px; margin-top: 4px;">
              <option value="20" ${currentBarWeight === 20 ? 'selected' : ''}>20 ${state.settings.unit} (Olímpica)</option>
              <option value="15" ${currentBarWeight === 15 ? 'selected' : ''}>15 ${state.settings.unit} (Olímpica)</option>
              <option value="10" ${currentBarWeight === 10 ? 'selected' : ''}>10 ${state.settings.unit}</option>
              <option value="0" ${currentBarWeight === 0 ? 'selected' : ''}>0 (Máquina / Multipower)</option>
            </select>
          </div>
        </div>

        <!-- Visualizador gráfico SVG de la barra -->
        <div class="barbell-visualizer" id="barbell-visualizer-container"></div>

        <!-- Resumen textual de discos por lado -->
        <div id="plates-breakdown-container" style="margin: 12px 0;"></div>

        <div style="display: flex; gap: 8px; margin-top: 16px;">
          <button type="button" class="btn btn-secondary btn-full" id="plate-modal-cancel">Cerrar</button>
          <button type="button" class="btn btn-primary btn-full" id="plate-modal-apply">Usar ${currentTargetWeight} ${state.settings.unit}</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  const targetInput = modalOverlay.querySelector('#plate-target-input');
  const barSelect = modalOverlay.querySelector('#plate-bar-select');
  const visualizer = modalOverlay.querySelector('#barbell-visualizer-container');
  const breakdownContainer = modalOverlay.querySelector('#plates-breakdown-container');
  const applyBtn = modalOverlay.querySelector('#plate-modal-apply');
  const closeBtn = modalOverlay.querySelector('#plate-modal-close');
  const cancelBtn = modalOverlay.querySelector('#plate-modal-cancel');

  const renderCalculation = () => {
    const calculation = calculatePlates(
      currentTargetWeight,
      currentBarWeight,
      state.settings.plateInventory
    );

    applyBtn.textContent = `Usar ${calculation.totalAchieved} ${state.settings.unit}`;

    // Renderizar gráfico visual de manga y discos
    visualizer.innerHTML = '';
    const barSvg = document.createElement('div');
    barSvg.style.display = 'flex';
    barSvg.style.alignItems = 'center';
    barSvg.style.height = '100%';

    // Manga izquierda / barra central
    const barShaft = document.createElement('div');
    barShaft.style.width = '70px';
    barShaft.style.height = '16px';
    barShaft.style.background = 'linear-gradient(180deg, #f1f5f9, #94a3b8)';
    barShaft.style.borderRadius = '3px 0 0 3px';
    barSvg.appendChild(barShaft);

    // Collar interior
    const collar = document.createElement('div');
    collar.className = 'barbell-collar';
    barSvg.appendChild(collar);

    // Discos por lado
    if (calculation.platesPerSide.length === 0) {
      const emptyNote = document.createElement('div');
      emptyNote.style.color = 'var(--text-muted)';
      emptyNote.style.fontSize = '0.8rem';
      emptyNote.style.marginLeft = '12px';
      emptyNote.textContent = 'Barra vacía';
      barSvg.appendChild(emptyNote);
    } else {
      calculation.platesPerSide.forEach((plateWeight) => {
        const meta = calculation.platesWithMeta.find(m => m.weight === plateWeight) || {
          color: '#78909c',
          textColor: '#fff',
          heightRatio: 0.5
        };
        const plateEl = document.createElement('div');
        plateEl.className = 'barbell-plate';
        plateEl.style.width = '18px';
        const h = Math.round(110 * meta.heightRatio);
        plateEl.style.height = `${h}px`;
        plateEl.style.backgroundColor = meta.color;
        plateEl.style.color = meta.textColor;
        plateEl.textContent = plateWeight;
        barSvg.appendChild(plateEl);
      });
    }

    // Extremo de la barra
    const sleeveEnd = document.createElement('div');
    sleeveEnd.style.width = '30px';
    sleeveEnd.style.height = '16px';
    sleeveEnd.style.background = 'linear-gradient(180deg, #cbd5e1, #64748b)';
    sleeveEnd.style.borderRadius = '0 3px 3px 0';
    barSvg.appendChild(sleeveEnd);

    visualizer.appendChild(barSvg);

    // Resumen de discos
    if (calculation.platesWithMeta.length > 0) {
      const listHtml = calculation.platesWithMeta
        .map(p => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="display: inline-block; width: 14px; height: 14px; border-radius: 3px; background: ${p.color};"></span>
              <span style="font-weight: 700;">Disco de ${p.weight} ${state.settings.unit}</span>
            </div>
            <span style="font-weight: 900; color: var(--accent-primary); font-size: 1.05rem;">x${p.count} por lado</span>
          </div>
        `).join('');

      let diffWarning = '';
      if (!calculation.exact) {
        diffWarning = `
          <div style="margin-top: 8px; padding: 8px; border-radius: 8px; background: rgba(255,179,0,0.15); color: var(--accent-warning); font-size: 0.8rem;">
            ⚠️ Peso exacto no alcanzable con los discos actuales. Más cercano: <strong>${calculation.totalAchieved} ${state.settings.unit}</strong> (diferencia: ${Math.abs(calculation.difference)} ${state.settings.unit}).
          </div>
        `;
      }

      breakdownContainer.innerHTML = `
        <div style="font-size: 0.82rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Por cada lado:</div>
        ${listHtml}
        ${diffWarning}
      `;
    } else {
      breakdownContainer.innerHTML = `
        <div style="text-align: center; color: var(--text-muted); padding: 12px; font-size: 0.9rem;">
          Solo barra (${currentBarWeight} ${state.settings.unit})
        </div>
      `;
    }
  };

  targetInput.addEventListener('input', () => {
    const val = parseFloat(targetInput.value.replace(',', '.'));
    if (!isNaN(val)) {
      currentTargetWeight = val;
      renderCalculation();
    }
  });

  barSelect.addEventListener('change', () => {
    currentBarWeight = Number(barSelect.value);
    state.saveSettings({ barWeight: currentBarWeight });
    renderCalculation();
  });

  const closeModal = () => {
    if (modalOverlay) {
      modalOverlay.remove();
      modalOverlay = null;
    }
  };

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  applyBtn.addEventListener('click', () => {
    triggerHaptic('medium');
    const calculation = calculatePlates(
      currentTargetWeight,
      currentBarWeight,
      state.settings.plateInventory
    );
    if (typeof onApplyWeight === 'function') {
      onApplyWeight(calculation.totalAchieved);
    }
    closeModal();
  });

  renderCalculation();
}
