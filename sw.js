// Milestone 01 service worker.
// Strategy (D-039): network first. Always try the internet and keep a fresh copy;
// use the saved copy only when offline.

const CACHE_NAME = 'sazon-v1';

// Paths are relative to this file, so they work under /sazon/ on GitHub Pages (D-038).
const APP_FILES = [
  './',
  './index.html',
  './css/app.css',
  './js/app.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// Install: save the app files for offline use.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_FILES))
  );
  self.skipWaiting();
});

// Activate: delete caches from older versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch: network first, saved copy as fallback.
self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle simple page/file requests from our own site.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request, { ignoreSearch: true }).then((saved) => {
          if (saved) {
            return saved;
          }
          // Opening the app offline: fall back to the saved main page.
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return Response.error();
        })
      )
  );
});
