// Punto de entrada principal (Bootstrap) - Fuerza PWA
import { state } from './state.js';
import { initTimerComponent } from './components/timer.js';
import { unlockAudio, triggerHaptic } from './utils.js';

import { renderWorkoutView } from './views/workout.js';
import { renderHistoryView } from './views/history.js';
import { renderProgressView } from './views/progress.js';
import { renderRoutinesView } from './views/routines.js';
import { renderSettingsView } from './views/settings.js';

let newWorker = null;

// Registro de Service Worker y detección de actualizaciones
function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').then((registration) => {
        console.log('[SW] Service Worker registrado con éxito en scope:', registration.scope);

        registration.addEventListener('updatefound', () => {
          newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // Hay una nueva versión lista
                showUpdateBanner();
              }
            });
          }
        });
      }).catch((err) => {
        console.warn('[SW] Fallo al registrar Service Worker:', err);
      });

      let refreshing = false;
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    });
  }
}

function showUpdateBanner() {
  const banner = document.getElementById('sw-update-banner');
  const btn = document.getElementById('sw-update-btn');
  if (banner && btn) {
    banner.classList.add('visible');
    btn.addEventListener('click', () => {
      if (newWorker) {
        newWorker.postMessage({ type: 'SKIP_WAITING' });
      }
    });
  }
}

// Router de pestañas
function setupNavigation() {
  const nav = document.getElementById('bottom-nav');
  const contentArea = document.getElementById('main-content');
  const statusIndicator = document.getElementById('header-status-indicator');

  const views = {
    workout: renderWorkoutView,
    history: renderHistoryView,
    progress: renderProgressView,
    routines: renderRoutinesView,
    settings: renderSettingsView
  };

  const renderCurrentTab = (tab) => {
    nav.querySelectorAll('.nav-item').forEach((btn) => {
      btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
    });

    const renderFn = views[tab] || views.workout;
    contentArea.scrollTop = 0;
    renderFn(contentArea);

    // Actualizar indicador de sesión activa
    if (statusIndicator) {
      statusIndicator.style.display = state.activeSession ? 'block' : 'none';
    }
  };

  nav.querySelectorAll('.nav-item').forEach((btn) => {
    btn.addEventListener('click', () => {
      triggerHaptic('light');
      unlockAudio();
      const tab = btn.getAttribute('data-tab');
      state.setTab(tab);
    });
  });

  state.subscribe('tab_changed', (tab) => {
    renderCurrentTab(tab);
  });

  state.subscribe('session_started', () => {
    if (statusIndicator) statusIndicator.style.display = 'block';
  });

  state.subscribe('session_finished', () => {
    if (statusIndicator) statusIndicator.style.display = 'none';
  });

  state.subscribe('session_cancelled', () => {
    if (statusIndicator) statusIndicator.style.display = 'none';
  });

  // Render inicial
  renderCurrentTab(state.currentTab);
}

// Inicialización de la aplicación
async function initApp() {
  // Desbloquear audio con el primer toque en pantalla en cualquier elemento
  const unlockOnFirstTouch = () => {
    unlockAudio();
    window.removeEventListener('touchstart', unlockOnFirstTouch);
    window.removeEventListener('click', unlockOnFirstTouch);
  };
  window.addEventListener('touchstart', unlockOnFirstTouch, { passive: true });
  window.addEventListener('click', unlockOnFirstTouch, { passive: true });

  // Inicializar estado y BD
  await state.init();

  // Inicializar temporizador flotante
  initTimerComponent();

  // Configurar navegación
  setupNavigation();

  // Registrar Service Worker
  registerServiceWorker();

  console.log('[Tracker] Aplicación iniciada correctamente.');
}

initApp().catch((err) => {
  console.error('[Tracker] Error al iniciar la aplicación:', err);
});
