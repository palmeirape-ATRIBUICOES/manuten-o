/* ==========================================================================
   SERVICE WORKER - PASS-THROUGH (NO CACHING) TO FIX STALE MOBILE CACHE
   v2.5.0 - Removed Database Cloud config block (centralized database connected).
   ========================================================================== */

// Install: skip waiting immediately
self.addEventListener('install', () => {
  self.skipWaiting();
});

// Activate: delete ALL old caches and claim all clients
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(names.map(name => caches.delete(name)));
    }).then(() => self.clients.claim())
  );
});

// Fetch: pass everything to network, no caching at all
self.addEventListener('fetch', (event) => {
  event.respondWith(fetch(event.request));
});
