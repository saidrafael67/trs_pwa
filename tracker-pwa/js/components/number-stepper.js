// Componente reutilizable: Stepper numérico táctil de alto contraste
import { triggerHaptic } from '../utils.js';

/**
 * Renderiza o crea un stepper numérico con botones táctiles grandes (+/-)
 * @param {object} props
 * @param {number} props.value - Valor numérico inicial
 * @param {number} props.step - Incremento/decremento (ej. 2.5 o 1)
 * @param {number} [props.min=0] - Valor mínimo
 * @param {number} [props.max=999] - Valor máximo
 * @param {string} [props.unit=''] - Unidad opcional para mostrar
 * @param {Function} props.onChange - Callback cuando el valor cambia
 * @returns {HTMLElement}
 */
export function createNumberStepper({ value = 0, step = 1, min = 0, max = 999, unit = '', onChange }) {
  const container = document.createElement('div');
  container.className = 'stepper-container';

  let currentValue = Number(value) || 0;

  const btnMinus = document.createElement('button');
  btnMinus.type = 'button';
  btnMinus.className = 'stepper-btn';
  btnMinus.setAttribute('aria-label', 'Disminuir');
  btnMinus.innerHTML = '&minus;';

  const input = document.createElement('input');
  input.type = 'text';
  input.inputMode = 'decimal';
  input.className = 'stepper-input';
  input.value = currentValue;

  const btnPlus = document.createElement('button');
  btnPlus.type = 'button';
  btnPlus.className = 'stepper-btn';
  btnPlus.setAttribute('aria-label', 'Aumentar');
  btnPlus.innerHTML = '&plus;';

  const updateValue = (newVal, notify = true) => {
    currentValue = Math.min(max, Math.max(min, Math.round(newVal * 100) / 100));
    input.value = currentValue;
    if (notify && typeof onChange === 'function') {
      onChange(currentValue);
    }
  };

  btnMinus.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerHaptic('light');
    updateValue(currentValue - step);
  });

  btnPlus.addEventListener('click', (e) => {
    e.stopPropagation();
    triggerHaptic('light');
    updateValue(currentValue + step);
  });

  input.addEventListener('focus', () => {
    input.select();
  });

  input.addEventListener('change', () => {
    const parsed = parseFloat(input.value.replace(',', '.'));
    if (!isNaN(parsed)) {
      updateValue(parsed);
    } else {
      input.value = currentValue;
    }
  });

  container.appendChild(btnMinus);
  container.appendChild(input);
  container.appendChild(btnPlus);

  container.setValue = (val) => updateValue(val, false);
  container.getValue = () => currentValue;

  return container;
}
