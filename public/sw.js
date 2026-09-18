// Service Worker for Hindu Calendar & Live Panchang PWA (v5 - SWR + Offline Cache)
const CACHE_NAME = 'vedic-panchang-pwa-v5';
const ASSETS_TO_CACHE = [
  '/',
  '/icon-192.svg',
  '/icon-512.svg'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // For HTML page navigations, use Network-First to ensure instant deployment updates
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match(event.request).then((res) => res || caches.match('/')))
    );
    return;
  }

  // For static assets & Next.js chunks, serve Cache-First with Background Revalidation
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// WEB PUSH & NOTIFICATION DISPLAY
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {
    title: "Today's Panchang",
    body: 'Vedic Panchang & Daily Observance updated.',
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    data: { url: '/' }
  };

  try {
    payload = event.data.json();
  } catch (err) {
    payload.body = event.data.text();
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/icon-192.svg',
    badge: payload.badge || '/icon-192.svg',
    vibrate: [200, 100, 200],
    data: payload.data || { url: '/' },
    tag: 'daily-panchang-notification',
    renotify: true
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || "Today's Panchang", options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a tab is already open with the app, focus it
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window to the widget
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
