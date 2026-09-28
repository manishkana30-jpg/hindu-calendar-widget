/**
 * Persistent Push Subscription Storage
 * 
 * Supports:
 * 1. Vercel KV (if configured in production)
 * 2. Shared Cloud Object Store (zero-credential fallback that persists across all serverless lambda instances)
 * 3. In-memory Set (fast local cache)
 */

import { kv } from '@vercel/kv';
import type webpush from 'web-push';

const SHARED_STORE_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0d71c0bc80fb2';

export interface UserNotificationPreferences {
  dailyNotification: boolean;
  notificationTime: 'sunrise' | string; // 'sunrise' or '06:00', etc.
  alertOnTithiChange: boolean;
  autoUpdate: boolean;
  wifiOnly: boolean;
  sound?: boolean;
  vibration?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface StoredSubscriptionLocation {
  latitude: number;
  longitude: number;
  timezone?: number;
  ianaTimezone?: string;
  name?: string;
  source?: 'gps' | 'dropdown' | 'fallback';
}

export interface StoredSubscriptionRecord {
  subscription: webpush.PushSubscription;
  location?: StoredSubscriptionLocation;
  preferences?: UserNotificationPreferences;
  lastNotifiedDailyDate?: string | null;
  lastNotifiedTithiIndex?: number | null;
  lastNotifiedTithiTime?: number | null;
  createdAt: number;
  updatedAt: number;
}

interface GlobalSubscriptionPool {
  __push_subscriptions?: Set<string>;
}

function getMemoryPool(): Set<string> {
  const g = globalThis as unknown as GlobalSubscriptionPool;
  if (!g.__push_subscriptions) {
    g.__push_subscriptions = new Set<string>();
  }
  return g.__push_subscriptions;
}

/**
 * Normalizes any raw item (string or object, legacy or new) into a StoredSubscriptionRecord.
 */
export function normalizeSubscriptionRecord(item: unknown): StoredSubscriptionRecord | null {
  if (!item) return null;
  try {
    const obj = typeof item === 'string' ? JSON.parse(item) : item;

    // Check if it's already a full StoredSubscriptionRecord
    if (obj.subscription && obj.subscription.endpoint) {
      return {
        subscription: obj.subscription,
        location: obj.location || {
          latitude: 28.6139,
          longitude: 77.2090,
          timezone: 5.5,
          ianaTimezone: 'Asia/Kolkata',
          name: 'New Delhi (India)',
          source: 'fallback'
        },
        preferences: {
          dailyNotification: obj.preferences?.dailyNotification !== false,
          notificationTime: obj.preferences?.notificationTime || 'sunrise',
          alertOnTithiChange: Boolean(obj.preferences?.alertOnTithiChange),
          autoUpdate: obj.preferences?.autoUpdate !== false,
          wifiOnly: Boolean(obj.preferences?.wifiOnly),
          sound: obj.preferences?.sound !== false,
          vibration: obj.preferences?.vibration !== false,
          quietHoursEnabled: Boolean(obj.preferences?.quietHoursEnabled),
          quietHoursStart: obj.preferences?.quietHoursStart || '22:00',
          quietHoursEnd: obj.preferences?.quietHoursEnd || '06:00'
        },
        lastNotifiedDailyDate: obj.lastNotifiedDailyDate || null,
        lastNotifiedTithiIndex: obj.lastNotifiedTithiIndex || null,
        lastNotifiedTithiTime: obj.lastNotifiedTithiTime || null,
        createdAt: obj.createdAt || Date.now(),
        updatedAt: obj.updatedAt || Date.now()
      };
    }

    // Legacy format: raw PushSubscription object
    if (obj.endpoint) {
      return {
        subscription: obj,
        location: {
          latitude: 28.6139,
          longitude: 77.2090,
          timezone: 5.5,
          ianaTimezone: 'Asia/Kolkata',
          name: 'New Delhi (India)',
          source: 'fallback'
        },
        preferences: {
          dailyNotification: true,
          notificationTime: 'sunrise',
          alertOnTithiChange: false,
          autoUpdate: true,
          wifiOnly: false
        },
        lastNotifiedDailyDate: null,
        lastNotifiedTithiIndex: null,
        lastNotifiedTithiTime: null,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    }
  } catch {
    // parse error
  }
  return null;
}

/**
 * Returns all raw subscription strings (for backwards compatibility).
 */
export async function getAllSubscriptions(): Promise<string[]> {
  const records = await getAllSubscriptionRecords();
  return records.map(r => JSON.stringify(r));
}

/**
 * Returns all parsed StoredSubscriptionRecords.
 */
export async function getAllSubscriptionRecords(): Promise<StoredSubscriptionRecord[]> {
  const recordsMap = new Map<string, StoredSubscriptionRecord>(); // endpoint -> record

  // 1. In-memory pool
  const memPool = getMemoryPool();
  for (const s of memPool) {
    const rec = normalizeSubscriptionRecord(s);
    if (rec?.subscription?.endpoint) {
      recordsMap.set(rec.subscription.endpoint, rec);
    }
  }

  // 2. Vercel KV (if configured)
  const isKvConfigured = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  if (isKvConfigured) {
    try {
      const kvSubs = await kv.smembers('push_subscriptions');
      if (Array.isArray(kvSubs)) {
        for (const item of kvSubs) {
          const rec = normalizeSubscriptionRecord(item);
          if (rec?.subscription?.endpoint) {
            recordsMap.set(rec.subscription.endpoint, rec);
          }
        }
      }
    } catch (kvErr) {
      console.warn('Vercel KV smembers error:', kvErr);
    }
  }

  // 3. Shared Persistent Object Store
  try {
    const res = await fetch(SHARED_STORE_URL, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });
    if (res.ok) {
      const body = await res.json();
      const list = body?.data?.subscriptions;
      if (Array.isArray(list)) {
        for (const item of list) {
          const rec = normalizeSubscriptionRecord(item);
          if (rec?.subscription?.endpoint) {
            recordsMap.set(rec.subscription.endpoint, rec);
          }
        }
      }
    }
  } catch (storeErr) {
    console.warn('Shared store fetch warning:', storeErr);
  }

  return Array.from(recordsMap.values());
}

/**
 * Saves or updates a subscription with location and preferences.
 */
export async function saveSubscription(
  subInput: string | object | StoredSubscriptionRecord
): Promise<void> {
  const rec = normalizeSubscriptionRecord(subInput);
  if (!rec || !rec.subscription?.endpoint) return;

  const endpoint = rec.subscription.endpoint;
  rec.updatedAt = Date.now();
  const subStr = JSON.stringify(rec);

  // 1. Save to memory pool
  const memPool = getMemoryPool();
  // Clear any existing matching endpoint
  for (const s of Array.from(memPool)) {
    if (s.includes(endpoint)) memPool.delete(s);
  }
  memPool.add(subStr);

  // 2. Save to Vercel KV if available
  const isKvConfigured = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  if (isKvConfigured) {
    try {
      const all: (string | object)[] = await kv.smembers('push_subscriptions');
      for (const item of all) {
        const s = typeof item === 'string' ? item : JSON.stringify(item);
        if (s.includes(endpoint)) {
          await kv.srem('push_subscriptions', item);
        }
      }
      await kv.sadd('push_subscriptions', subStr);
    } catch (kvErr) {
      console.warn('Vercel KV save error:', kvErr);
    }
  }

  // 3. Save to Shared Persistent Object Store
  try {
    const current = await getAllSubscriptionRecords();
    const updatedList = current.filter(r => r.subscription.endpoint !== endpoint);
    updatedList.push(rec);

    await fetch(SHARED_STORE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'vedic_panchang_push_subscriptions',
        data: { subscriptions: updatedList }
      })
    });
  } catch (storeErr) {
    console.warn('Shared store update warning:', storeErr);
  }
}

