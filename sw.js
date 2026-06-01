const CACHE = 'pcr-v1';
const PRECACHE = [
  './',
  './index.html',
  './tools/color-mixer.html',
  './tools/stencil-maker.html',
  './images/icon-192.png',
  './images/icon-512.png',
  './manifest.json'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(c => c.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only handle GET requests for same-origin or CDN fonts/styles
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(resp => {
        // Cache successful same-origin responses and Google Fonts
        if (resp && resp.status === 200) {
          const url = new URL(e.request.url);
          if (url.origin === location.origin || url.hostname.includes('fonts.g')) {
            const clone = resp.clone();
            caches.open(CACHE).then(c => c.put(e.request, clone));
          }
        }
        return resp;
      }).catch(() => cached);
    })
  );
});
