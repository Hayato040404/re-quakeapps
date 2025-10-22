const CACHE_NAME = 'ewc-cache-v1';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/icon.png',
  '/favicon.ico'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((resp) => {
      const copy = resp.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
      return resp;
    }).catch(() => cached))
  );
});

self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : { title: 'EWC 地震速報', body: '' };
  const options = {
    body: data.body,
    icon: '/icon.png',
    badge: '/icon.png'
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'EWC 地震速報', options)
  );
});
