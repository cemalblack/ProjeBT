// Service Worker - Güvenli ve Hızlı PWA
const CACHE_NAME = 'butce-v4'; // Önbelleği sıfırlamak için v4 yapıldı
const urlsToCache = [
  './',
  'index.html',
  'manifest.json',
  'logo.png'
];

// Kurulum - dosyalardan biri eksik olsa bile patlamayan güvenli kurulum
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (err) {
          console.warn('Dosya önbelleğe alınamadı:', url);
        }
      }
    })
  );
});

// Aktivasyon - eski cache'leri anında sil
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
    }).then(() => self.clients.claim())
  );
});

// Fetch - Önce ağdan en günceli dene, internet yoksa cache'den ver
self.addEventListener('fetch', event => {
  // Sadece GET isteklerini işle
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Çevrimdışıysa önbellekten getir
        return caches.match(event.request);
      })
  );
});
