const CACHE_NAME = 'solone-pika-v3';
const ASSETS = [
  'pikasyotto.html',
  'manifest.json'
];

// 1. Asennus: pakotetaan uusi Service Worker heti aktiiviseksi ilman odottelua
self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

// 2. Aktivointi: poistetaan vanha v2-välimuisti kokonaan puhelimesta
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Haku: haetaan aina ENSIN verkosta (network-first), jotta uusin koodi ja lukitus tulevat heti
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(e.request);
      })
  );
});