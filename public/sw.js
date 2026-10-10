// Service Worker for Hindu Calendar & Live Panchang PWA (Production v10)
// Compliant with W3C Service Worker & Push API standards
// v10: Offline-first CHECK_AND_NOTIFY using IndexedDB cache, dual manifest support

const CACHE_NAME = 'vedic-panchang-pwa-v10';
const ASSETS_TO_CACHE = [
  '/',
  '/icon-192.svg',
  '/icon-512.svg',
  '/icons/icon-192x192.png',
  '/icons/badge-72x72.png',
  '/manifest.json',
  '/manifest.webmanifest'
];

// ── IndexedDB Access (shared with main thread via idb-storage.ts) ───────────
const IDB_NAME = 'vedic_panchang_db';
const IDB_VERSION = 1;
const IDB_STORE = 'notification_kv';
const KEY_DAILY_CACHE = 'daily_panchang_cache';

function openIDB() {
  return new Promise((resolve, reject) => {
    try {
      const req = indexedDB.open(IDB_NAME, IDB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } catch (e) {
      reject(e);
    }
  });
}

function getFromIDB(key) {
  return openIDB().then((db) => {
    return new Promise((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE, 'readonly');
        const store = tx.objectStore(IDB_STORE);
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      } catch {
        resolve(null);
      }
    });
  }).catch(() => null);
}

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

  if (payload.options && typeof payload.options === 'object') {
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

  const baseUrl = self.location.origin;
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
// 5. CLIENT COMMUNICATION BUS & FLOATING NOTIFICATION HANDLER
// ─────────────────────────────────────────────────────────────────────────────
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  // Seed cache message from ClientNotificationScheduler
  if (data.type === 'SEED_CACHE' && data.cache) {
    // Cache is saved to IndexedDB by the main thread
  }

  // Settings update from main thread
  if (data.type === 'SET_SETTINGS') {
    // Acknowledged
  }

  // Only manual forced tests invoke handleCheckAndNotify
  if (data.type === 'CHECK_AND_NOTIFY' && data.force) {
    event.waitUntil(handleCheckAndNotify(true));
  }
});

/**
 * Offline-first fallback notification handler.
 * Only renders when force === true (explicit user test when offline).
 * Dispatches strictly the 5-line all-in-one floating lock-screen format.
 */
async function handleCheckAndNotify(force) {
  if (!force) return;

  try {
    const cachedData = await getFromIDB(KEY_DAILY_CACHE);
    if (cachedData && cachedData.instantaneousTithi) {
      const now = new Date();
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const varaNames = ['Ravivara', 'Somavara', 'Mangalavara', 'Budhavara', 'Guruvara', 'Shukravara', 'Shanivara'];
      const day = now.getDate();
      const month = monthNames[now.getMonth()];
      const vara = varaNames[now.getDay()];
      const tithiName = cachedData.instantaneousTithi.name || 'Tithi';
      const sig = cachedData.festivalOrVrat || 'Panchang';
      const endTime = cachedData.instantaneousTithi.endTimeFormatted || '09:20 PM';
      const panchakStr = (cachedData.panchak && cachedData.panchak.isActive && cachedData.panchak.isInauspicious) ? 'Active' : 'Free';

      const title = `🌅 Daily Tithi • ${vara}, ${day} ${month}`;
      const body = [
        `🪔 ${tithiName} (${sig})`,
        `⏳ Tithi ends today at ${endTime}`,
        '',
        '🟢 Auspicious (Abhijit): 11:45 AM – 12:33 PM',
        '🔴 Inauspicious (Rahu): 09:15 AM – 10:45 AM',
        `🛡️ Panchak: ${panchakStr} • ☀️ Sun: 06:19 AM – 05:57 PM`
      ].join('\n');

      return self.registration.showNotification(title, {
        body,
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        tag: 'daily-floating-panchang',
        requireInteraction: true,
        renotify: false,
        actions: [
          { action: 'open_panchang', title: '📖 Open Full Panchang' },
          { action: 'open_muhurat', title: '⏱️ Muhurat Timings' }
        ]
      });
    }
  } catch {
    // Silent failure
  }
}

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