/**
 * Updates deduplication state (e.g. lastNotifiedDailyDate, lastNotifiedTithiIndex) for an endpoint.
 */
export async function updateSubscriptionDedupe(
  endpoint: string,
  updates: {
    lastNotifiedDailyDate?: string | null;
    lastNotifiedTithiIndex?: number | null;
    lastNotifiedTithiTime?: number | null;
  }
): Promise<void> {
  const records = await getAllSubscriptionRecords();
  const rec = records.find(r => r.subscription.endpoint === endpoint);
  if (!rec) return;

  if (updates.lastNotifiedDailyDate !== undefined) {
    rec.lastNotifiedDailyDate = updates.lastNotifiedDailyDate;
  }
  if (updates.lastNotifiedTithiIndex !== undefined) {
    rec.lastNotifiedTithiIndex = updates.lastNotifiedTithiIndex;
  }
  if (updates.lastNotifiedTithiTime !== undefined) {
    rec.lastNotifiedTithiTime = updates.lastNotifiedTithiTime;
  }

  await saveSubscription(rec);
}

/**
 * Removes expired or invalid subscription from all storage tiers.
 */
export async function removeSubscription(endpoint: string): Promise<void> {
  if (!endpoint) return;

  // 1. Remove from memory
  const memPool = getMemoryPool();
  for (const s of Array.from(memPool)) {
    if (s.includes(endpoint)) {
      memPool.delete(s);
    }
  }

  // 2. Remove from Vercel KV
  const isKvConfigured = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  if (isKvConfigured) {
    try {
      const all: (string | object)[] = await kv.smembers('push_subscriptions');
      for (const item of all) {
        const s = typeof item === 'string' ? item : JSON.stringify(item);
        if (s.includes(endpoint)) {
          await kv.srem('push_subscriptions', item);
        }
      }
    } catch (kvErr) {
      console.warn('Vercel KV srem error:', kvErr);
    }
  }

  // 3. Remove from Shared Persistent Store
  try {
    const current = await getAllSubscriptionRecords();
    const filtered = current.filter(r => r.subscription.endpoint !== endpoint);

    await fetch(SHARED_STORE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'vedic_panchang_push_subscriptions',
        data: { subscriptions: filtered }
      })
    });
  } catch (storeErr) {
    console.warn('Shared store remove warning:', storeErr);
  }
}
