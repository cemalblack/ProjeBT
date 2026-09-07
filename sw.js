// Service Worker - Optimize edilmiş PWA
const CACHE_NAME = 'butce-v3'; // Versiyon artırıldı
const urlsToCache = [
  './',
  'logo.png',
  'manifest.json'
];

// Kurulum - hızlı aktivasyon
self.addEventListener('install', event => {
  self.skipWaiting(); // Hemen aktif et
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// Aktivasyon - eski cache'leri temizle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Hemen kontrol al
  );
});

// Fetch - Stale-while-revalidate stratejisi (hızlı + güncel)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Arka planda cache'i güncelle
          if (networkResponse && networkResponse.status === 200) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        });
        
        // Cache varsa hemen döndür, yoksa network'ten bekle
        return cachedResponse || fetchPromise;
      });
    })
  );
});
