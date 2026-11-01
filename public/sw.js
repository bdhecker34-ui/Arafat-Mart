// Easy Mart Service Worker for Android PWA Installability
const CACHE_NAME = 'easy-mart-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests and standard HTTP/HTTPS schemes
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  // Do not intercept API requests or Firestore requests
  const url = new URL(event.request.url);
  if (url.pathname.startsWith('/api/') || url.hostname.includes('firestore') || url.hostname.includes('googleapis')) {
    return;
  }

  // Safe network-first strategy: never let respondWith resolve to undefined
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        return networkResponse;
      })
      .catch(async () => {
        try {
          const cached = await caches.match(event.request);
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            const fallback = await caches.match('./index.html') || await caches.match('./');
            if (fallback) return fallback;
          }
        } catch {}
        return new Response('', { status: 503, statusText: 'Service Unavailable' });
      })
  );
});
