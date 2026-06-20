const VERSION = '1.3';
const CACHE = 'pawse-' + VERSION;

// App shell — everything needed to run offline
const SHELL = [
  './',
  './index.html',
  './manifest.json',
  './css/main.css',
  './js/storage.js',
  './js/logic.js',
  './js/ui.js',
  './icons/icon-192.svg',
  './icons/icon-512.svg',
];

// Pre-cache the shell on first install
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)));
  self.skipWaiting();
});

// Remove any caches from older versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Cache-first for all GET requests; fall through to network when not cached
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(hit => hit || fetch(event.request))
  );
});
