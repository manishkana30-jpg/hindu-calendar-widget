/**
 * Persistent Push Subscription Storage Bridge
 * 
 * Unified with Supabase PostgreSQL + KV Store + In-Memory Fallback.
 * Completely eliminates obsolete external mock store (api.restful-api.dev).
 */

import type webpush from 'web-push';
import {
  getAllSubscriptions as getAllUnifiedSubscriptions,
  upsertSubscription,
  deleteSubscription,
  PushSubscriptionRecord
} from '../push/subscription-store';

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
 * Returns all parsed StoredSubscriptionRecords, prioritizing Supabase & unified KV.
 */
export async function getAllSubscriptionRecords(): Promise<StoredSubscriptionRecord[]> {
  const recordsMap = new Map<string, StoredSubscriptionRecord>();

  // 1. In-memory pool
  const memPool = getMemoryPool();
  for (const s of memPool) {
    const rec = normalizeSubscriptionRecord(s);
    if (rec?.subscription?.endpoint) {
      recordsMap.set(rec.subscription.endpoint, rec);
    }
  }

  // 2. Query unified store (Supabase PostgreSQL + KV)
  try {
    const unifiedSubs = await getAllUnifiedSubscriptions();
    for (const sub of unifiedSubs) {
      if (sub.endpoint && !recordsMap.has(sub.endpoint)) {
        recordsMap.set(sub.endpoint, {
          subscription: {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.keys.p256dh,
              auth: sub.keys.auth
            }
          } as unknown as webpush.PushSubscription,
          location: sub.location ? {
            latitude: sub.location.latitude,
            longitude: sub.location.longitude,
            timezone: sub.location.timezone,
            ianaTimezone: sub.location.ianaTimezone,
            name: sub.location.name,
            source: 'gps'
          } : undefined,
          preferences: {
            dailyNotification: sub.preferences?.dailyNotification !== false,
            notificationTime: sub.preferences?.notificationTime || 'sunrise',
            alertOnTithiChange: Boolean(sub.preferences?.alertOnTithiChange),
            autoUpdate: sub.preferences?.autoUpdate !== false,
            wifiOnly: Boolean(sub.preferences?.wifiOnly),
            sound: sub.preferences?.sound !== false,
            vibration: sub.preferences?.vibration !== false,
            quietHoursEnabled: Boolean(sub.preferences?.quietHoursEnabled),
            quietHoursStart: sub.preferences?.quietHoursStart || '22:00',
            quietHoursEnd: sub.preferences?.quietHoursEnd || '06:00'
          },
          lastNotifiedDailyDate: sub.lastDailyDateNotified,
          lastNotifiedTithiIndex: sub.lastTithiIndexNotified,
          lastNotifiedTithiTime: sub.lastTithiNotifiedAt,
          createdAt: sub.createdAt,
          updatedAt: sub.lastValidated
        });
      }
    }
  } catch (err) {
    console.warn('[SubscriptionBridge] Unified fetch notice:', err);
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
  for (const s of Array.from(memPool)) {
    if (s.includes(endpoint)) memPool.delete(s);
  }
  memPool.add(subStr);

  // 2. Persistent save to unified Supabase / KV store
  try {
    const rawKeys = (rec.subscription as unknown as { keys?: { p256dh?: string; auth?: string } }).keys || {};
    if (rawKeys.p256dh && rawKeys.auth) {
      await upsertSubscription({
        endpoint,
        keys: {
          p256dh: rawKeys.p256dh,
          auth: rawKeys.auth
        },
        timezone: rec.location?.ianaTimezone || 'Asia/Kolkata',
        location: rec.location,
        preferences: rec.preferences
      });
    }
  } catch (err) {
    console.warn('[SubscriptionBridge] Save notice:', err);
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

  // 2. Remove from unified persistent store (Supabase + KV)
  try {
    await deleteSubscription(endpoint);
  } catch (err) {
    console.warn('[SubscriptionBridge] Remove notice:', err);
  }
}
