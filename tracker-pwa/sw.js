// Service Worker para Tracker PWA - Cache First con soporte offline completo
const CACHE_NAME = 'tracker-v1.0.0';

// Lista de assets a precachear (rutas relativas al scope del service worker)
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './css/main.css',
  './css/components.css',
  './css/views.css',
  './js/app.js',
  './js/db.js',
  './js/state.js',
  './js/utils.js',
  './js/seed-data.js',
  './js/modules/e1rm.js',
  './js/modules/plates.js',
  './js/modules/progression.js',
  './js/modules/volume.js',
  './js/components/timer.js',
  './js/components/plate-modal.js',
  './js/components/number-stepper.js',
  './js/components/body-heatmap.js',
  './js/views/workout.js',
  './js/views/history.js',
  './js/views/progress.js',
  './js/views/routines.js',
  './js/views/settings.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable.png',
  './icons/apple-touch-icon.png',
  './icons/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Precache individualmente para que si uno falla no cancele todo
      return Promise.all(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(new Request(url, { cache: 'reload' })).catch((err) => {
            console.warn(`[SW] No se pudo precachear ${url}:`, err);
          });
        })
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log(`[SW] Borrando caché obsoleta: ${name}`);
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Cache-First strategy para assets locales
self.addEventListener('fetch', (event) => {
  // Ignorar solicitudes que no sean GET
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Solo cachear solicitudes del mismo origen
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Si no hay red y piden un HTML o navegación, devolver index.html de la caché
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }
      });
    })
  );
});

// Permitir activar inmediatamente la nueva versión cuando el usuario toca "Actualizar"
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
