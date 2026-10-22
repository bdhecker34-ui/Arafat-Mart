// Easy Mart Service Worker for Android PWA Installability
const CACHE_NAME = 'easy-mart-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Simple fetch-through caching strategy
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
