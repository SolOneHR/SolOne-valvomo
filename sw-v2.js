// Pika V2:n oma Service Worker: vain pikasyotto-v2.html -osoitteen scope.
// Ei koske vanhan Pikan sw.js-rekisteröintiä tai välimuistia.
const CACHE_NAME = 'solone-pika-v2-isolated-v1';
const PAGE = 'pikasyotto-v2.html';

self.addEventListener('install', event => {
  self.skipWaiting();
  // Asennus ei kaadu mahdolliseen offline-välimuistin virheeseen.
  event.waitUntil(Promise.resolve());
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate' ||
      url.origin !== self.location.origin || !url.pathname.endsWith('/' + PAGE)) return;
  event.respondWith(
    fetch(event.request).then(response => {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => {}));
      }
      return response;
    }).catch(async () => (await caches.match(event.request)) || Response.error())
  );
});
