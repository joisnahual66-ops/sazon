// Sazón service worker (updated in Milestone 04).
// Strategy (D-056): network first with a 3-second limit; saved copy when offline or too slow.

const CACHE_NAME = 'sazon-v6';

// Paths are relative to this file, so they work under /sazon/ on GitHub Pages (D-038).
const APP_FILES = [
  './',
  './index.html',
  './lab.html',
  './recipe.html',
  './css/tokens.css',
  './css/app.css',
  './css/lab.css',
  './css/recipe-detail.css',
  './css/dev.css',
  './js/app.js',
  './js/format.js',
  './js/data/sample-recipe.js',
  './js/ui/dom.js',
  './js/ui/bottom-nav.js',
  './js/screens/recipe-detail.js',
  './js/pages/recipe-page.js',
  './js/pages/home-page.js',
  './js/vendor/dexie.mjs',
  './js/db/database.js',
  './js/db/recipes.js',
  './js/db/seed.js',
  './js/dev/dev-strip.js',
  './js/dev/storage-check.js',
  './manifest.webmanifest',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/ui.svg',
  './fonts/bricolage-grotesque.woff2',
  './fonts/dm-sans.woff2',
  './masks/blob-1.svg'
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

// Fetch: network first, saved copy as fallback (D-056).
// If the network fails OR takes longer than NETWORK_TIMEOUT_MS (e.g. a VPN or weak signal
// that never answers), show the saved copy. The network answer still refreshes the
// saved copy in the background when it arrives.
const NETWORK_TIMEOUT_MS = 3000;

// After the network fails once, skip it for a short while so the rest of the
// page (styles, scripts, fonts) loads instantly from the saved copy.
const SKIP_NETWORK_MS = 30000;
let skipNetworkUntil = 0;

function savedCopy(request) {
  return caches.match(request, { ignoreSearch: true }).then((saved) => {
    if (saved) return saved;
    // Opening the app offline: fall back to the saved start page.
    if (request.mode === 'navigate') return caches.match('./index.html');
    return undefined;
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Only handle simple page/file requests from our own site.
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) {
    return;
  }

  const network = fetch(request).then((response) => {
    skipNetworkUntil = 0;
    if (response.ok) {
      const copy = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
    }
    return response;
  });

  // Let a slow network answer finish refreshing the saved copy.
  event.waitUntil(network.catch(() => {}));

  const fromSaved = () =>
    savedCopy(request).then((saved) => saved || network).catch(() => Response.error());

  // Network failed recently: answer from the saved copy right away.
  if (Date.now() < skipNetworkUntil) {
    event.respondWith(fromSaved());
    return;
  }

  const timeout = new Promise((resolve, reject) => {
    setTimeout(() => reject(new Error('network timeout')), NETWORK_TIMEOUT_MS);
  });

  event.respondWith(
    Promise.race([network, timeout]).catch(() => {
      skipNetworkUntil = Date.now() + SKIP_NETWORK_MS;
      return fromSaved();
    })
  );
});
