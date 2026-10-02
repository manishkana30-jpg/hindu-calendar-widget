// Service Worker for Hindu Calendar & Live Panchang PWA (Production v9)
// Compliant with W3C Service Worker & Push API standards

const CACHE_NAME = 'vedic-panchang-pwa-v9';
const ASSETS_TO_CACHE = [
  '/',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json'
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. LIFECYCLE & CACHING (OFFLINE RESILIENCE)
// ─────────────────────────────────────────────────────────────────────────────
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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass cache for push APIs and dynamic astrometry endpoints
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // HTML page navigations: Network-First with cache fallback
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

  // Static assets & Next.js chunks: Cache-First with background revalidation
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
// 2. PUSH EVENT HANDLING (LOCK-SCREEN NOTIFICATION DELIVERY)
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: 'Panchang Alert',
      body: event.data.text()
    };
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/icon-192.svg',
    badge: payload.badge || '/icon-192.svg',
    tag: payload.tag || 'panchang-alert',
    renotify: true,
    requireInteraction: false,
    data: {
      url: payload.url || payload.data?.url || '/',
      timestamp: Date.now(),
      ...payload.data
    },
    actions: [{ action: 'open', title: 'View Panchang' }]
  };

  // Crucial: All async work MUST be wrapped in event.waitUntil(...)
  // Failure to wrap causes OS process termination before notification renders
  event.waitUntil(self.registration.showNotification(payload.title, options));
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. NOTIFICATION CLICK ROUTING
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const notifData = event.notification.data || {};
  const targetUrl = notifData.url || '/';

  const routingPromise = clients.matchAll({ type: 'window', includeUncontrolled: true })
    .then((clientList) => {
      // If a window/tab is already open, focus it and transmit state
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.postMessage({
            type: 'NOTIFICATION_CLICK',
            data: notifData
          });
          return client.focus();
        }
      }
      // Otherwise launch a new window with the destination URL
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    });

  event.waitUntil(routingPromise);
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. SUBSCRIPTION ROTATION HANDLING (PREVENTS SILENT PUSH FAILURE)
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  const options = event.oldSubscription ? event.oldSubscription.options : { userVisibleOnly: true };

  event.waitUntil(
    self.registration.pushManager.subscribe(options)
      .then((newSub) => {
        return fetch('/api/push/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription: newSub,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          })
        });
      })
      .catch((err) => {
        console.error('[SW] pushsubscriptionchange re-subscription failed:', err);
      })
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. CLIENT COMMUNICATION BUS & PERIODIC BACKGROUND SYNC
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (data.type === 'CHECK_AND_NOTIFY' && data.force) {
    event.waitUntil(
      fetch('/api/panchang/today')
        .then((res) => res.json())
        .then((panchang) => {
          if (panchang) {
            const body = panchang.instantaneousTithi?.name
              ? `Tithi: ${panchang.instantaneousTithi.name}`
              : 'Vedic Panchang alert dispatched.';
            return self.registration.showNotification('Panchang Update', {
              body,
              icon: '/icon-192.svg',
              badge: '/icon-192.svg',
              tag: 'panchang-alert',
              renotify: true
            });
          }
        })
        .catch(() => {})
    );
  }
});

self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'panchang-periodic-check') {
    event.waitUntil(
      fetch('/api/push/daily-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'periodic-sync' })
      }).catch(() => {})
    );
  }
});

