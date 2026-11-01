// Easy Mart Service Worker for PWA Installability
const CACHE_NAME = 'easy-mart-v4';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => self.clients.claim())
  );
});

// PWA requirement: fetch handler exists to satisfy installability check
// Requests are handled natively by the browser so scripts/styles are never blocked or corrupted
self.addEventListener('fetch', (event) => {
  // Let the browser handle standard HTTP/HTTPS requests directly
  return;
});
