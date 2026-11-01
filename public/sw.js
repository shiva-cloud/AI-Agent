// Northstar Port-of-Entry Offline Service Worker & Emergency SOS Kit (Rec 174)
const CACHE_NAME = 'northstar-v34-offline-poe';
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  '/offline.css',
  '/styles.css',
  '/tool-modal.css',
  '/explorer.html',
  '/explorer.css',
  '/explorer.js',
  '/app.js',
  '/app-lifecycle.js',
  '/tool-modal.js',
  '/immigration-workspace.js',
  '/immigration-workspace-ui.js',
  '/plan-access.js',
  '/editorial.js',
  '/clarification.js',
  '/errors.js',
  '/gap-work.js',
  '/admin-permissions.js',
  '/answer-view.js',
  '/csp-styles.js',
  '/manifest.json',
  '/favicon.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS);
    })
  );
});

self.addEventListener('message', event => {
  if (event.data?.type === 'ACTIVATE_UPDATE') event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name.startsWith('northstar-') && name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !PRECACHE_URLS.includes(url.pathname)) return;

  // If navigational request fails offline, serve the offline emergency guide
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedOffline = await cache.match('/offline.html');
        return cachedOffline || new Response('Offline: Please reconnect to view live intelligence.', {
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
      })
    );
    return;
  }

  // Never cache API responses, authenticated pages or requests to other origins.
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !PRECACHE_URLS.includes(url.pathname)) return;

  // Keep the versioned shell intact until the next worker installation
  event.respondWith(caches.open(CACHE_NAME).then(async cache => {
    const cached = await cache.match(url.pathname);
    return cached || fetch(event.request);
  }));
});
