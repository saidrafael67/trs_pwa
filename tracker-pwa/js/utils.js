// Utilidades para audio Web Audio API, hápticos iOS/Android, WakeLock y formato

// --- AUDIO WEB AUDIO API (iOS Safari compatible) ---
let audioCtx = null;
let isAudioUnlocked = false;

/**
 * Desbloquea el AudioContext con el primer toque del usuario (requerido por Safari iOS)
 */
export function unlockAudio() {
  if (isAudioUnlocked && audioCtx && audioCtx.state === 'running') return;

  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Tocar un buffer silencioso para desbloquear el canal de audio de iOS
    const buffer = audioCtx.createBuffer(1, 1, 22050);
    const source = audioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioCtx.destination);
    source.start(0);

    isAudioUnlocked = true;
    console.log('[Audio] AudioContext desbloqueado con éxito para iOS.');
  } catch (e) {
    console.warn('[Audio] No se pudo desbloquear AudioContext:', e);
  }
}

/**
 * Reproduce un tono sintetizado nítido con envolvente suave (sin pops)
 * @param {number} freq - Frecuencia en Hz (ej. 880, 1200)
 * @param {number} duration - Duración en segundos (ej. 0.15)
 * @param {'sine'|'triangle'|'square'} [type='sine']
 */
export function playTone(freq = 880, duration = 0.15, type = 'sine') {
  try {
    if (!audioCtx) unlockAudio();
    if (!audioCtx) return;

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    // Envolvente ADSR suave
    gain.gain.setValueAtTime(0.001, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.3, audioCtx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn('[Audio] Error al reproducir tono:', e);
  }
}

/**
 * Sonido de fin de descanso (secuencia de 3 beeps ascendentes)
 */
export function playTimerFinishSound() {
  playTone(800, 0.1, 'triangle');
  setTimeout(() => playTone(1000, 0.1, 'triangle'), 150);
  setTimeout(() => playTone(1400, 0.35, 'triangle'), 300);
}

// --- HÁPTICOS (navigator.vibrate + Switch Checkbox Hack para iOS 17.4+) ---
let hiddenSwitchEl = null;

function getHiddenSwitchElement() {
  if (hiddenSwitchEl) return hiddenSwitchEl;
  try {
    hiddenSwitchEl = document.createElement('input');
    hiddenSwitchEl.type = 'checkbox';
    // Atributo estándar experimental de switch para WebKit iOS 17.4+
    hiddenSwitchEl.setAttribute('switch', '');
    hiddenSwitchEl.style.position = 'fixed';
    hiddenSwitchEl.style.opacity = '0';
    hiddenSwitchEl.style.pointerEvents = 'none';
    hiddenSwitchEl.style.top = '-9999px';
    hiddenSwitchEl.style.left = '-9999px';
    document.body.appendChild(hiddenSwitchEl);
  } catch {
    // ignorar
  }
  return hiddenSwitchEl;
}

/**
 * Dispara retroalimentación háptica en modo "mejor esfuerzo"
 * @param {'light'|'medium'|'heavy'|'success'} [pattern='medium']
 */
export function triggerHaptic(pattern = 'medium') {
  // 1. Probar navigator.vibrate estándar (Android, navegadores compatibles)
  if (navigator.vibrate) {
    try {
      if (pattern === 'light') navigator.vibrate(25);
      else if (pattern === 'heavy') navigator.vibrate(70);
      else if (pattern === 'success') navigator.vibrate([40, 60, 60]);
      else navigator.vibrate(45);
      return;
    } catch {
      // continuar al truco de iOS
    }
  }

  // 2. Truco para iOS Safari (17.4+) con control switch
  try {
    const sw = getHiddenSwitchElement();
    if (sw) {
      sw.checked = !sw.checked;
      sw.dispatchEvent(new Event('change', { bubbles: true }));
    }
  } catch {
    // Degradar con gracia si no hay soporte
  }
}

// --- SCREEN WAKE LOCK API ---
let wakeLockSentinel = null;

export async function requestWakeLock() {
  if ('wakeLock' in navigator) {
    try {
      if (wakeLockSentinel && !wakeLockSentinel.released) return wakeLockSentinel;
      wakeLockSentinel = await navigator.wakeLock.request('screen');
      console.log('[WakeLock] Pantalla bloqueada contra suspensión.');
      wakeLockSentinel.addEventListener('release', () => {
        console.log('[WakeLock] Bloqueo liberado.');
        wakeLockSentinel = null;
      });
      return wakeLockSentinel;
    } catch (err) {
      console.warn('[WakeLock] No se pudo activar WakeLock:', err.name, err.message);
    }
  }
  return null;
}

export function releaseWakeLock() {
  if (wakeLockSentinel && !wakeLockSentinel.released) {
    try {
      wakeLockSentinel.release();
    } catch {
      // ignorar
    }
    wakeLockSentinel = null;
  }
}

// Re-adquirir WakeLock al volver a primer plano si una sesión está activa
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && window._appState && window._appState.activeSession) {
    if (window._appState.settings.wakeLockEnabled) {
      requestWakeLock();
    }
  }
});

// --- FORMATO Y HELPERS ---
export function formatSecondsToTimer(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

export function formatDateSpanish(dateInput) {
  const d = new Date(dateInput);
  return d.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

export function formatTimeSpanish(dateInput) {
  const d = new Date(dateInput);
  return d.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 7)}`;
}
