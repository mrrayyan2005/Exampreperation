// Service Worker for ExamPrep PWA
// IMPORTANT: This SW uses a versioned cache name.
// Update CACHE_VERSION when deploying to automatically invalidate old caches.
const CACHE_VERSION = 'v3';
const CACHE_NAME = `examprep-${CACHE_VERSION}`;

// Only cache truly static, long-lived assets (NOT Vite chunks — they have hashed filenames)
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.png',
];

// ─── Install ────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// ─── Activate: purge ALL old caches ────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME) // delete anything not current version
          .map((key) => {
            console.log(`[SW] Deleting stale cache: ${key}`);
            return caches.delete(key);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ─── Fetch: smart strategy per resource type ───────────────────────────────
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // NEVER intercept Vite dev server requests (HMR, optimized deps, source files)
  // These have version hashes (?v=xxx) and should always go to the network.
  if (
    url.pathname.includes('/node_modules/.vite/') ||
    url.pathname.includes('/@vite/') ||
    url.pathname.includes('/@react-refresh') ||
    url.searchParams.has('v') ||
    url.searchParams.has('t') // HMR timestamp
  ) {
    return; // bypass SW entirely — go straight to network
  }

  // For index.html: Network First (always get fresh HTML)
  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request)) // fallback to cache if offline
    );
    return;
  }

  // For truly static assets (images, fonts): Cache First
  if (
    url.pathname.match(/\.(png|jpg|jpeg|gif|webp|svg|ico|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // For hashed JS/CSS chunks (production builds): Cache First (they're immutable)
  if (url.pathname.match(/\.(js|css)$/) && url.pathname.includes('/assets/')) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        return cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        });
      })
    );
    return;
  }

  // All other requests: Network Only (API calls, etc.)
  // Do NOT intercept — let them go straight through
});
