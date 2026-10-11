// Service Worker for Hindu Calendar & Live Panchang PWA (Production v11)
// Compliant with W3C Service Worker & Push API standards
// Notifications are strictly received and rendered via Server-Sent Web Push events

const CACHE_NAME = 'vedic-panchang-pwa-v12';
const ASSETS_TO_CACHE = [
  '/',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icons/icon-192x192.png',
  '/icons/badge-72x72.png',
  '/manifest.json',
  '/manifest.webmanifest'
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. LIFECYCLE & CACHING (OFFLINE RESILIENCE)
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => console.warn(`[SW] Pre-cache notice for ${url}:`, err))
        )
      );
    })
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
  if (!event.request.url.startsWith('http')) return;

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
        .catch(() => caches.match(event.request, { ignoreSearch: true }).then((res) => res || caches.match('/')))
    );
    return;
  }

  // Static assets & Next.js chunks: Cache-First with background revalidation
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && (networkResponse.status === 200 || networkResponse.type === 'opaque')) {
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
      title: '🌅 Daily Tithi',
      body: event.data.text()
    };
  }

  if (!payload || typeof payload !== 'object') {
    payload = {
      title: '🌅 Daily Tithi',
      body: 'Vedic Panchang update available.'
    };
  }

  // Support both full floating payload (title + options) and flat format
  let title = payload.title || '🌅 Daily Tithi';
  let options;

  const isAppUpdate =
    payload.tag === 'app-update' ||
    Boolean(payload.data?.isAppUpdate) ||
    Boolean(payload.isAppUpdate);

  if (isAppUpdate) {
    title = payload.title || '⚡ Daily Tithi Update Available';
    options = {
      body: payload.body || 'A new update is available. Tap to refresh Daily Tithi for new features.',
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      tag: 'app-update',
      renotify: true,
      requireInteraction: true,
      vibrate: payload.vibrate || [200, 100, 200],
      data: {
        url: payload.url || payload.data?.url || 'https://dailytithi.com/',
        isAppUpdate: true,
        forceReload: payload.data?.forceReload !== false,
        version: payload.data?.version || Date.now().toString(),
        timestamp: Date.now()
      },
      actions: payload.actions || [
        { action: 'update_now', title: '⚡ Update Now' },
        { action: 'dismiss', title: 'Later' }
      ]
    };
  } else if (payload.options && typeof payload.options === 'object') {
    options = {
      ...payload.options,
      icon: payload.options.icon || '/icons/icon-192x192.png',
      badge: payload.options.badge || '/icons/badge-72x72.png',
      data: {
        url: 'https://dailytithi.com',
        ...payload.options.data
      }
    };
  } else {
    const isTestBroadcast = Boolean(payload.isTestBroadcast || payload.data?.isTestBroadcast);
    title = payload.title || (isTestBroadcast ? 'Panchang Test Notification' : '🌅 Daily Tithi');
    const body = payload.body || (isTestBroadcast 
      ? 'If you see this, daily Panchang alerts are working on your device. Tap to confirm.' 
      : 'Vedic Panchang update available.');

    const finalTag = (payload.tag && payload.tag !== 'panchang-alert')
      ? payload.tag
      : (isTestBroadcast ? 'panchang-test' : 'daily-floating-panchang');

    options = {
      body,
      icon: payload.icon || '/icons/icon-192x192.png',
      badge: payload.badge || '/icons/badge-72x72.png',
      tag: finalTag,
      renotify: payload.renotify === true,
      requireInteraction: payload.requireInteraction !== false,
      vibrate: payload.vibrate || [100, 50, 100],
      data: {
        url: payload.url || payload.data?.url || 'https://dailytithi.com',
        timestamp: Date.now(),
        isTestBroadcast,
        ...payload.data
      },
      actions: payload.actions || [
        { action: 'open_panchang', title: '📖 Open Full Panchang' },
        { action: 'open_muhurat', title: '⏱️ Muhurat Timings' }
      ]
    };
  }

  // Crucial: All async work MUST be wrapped in event.waitUntil(...)
  // Failure to wrap causes OS process termination before notification renders
  event.waitUntil(self.registration.showNotification(title, options).then(() => {
    // If this is a test broadcast, report receipt confirmation back to server silently
    const isTestBroadcast = Boolean(options.data?.isTestBroadcast);
    if (isTestBroadcast && options.data?.testId && options.data?.subId) {
      return fetch('/api/push/test-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId: options.data.testId,
          subId: options.data.subId,
          event: 'received',
          platform: navigator.userAgentData?.platform || 'Unknown',
          browser: 'ServiceWorker'
        })
      }).catch((err) => console.warn('[SW] Confirmation delivery failed:', err));
    }
  }));
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. NOTIFICATION CLICK ROUTING (DEEP-LINKING & WARM-TAB RESOLUTION)
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  // If user tapped "Later", simply dismiss
  if (event.action === 'dismiss') {
    return;
  }

  const baseUrl = self.location.origin;
  const isAppUpdate =
    event.notification.tag === 'app-update' ||
    Boolean(event.notification.data?.isAppUpdate) ||
    event.action === 'update_now';

  if (isAppUpdate) {
    const rawTarget = event.notification.data?.url || `${baseUrl}/`;
    const forceReload = event.notification.data?.forceReload !== false;
    const version = event.notification.data?.version || Date.now();
    const updateUrl = forceReload
      ? `${rawTarget}${rawTarget.includes('?') ? '&' : '?'}v=${version}&t=${Date.now()}`
      : rawTarget;

    event.waitUntil(
      (async () => {
        // Trigger Service Worker background update to fetch latest bundle
        if (self.registration && self.registration.update) {
          self.registration.update().catch(() => {});
        }

        const windowClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
        
        // If an existing Daily Tithi tab is open, reload it with fresh cache
        for (const client of windowClients) {
          if (client.url && client.url.startsWith(baseUrl)) {
            client.postMessage({
              type: 'APP_UPDATE_FORCE_RELOAD',
              forceReload,
              version
            });

            if ('navigate' in client) {
              await client.navigate(updateUrl);
            }
            return client.focus();
          }
        }

        // Cold start: open new window with cache-busting query parameter
        if (clients.openWindow) {
          return clients.openWindow(updateUrl);
        }
      })()
    );
    return;
  }

  // Standard Panchang / Muhurat Deep-Linking
  let targetUrl = `${baseUrl}/`;
  let viewAction = 'default';

  if (event.action === 'open_muhurat') {
    targetUrl = `${baseUrl}/?view=muhurat`;
    viewAction = 'muhurat';
  } else if (event.action === 'open_panchang') {
    targetUrl = `${baseUrl}/?view=calendar`;
    viewAction = 'calendar';
  } else if (event.notification.data?.url) {
    targetUrl = event.notification.data.url;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(async (windowClients) => {
      // Check if Daily Tithi tab is already open (warm tab)
      for (const client of windowClients) {
        if (client.url && client.url.startsWith(baseUrl)) {
          // Send message to open view dynamically if tab is alive
          client.postMessage({
            type: 'NOTIFICATION_NAVIGATE',
            view: viewAction,
            targetUrl: targetUrl
          });

          // Navigate the tab to ensure query params update
          if ('navigate' in client) {
            await client.navigate(targetUrl);
          }
          return client.focus();
        }
      }

      // If no tab is open, launch a new window with the deep-linked URL (cold start)
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
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
// 5. CLIENT COMMUNICATION BUS
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Settings update from main thread
  if (data.type === 'SET_SETTINGS') {
    // Acknowledged
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. PERIODIC BACKGROUND SYNC
// ─────────────────────────────────────────────────────────────────────────────
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
