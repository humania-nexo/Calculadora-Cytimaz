/**
 * ====================================================================
 * SERVICE WORKER (sw.js) - Modo Offline para PWA Cytimaz
 * ====================================================================
 * Permite que la calculadora funcione en planta sin conexión a internet.
 * Estrategia: Cache-First con actualización en segundo plano.
 * ====================================================================
 */

const CACHE_NAME = 'cytimaz-calc-v1.0.4';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/data.js',
  './js/engine.js',
  './js/mod-pt-mp.js',
  './js/mod-mp-pt.js',
  './js/mod-informe.js',
  './js/app.js',
  './assets/icons/icon-192.svg',
  './assets/icons/icon-512.svg',
  './assets/img/modelos/tinaco_bicapa_generic.svg',
  './assets/img/modelos/tinaco_tricapa_generic.svg',
  './assets/img/modelos/cisterna_generic.svg',
  './assets/img/modelos/tambo_generic.svg'
];

// Instalación: Precarga de archivos en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Precargando activos estáticos para uso Offline');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activación: Limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Eliminando caché obsoleta:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Responder desde la caché o ir a la red si no está en caché
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

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
        // Si no hay red y busca la página principal, entregar index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
