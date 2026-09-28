/**
 * Data-Efficient Panchang Offline Cache & Network Rules
 * 
 * Rules:
 * 1. Fetch only small JSON payloads (~1.5 KB), never full page reloads.
 * 2. Exponential backoff retry logic (never in a tight loop).
 * 3. Wi-Fi only vs Any Connection toggle awareness (navigator.connection).
 * 4. Offline persistence in IndexedDB / localStorage.
 * 5. Provides "Last updated: <time>" formatting.
 */

import { getStoredItem, setStoredItem } from './notifications/idb-storage';

export interface PanchangCacheMetadata {
  lastUpdated: number;
  lastUpdatedFormatted: string;
  source: 'network' | 'cache' | 'offline';
  isOffline: boolean;
}

const CACHE_KEY_METADATA = 'panchang_cache_meta';
const CACHE_KEY_SCHEDULE_DATA = 'panchang_schedule_data';
const SETTING_KEY_WIFI_ONLY = 'panchang_setting_wifi_only';

/**
 * Checks whether user has enabled Wi-Fi only mode, and whether current connection is cellular.
 */
export function isCellularRestricted(): boolean {
  if (typeof window === 'undefined') return false;

  const isWifiOnly = localStorage.getItem(SETTING_KEY_WIFI_ONLY) === 'true';
  if (!isWifiOnly) return false;

  // Check NetworkInformation API
  const nav = navigator as unknown as {
    connection?: {
      type?: string;
      effectiveType?: string;
      saveData?: boolean;
    };
  };

  if (nav.connection) {
    if (nav.connection.saveData) return true;
    if (nav.connection.type === 'cellular') return true;
    if (nav.connection.effectiveType === '2g' || nav.connection.effectiveType === 'slow-2g') return true;
  }

  return false;
}

/**
 * Sleep helper for exponential backoff.
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Robust fetch with exponential backoff retry.
 * Backoff sequence: 1000ms -> 2000ms -> 4000ms with jitter.
 */
export async function fetchWithExponentialBackoff<T>(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<T> {
  let attempt = 0;
  let baseDelay = 1000;

  while (attempt <= maxRetries) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Accept: 'application/json',
          ...(options.headers || {})
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as T;
      return data;
    } catch (err) {
      attempt++;
      if (attempt > maxRetries) {
        throw err;
      }
      // Exponential backoff with jitter
      const jitter = Math.random() * 300;
      const delay = Math.min(8000, baseDelay * Math.pow(2, attempt - 1)) + jitter;
      await sleep(delay);
    }
  }

  throw new Error('Fetch failed after max retries');
}

/**
 * Retrieves the cached 48-hour schedule from IndexedDB or localStorage.
 */
export async function getCachedScheduleData<T>(): Promise<{ data: T | null; meta: PanchangCacheMetadata }> {
  const metaRaw = await getStoredItem<PanchangCacheMetadata>(CACHE_KEY_METADATA);
  const data = await getStoredItem<T>(CACHE_KEY_SCHEDULE_DATA);

  const isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  const lastUpdated = metaRaw?.lastUpdated || Date.now();

  const meta: PanchangCacheMetadata = {
    lastUpdated,
    lastUpdatedFormatted: formatLastUpdatedTime(lastUpdated),
    source: data ? 'cache' : 'offline',
    isOffline: !isOnline
  };

  return { data, meta };
}

/**
 * Saves successfully fetched schedule data and updates the "Last updated" timestamp.
 */
export async function saveScheduleDataToCache<T>(data: T): Promise<PanchangCacheMetadata> {
  const now = Date.now();
  const meta: PanchangCacheMetadata = {
    lastUpdated: now,
    lastUpdatedFormatted: formatLastUpdatedTime(now),
    source: 'network',
    isOffline: false
  };

  await setStoredItem(CACHE_KEY_SCHEDULE_DATA, data);
  await setStoredItem(CACHE_KEY_METADATA, meta);

  if (typeof window !== 'undefined') {
    localStorage.setItem('panchang_last_updated', String(now));
  }

  return meta;
}

/**
 * Formats timestamp to a subtle "Last updated: <time>" string.
 */
export function formatLastUpdatedTime(timestamp: number): string {
  if (!timestamp) return 'Just now';
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;

  const d = new Date(timestamp);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
