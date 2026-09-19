const CACHE_NAME = 'solone-demo-v1';
const STATIC_ASSETS = [
  'somevalvomo_demo.html',
  'manifest_demo.json',
  'soloneverkkosivu.jpg',
  'icon-192.png',
  'icon-512.png'
];

// Asennus: Ladataan staattiset rungot välimuistiin
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Aktivointi: Siivotaan vanhat demo-välimuistit pois
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key.startsWith('solone-demo-') && key !== CACHE_NAME)
            .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Pyyntöjen käsittely: Network-First API- ja Make-kutsuille
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Supabase ja Make.com menevät AINA suoraan verkkoon ilman välimuistia
  if (url.hostname.includes('supabase.co') || url.hostname.includes('make.com')) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Muille sivuille ja tiedostoille haetaan verkosta, ja jos offline, otetaan välimuistista
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});