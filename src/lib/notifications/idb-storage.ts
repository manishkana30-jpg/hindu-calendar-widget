/**
 * Universal IndexedDB Storage for Vedic Panchang Background Notifications
 * 
 * Works identically in both ServiceWorkerGlobalScope and Window (browser tab) environments.
 * Manages:
 * 1. notification_settings (enabled / disabled status)
 * 2. last_notified_state (deduplication tracker for Tithi, Panchak, and Festival)
 * 3. daily_panchang_cache (cached ephemeris timetable for battery/data efficient zero-network checks)
 */

import { LastNotifiedState } from './state-diff';

export interface NotificationSettings {
  enabled: boolean;
  permission: NotificationPermission | 'unsupported';
  periodicSyncRegistered: boolean;
  pushSubscribed: boolean;
  updatedAt: number;
}

export interface CachedTithiInfo {
  index: number;
  name: string;
  endTimestamp: number;
  endTimeFormatted?: string;
}

export interface CachedPanchakInfo {
  isActive: boolean;
  isInauspicious: boolean;
  type?: string;
  statusText?: string;
  startTimestamp?: number;
  endTimestamp?: number;
}

export interface DailyPanchangCache {
  dateStr: string;
  dayWindowStart: number;
  dayWindowEnd: number;
  instantaneousTithi: CachedTithiInfo;
  nextTithi?: {
    index: number;
    name: string;
  };
  panchak: CachedPanchakInfo;
  festivalOrVrat?: string | null;
  cachedAt: number;
}

const DB_NAME = 'vedic_panchang_db';
const DB_VERSION = 1;
const STORE_NAME = 'notification_kv';

const KEY_SETTINGS = 'notification_settings';
const KEY_LAST_NOTIFIED = 'last_notified_state';
const KEY_DAILY_CACHE = 'daily_panchang_cache';

function getIndexedDB(): IDBFactory | null {
  if (typeof indexedDB !== 'undefined') {
    return indexedDB;
  }
  if (typeof self !== 'undefined' && 'indexedDB' in self) {
    return self.indexedDB;
  }
  return null;
}

function openDatabase(): Promise<IDBDatabase | null> {
  const idb = getIndexedDB();
  if (!idb) return Promise.resolve(null);

  return new Promise((resolve) => {
    try {
      const request = idb.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => {
        console.warn('Panchang IndexedDB open error:', request.error);
        resolve(null);
      };
    } catch (e) {
      console.warn('Panchang IndexedDB exception:', e);
      resolve(null);
    }
  });
}

export async function getStoredItem<T>(key: string): Promise<T | null> {
  const db = await openDatabase();
  if (!db) {
    // Fallback to localStorage if in Window context
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const item = window.localStorage.getItem(`panchang_${key}`);
        return item ? JSON.parse(item) : null;
      } catch {
        return null;
      }
    }
    return null;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);

      req.onsuccess = () => resolve((req.result as T) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

export async function setStoredItem<T>(key: string, value: T): Promise<void> {
  const db = await openDatabase();
  if (!db) {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(`panchang_${key}`, JSON.stringify(value));
      } catch {
        // Ignore storage write error
      }
    }
    return;
  }

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      store.put(value, key);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function getLastNotifiedState(): Promise<LastNotifiedState | null> {
  return getStoredItem<LastNotifiedState>(KEY_LAST_NOTIFIED);
}

export async function saveLastNotifiedState(state: LastNotifiedState): Promise<void> {
  return setStoredItem<LastNotifiedState>(KEY_LAST_NOTIFIED, state);
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  const settings = await getStoredItem<NotificationSettings>(KEY_SETTINGS);
  if (settings) return settings;

  const defaultSettings: NotificationSettings = {
    enabled: false,
    permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
    periodicSyncRegistered: false,
    pushSubscribed: false,
    updatedAt: Date.now()
  };
  return defaultSettings;
}

export async function saveNotificationSettings(settings: Partial<NotificationSettings>): Promise<NotificationSettings> {
  const current = await getNotificationSettings();
  const updated: NotificationSettings = {
    ...current,
    ...settings,
    updatedAt: Date.now()
  };
  await setStoredItem<NotificationSettings>(KEY_SETTINGS, updated);

  // Sync to localStorage for instant synchronous reads on page load
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      window.localStorage.setItem('panchang_notification_enabled', updated.enabled ? 'true' : 'false');
    } catch {
      // Ignore
    }
  }

  return updated;
}

export async function getDailyPanchangCache(): Promise<DailyPanchangCache | null> {
  return getStoredItem<DailyPanchangCache>(KEY_DAILY_CACHE);
}

export async function saveDailyPanchangCache(cache: DailyPanchangCache): Promise<void> {
  return setStoredItem<DailyPanchangCache>(KEY_DAILY_CACHE, cache);
}
