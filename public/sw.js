// Service Worker for Hindu Calendar & Live Panchang PWA (v6 - Background Sync & State Diffing)
const CACHE_NAME = 'vedic-panchang-pwa-v6';
const ASSETS_TO_CACHE = [
  '/',
  '/icon-192.svg',
  '/icon-512.svg',
  '/manifest.json'
];

// ─────────────────────────────────────────────────────────────────────────────
// 1. LIFECYCLE & ASSET CACHING (OFFLINE AVAILABILITY)
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
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Bypass cache for panchang API snapshot so fresh status can be retrieved when needed
  if (url.pathname.startsWith('/api/panchang/')) {
    return;
  }

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
// 2. INDEXEDDB PERSISTENCE (STANDALONE ZERO-DEPENDENCY HELPER)
// ─────────────────────────────────────────────────────────────────────────────
const DB_NAME = 'vedic_panchang_db';
const DB_VERSION = 1;
const STORE_NAME = 'notification_kv';

function openIDB() {
  return new Promise((resolve) => {
    try {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

async function idbGet(key) {
  const db = await openIDB();
  if (!db) return null;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result ?? null);
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

async function idbSet(key, value) {
  const db = await openIDB();
  if (!db) return;
  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch (e) {
      resolve();
    }
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. COMBINED NOTIFICATION FORMATTER & STATE-DIFFING ENGINE
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Strict 2-3 line minimal format (no extra text):
 * 
 * Tithi: <Tithi Name>
 * Panchak: 🔴 <status> (omitted if no active inauspicious Panchak)
 * Festival/Vrat: <Name> (omitted if none today)
 */
function formatNotificationBody(state) {
  const lines = [];

  // Line 1: Tithi (always shown)
  lines.push(`Tithi: ${state.tithi || 'Panchang'}`);

  // Line 2: Panchak (shown in RED text/highlight only if Panchak is currently active/inauspicious)
  const isPanchakActive = Boolean(state.panchak?.isActive);
  const isInauspicious = state.panchak?.isInauspicious !== false;

  if (isPanchakActive && isInauspicious) {
    const status = state.panchak?.statusText || (state.panchak?.type ? `${state.panchak.type} (Inauspicious)` : 'Active (Inauspicious)');
    const cleanStatus = status.replace(/^[🔴⚠️\s]+/, '');
    lines.push(`Panchak: 🔴 ${cleanStatus}`);
  }

  // Line 3: Festival/Vrat (omit entirely if none today)
  if (state.festivalOrVrat && state.festivalOrVrat.trim()) {
    lines.push(`Festival/Vrat: ${state.festivalOrVrat.trim()}`);
  }

  return lines.join('\n');
}

/**
 * Checks Tithi, Panchak, and Festival/Vrat triggers.
 * - Single combined notification if one or more conditions met.
 * - Deduplicates using IndexedDB to avoid repeat pushes.
 * - Battery & data efficient: only hits the network when cached day-window is missing/expired.
 */
async function checkAndNotifyPanchangChange(options = {}) {
  const { force = false, source = 'unknown', pushPayload = null } = options;

  // 1. Check if user enabled background alerts
  const settings = await idbGet('notification_settings');
  const isEnabled = settings ? Boolean(settings.enabled) : true; // Default true if push arrived
  if (!isEnabled && !force) {
    return { triggered: false, reason: 'NOTIFICATIONS_DISABLED' };
  }

  const now = Date.now();
  const todayStr = new Date(now).toISOString().split('T')[0];

  // 2. Retrieve or refresh cached daily panchang schedule
  let cache = await idbGet('daily_panchang_cache');

  // Verify whether cached day-window is valid for the current moment
  const isCacheValid = cache &&
    now >= (cache.dayWindowStart || 0) &&
    now <= (cache.dayWindowEnd || Number.MAX_SAFE_INTEGER) &&
    cache.dateStr === todayStr;

  if (!isCacheValid) {
    try {
      // Hit network ONLY when ephemeris/festival data is not cached for the current day
      const res = await fetch('/api/panchang/today', {
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        cache = await res.json();
        await idbSet('daily_panchang_cache', cache);
      }
    } catch (netErr) {
      console.warn('Panchang snapshot fetch failed, falling back to existing cache:', netErr);
    }
  }

  if (!cache && !pushPayload) {
    return { triggered: false, reason: 'NO_PANCHANG_DATA' };
  }

  // 3. Resolve instantaneous astronomical state at current timestamp
  let currentTithi = cache?.instantaneousTithi?.name || 'Panchang';
  if (cache?.instantaneousTithi?.endTimestamp && now >= cache.instantaneousTithi.endTimestamp) {
    if (cache.nextTithi?.name) {
      currentTithi = cache.nextTithi.name;
    }
  }

  let isPanchakActive = Boolean(cache?.panchak?.isActive);
  if (cache?.panchak?.startTimestamp && cache?.panchak?.endTimestamp) {
    isPanchakActive = now >= cache.panchak.startTimestamp && now <= cache.panchak.endTimestamp;
  }
  const isPanchakInauspicious = isPanchakActive && cache?.panchak?.isInauspicious !== false;
  const panchakType = isPanchakActive ? (cache?.panchak?.type || 'Panchak') : null;

  const festivalOrVrat = cache?.festivalOrVrat || null;

  // If a server push payload was provided directly, merge any specific attributes
  if (pushPayload) {
    if (pushPayload.tithi) currentTithi = pushPayload.tithi;
    if (pushPayload.festivalOrVrat !== undefined) festivalOrVrat = pushPayload.festivalOrVrat;
    if (pushPayload.panchak !== undefined) {
      isPanchakActive = Boolean(pushPayload.panchak?.isActive);
    }
  }

  const currentState = {
    tithi: currentTithi,
    panchak: {
      isActive: isPanchakActive,
      isInauspicious: isPanchakInauspicious,
      type: panchakType,
      statusText: cache?.panchak?.statusText
    },
    festivalOrVrat,
    dateStr: todayStr,
    timestamp: now
  };

  // 4. Retrieve last-notified state for deduplication
  const lastNotified = await idbGet('last_notified_state');

  // TRIGGER 1: Tithi change — current lunar day transitions to a new Tithi
  const tithiChanged = !lastNotified?.tithi || lastNotified.tithi !== currentTithi;

  // TRIGGER 2: Panchak period — active/starting (mark inauspicious status)
  const panchakStarting = isPanchakInauspicious && (
    !lastNotified?.isPanchakActive ||
    lastNotified.panchakType !== panchakType
  );

  // TRIGGER 3: Festival or Vrat observed on the current date
  const festivalTriggered = Boolean(festivalOrVrat) && (
    !lastNotified?.festivalDate ||
    lastNotified.festivalDate !== todayStr
  );

  const shouldNotify = force || tithiChanged || panchakStarting || festivalTriggered;

  if (!shouldNotify) {
    return { triggered: false, reason: 'IDEMPOTENT_NO_CHANGE' };
  }

  // 5. Build strict combined notification payload
  const title = 'Panchang Update';
  const body = formatNotificationBody(currentState);

  const notificationOptions = {
    body,
    icon: '/icon-192.svg',
    badge: '/icon-192.svg',
    tag: 'panchang-combined-alert',
    renotify: true,
    data: {
      url: '/',
      source,
      timestamp: now,
      triggers: {
        tithiChanged,
        panchakStarting,
        festivalTriggered
      }
    }
  };

  // 6. Show single combined notification
  await self.registration.showNotification(title, notificationOptions);

  // 7. Update last-notified state in IndexedDB to prevent duplicate pushes
  const nextNotifiedState = {
    tithi: currentTithi,
    isPanchakActive: isPanchakInauspicious,
    panchakType: isPanchakInauspicious ? panchakType : null,
    festivalDate: festivalOrVrat ? todayStr : (lastNotified?.festivalDate || null),
    festivalOrVrat,
    lastNotifiedAt: now
  };
  await idbSet('last_notified_state', nextNotifiedState);

  return {
    triggered: true,
    triggers: { tithiChanged, panchakStarting, festivalTriggered },
    title,
    body
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. PERIODIC BACKGROUND SYNC & WEB PUSH EVENT LISTENERS
// ─────────────────────────────────────────────────────────────────────────────

// Periodic Background Sync (Chromium: Android, Edge, Chrome Desktop)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'panchang-periodic-check') {
    event.waitUntil(checkAndNotifyPanchangChange({ source: 'periodic-background-sync' }));
  }
});

// Web Push API (Safari iOS/macOS, Firefox, Chrome fallback via server cron)
self.addEventListener('push', (event) => {
  let pushPayload = null;
  if (event.data) {
    try {
      pushPayload = event.data.json();
    } catch {
      pushPayload = { body: event.data.text() };
    }
  }

  event.waitUntil(
    checkAndNotifyPanchangChange({
      source: 'web-push',
      pushPayload,
      force: true // Push explicitly requested by server
    })
  );
});

// Direct Messages from Main Application Thread
self.addEventListener('message', (event) => {
  const data = event.data;
  if (!data) return;

  if (data.type === 'CHECK_AND_NOTIFY') {
    event.waitUntil(checkAndNotifyPanchangChange({ source: 'client-message', force: Boolean(data.force) }));
  } else if (data.type === 'SEED_CACHE' && data.cache) {
    event.waitUntil(idbSet('daily_panchang_cache', data.cache));
  } else if (data.type === 'SET_SETTINGS' && data.settings) {
    event.waitUntil(idbSet('notification_settings', data.settings));
  }
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
