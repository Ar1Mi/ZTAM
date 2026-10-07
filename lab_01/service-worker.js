importScripts('https://storage.googleapis.com/workbox-cdn/releases/7.4.1/workbox-sw.js');
const { precaching, routing, strategies } = workbox;

precaching.precacheAndRoute([
  { url: './', revision: '1' },
  { url: 'index.html', revision: '1' },
  { url: 'index.js', revision: '1' },
  { url: 'manifest.json', revision: '1' },
  { url: 'offline.html', revision: '1' },
  { url: 'android.png', revision: '1' },
]);

routing.registerRoute(
  ({ request }) => request.mode === 'navigate',
  new strategies.NetworkFirst({ cacheName: 'strony' })
);

routing.registerRoute(
  ({ request }) => request.destination === 'image',
  new strategies.CacheFirst({ cacheName: 'obrazy' })
);

routing.setCatchHandler(async ({ request }) => {
  if (request.mode === 'navigate') {
    return precaching.matchPrecache('offline.html');
  }
  return Response.error();
});
