/* ==========================================================================
   SERVICE WORKER - PWA OFFLINE-FIRST ASSET MANAGEMENT
   ========================================================================== */

const CACHE_NAME = 'asset-saas-v1.6.0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './src/assets/styles/main.css',
  './src/app.js',
  './src/mock-data.js',
  './src/components/canvas-signature.js',
  './manifest.json',
  'https://unpkg.com/lucide@latest'
];

// Install Event - Cache Core Assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA SW] Pre-caching offline app shell');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean Old Caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA SW] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Cache First, Network Fallback
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).catch(() => {
        // Return offline fallback if network fails
        return caches.match('./index.html');
      });
    })
  );
});
