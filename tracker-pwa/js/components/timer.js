// Componente: Barra flotante de temporizador de descanso
import { state } from '../state.js';
import { formatSecondsToTimer, triggerHaptic } from '../utils.js';

let timerContainer = null;

export function initTimerComponent() {
  if (timerContainer) return;

  timerContainer = document.createElement('div');
  timerContainer.className = 'rest-timer-bar';
  timerContainer.style.display = 'none';

  timerContainer.innerHTML = `
    <div class="timer-countdown">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
        <circle cx="12" cy="12" r="10"></circle>
        <polyline points="12 6 12 12 16 14"></polyline>
      </svg>
      <span id="timer-text">0:00</span>
    </div>
    <div class="timer-controls">
      <button type="button" class="timer-btn-adjust" id="timer-minus-15">-15s</button>
      <button type="button" class="timer-btn-adjust" id="timer-plus-15">+15s</button>
      <button type="button" class="timer-btn-adjust" id="timer-skip" style="color: var(--accent-warning); font-weight: 800;">Saltar</button>
    </div>
  `;

  document.body.appendChild(timerContainer);

  const timerText = timerContainer.querySelector('#timer-text');
  const btnMinus = timerContainer.querySelector('#timer-minus-15');
  const btnPlus = timerContainer.querySelector('#timer-plus-15');
  const btnSkip = timerContainer.querySelector('#timer-skip');

  btnMinus.addEventListener('click', () => {
    triggerHaptic('light');
    state.adjustTimer(-15);
  });

  btnPlus.addEventListener('click', () => {
    triggerHaptic('light');
    state.adjustTimer(15);
  });

  btnSkip.addEventListener('click', () => {
    triggerHaptic('medium');
    state.stopTimer();
  });

  state.subscribe('timer_started', (timer) => {
    timerContainer.style.display = 'flex';
    timerText.textContent = formatSecondsToTimer(timer.remainingSeconds);
  });

  state.subscribe('timer_tick', (timer) => {
    if (timer.active) {
      timerContainer.style.display = 'flex';
      timerText.textContent = formatSecondsToTimer(timer.remainingSeconds);
    }
  });

  state.subscribe('timer_stopped', () => {
    timerContainer.style.display = 'none';
  });

  state.subscribe('timer_finished', () => {
    timerContainer.style.display = 'none';
  });
}
