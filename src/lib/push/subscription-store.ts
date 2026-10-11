/**
 * Hybrid Push Subscription Storage (Supabase PostgreSQL + KV + In-Memory Fallback)
 * 
 * Manages persistent Web Push subscriptions with a resilient, multi-tiered hierarchy:
 * 1. Supabase PostgreSQL (Primary): Persistent relational storage with indexed querying & RLS.
 * 2. Vercel KV / Upstash Redis: Key-value cache and fallback.
 * 3. In-Memory Map: High-speed local cache for tests and offline development.
 * 
 * Storage Architecture:
 * - Subscriptions are identified by their unique push service `endpoint`.
 * - SHA-256 hash `endpointHash` is used for fast lookup indexing.
 * - Upsert logic preserves initial `createdAt` timestamp while updating keys, timezone, and `lastValidated`.
 * - Auto-prunes subscriptions on HTTP 404 / 410 errors returned by Push Services.
 */

import { Redis } from '@upstash/redis';
import crypto from 'crypto';
import { getSupabaseAdmin } from '../supabase/client';

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscriptionPreferences {
  dailyNotification?: boolean;
  notificationTime?: string; // 'sunrise' or '05:00', '06:00', etc.
  alertOnTithiChange?: boolean;
  autoUpdate?: boolean;
  wifiOnly?: boolean;
  sound?: boolean;
  vibration?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  endpointHash: string;
  keys: PushSubscriptionKeys;
  timezone: string;
  createdAt: number;
  lastValidated: number;
  location?: {
    latitude: number;
    longitude: number;
    timezone?: number;
    ianaTimezone?: string;
    name?: string;
  };
  preferences?: PushSubscriptionPreferences;
  lastDailyDateNotified?: string | null;
  lastTithiIndexNotified?: number | null;
  lastTithiNotifiedAt?: number | null;
}

export interface UpsertSubscriptionInput {
  endpoint: string;
  keys: PushSubscriptionKeys;
  timezone?: string;
  location?: {
    latitude: number;
    longitude: number;
    timezone?: number;
    ianaTimezone?: string;
    name?: string;
  };
  preferences?: PushSubscriptionPreferences;
  lastDailyDateNotified?: string | null;
  lastTithiIndexNotified?: number | null;
  lastTithiNotifiedAt?: number | null;
  isActive?: boolean;
  is_active?: boolean;
}

interface SupabasePushSubscriptionRow {
  id?: string;
  endpoint: string;
  endpoint_hash: string;
  p256dh: string;
  auth: string;
  user_timezone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  location_name?: string | null;
  location_timezone_offset?: number | null;
  preferences?: PushSubscriptionPreferences | null;
  last_daily_date_notified?: string | null;
  last_tithi_index_notified?: number | null;
  last_tithi_notified_at?: number | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_validated_at?: string;
}

const KEY_PREFIX = 'push_sub:';
const INDEX_SET_KEY = 'push_sub_endpoints';

// ── In-Memory Fallback Pool for Local Development & Testing ──────────────────
interface GlobalSubscriptionMemory {
  __push_sub_memory_map?: Map<string, PushSubscriptionRecord>;
}

function getMemoryStore(): Map<string, PushSubscriptionRecord> {
  const g = globalThis as unknown as GlobalSubscriptionMemory;
  if (!g.__push_sub_memory_map) {
    g.__push_sub_memory_map = new Map<string, PushSubscriptionRecord>();
  }
  return g.__push_sub_memory_map;
}

// ── KV Client Initialization ─────────────────────────────────────────────────
function getKvClient(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;

  if (url && token) {
    try {
      return new Redis({ url, token });
    } catch (err: unknown) {
      console.warn('Failed to initialize the KV store client; using in-memory fallback:', err);
    }
  }
  return null;
}

/**
 * Transforms a Supabase PostgreSQL row into a standardized PushSubscriptionRecord.
 */
function rowToRecord(row: SupabasePushSubscriptionRow): PushSubscriptionRecord {
  return {
    endpoint: row.endpoint,
    endpointHash: row.endpoint_hash,
    keys: {
      p256dh: row.p256dh,
      auth: row.auth,
    },
    timezone: row.user_timezone || 'Asia/Kolkata',
    createdAt: row.created_at ? new Date(row.created_at).getTime() : Date.now(),
    lastValidated: row.last_validated_at ? new Date(row.last_validated_at).getTime() : Date.now(),
    location:
      row.latitude !== null && row.latitude !== undefined && row.longitude !== null && row.longitude !== undefined
        ? {
            latitude: row.latitude,
            longitude: row.longitude,
            timezone: row.location_timezone_offset ?? 5.5,
            ianaTimezone: row.user_timezone ?? 'Asia/Kolkata',
            name: row.location_name ?? undefined,
          }
        : undefined,
    preferences: row.preferences || {},
    lastDailyDateNotified: row.last_daily_date_notified ?? null,
    lastTithiIndexNotified: row.last_tithi_index_notified ?? null,
    lastTithiNotifiedAt: row.last_tithi_notified_at ?? null,
  };
}

/**
 * Computes deterministic SHA-256 hash of an endpoint URL for indexing.
 */
export function computeEndpointHash(endpoint: string): string {
  return crypto.createHash('sha256').update(endpoint.trim()).digest('hex');
}

/**
 * Retrieves a single subscription by its endpoint URL.
 */
export async function getSubscription(endpoint: string): Promise<PushSubscriptionRecord | null> {
  if (!endpoint) return null;
  const cleanEndpoint = endpoint.trim();
  const hash = computeEndpointHash(cleanEndpoint);
  const key = `${KEY_PREFIX}${hash}`;

  // 1. Check Supabase PostgreSQL
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('endpoint', cleanEndpoint)
        .maybeSingle();

      if (!error && data) {
        const record = rowToRecord(data as SupabasePushSubscriptionRow);
        getMemoryStore().set(hash, record);
        return record;
      }
    } catch (err: unknown) {
      console.warn(`[SubscriptionStore] Supabase get error for endpoint ${cleanEndpoint.slice(0, 32)}:`, err);
    }
  }

  // 2. Check KV Store
  const kv = getKvClient();
  if (kv) {
    try {
      const record = await kv.get<PushSubscriptionRecord>(key);
      if (record) {
        getMemoryStore().set(hash, record);
        return record;
      }
    } catch (err: unknown) {
      console.warn(`[SubscriptionStore] KV store get error for ${key}:`, err);
    }
  }

  // 3. Check In-Memory Store
  return getMemoryStore().get(hash) || null;
}

/**
 * Upserts a push subscription record in Supabase PostgreSQL, KV store, and memory.
 * If a subscription with the same endpoint already exists:
 * - Preserves original `createdAt` timestamp.
 * - Updates `keys`, `timezone`, `lastValidated`, and optional location/preferences.
 * - Prevents duplicate registrations from the same device.
 */
export async function upsertSubscription(
  input: UpsertSubscriptionInput
): Promise<PushSubscriptionRecord> {
  const { endpoint, keys, timezone = 'Asia/Kolkata', location } = input;
  const cleanEndpoint = endpoint.trim();
  const endpointHash = computeEndpointHash(cleanEndpoint);
  const key = `${KEY_PREFIX}${endpointHash}`;
  const now = Date.now();

  const existing = await getSubscription(cleanEndpoint);

  const record: PushSubscriptionRecord = {
    endpoint: cleanEndpoint,
    endpointHash,
    keys: {
      p256dh: keys.p256dh.trim(),
      auth: keys.auth.trim(),
    },
    timezone: timezone || existing?.timezone || 'Asia/Kolkata',
    createdAt: existing?.createdAt || now,
    lastValidated: now,
    location: location || existing?.location,
    preferences: {
      dailyNotification:
        input.preferences?.dailyNotification !== undefined
          ? input.preferences.dailyNotification
          : (existing?.preferences?.dailyNotification !== false),
      notificationTime:
        input.preferences?.notificationTime || existing?.preferences?.notificationTime || 'sunrise',
      alertOnTithiChange:
        input.preferences?.alertOnTithiChange !== undefined
          ? input.preferences.alertOnTithiChange
          : Boolean(existing?.preferences?.alertOnTithiChange),
      autoUpdate:
        input.preferences?.autoUpdate !== undefined
          ? input.preferences.autoUpdate
          : (existing?.preferences?.autoUpdate !== false),
      wifiOnly:
        input.preferences?.wifiOnly !== undefined
          ? input.preferences.wifiOnly
          : Boolean(existing?.preferences?.wifiOnly),
      sound:
        input.preferences?.sound !== undefined
          ? input.preferences.sound
          : (existing?.preferences?.sound !== false),
      vibration:
        input.preferences?.vibration !== undefined
          ? input.preferences.vibration
          : (existing?.preferences?.vibration !== false),
    },
    lastDailyDateNotified:
      input.lastDailyDateNotified !== undefined
        ? input.lastDailyDateNotified
        : (existing?.lastDailyDateNotified ?? null),
    lastTithiIndexNotified:
      input.lastTithiIndexNotified !== undefined
        ? input.lastTithiIndexNotified
        : (existing?.lastTithiIndexNotified ?? null),
    lastTithiNotifiedAt:
      input.lastTithiNotifiedAt !== undefined
        ? input.lastTithiNotifiedAt
        : (existing?.lastTithiNotifiedAt ?? null),
  };

  // 1. In-memory store update
  getMemoryStore().set(endpointHash, record);

  // 2. Persistent update in Supabase PostgreSQL
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const row = {
        endpoint: record.endpoint,
        endpoint_hash: record.endpointHash,
        p256dh: record.keys.p256dh,
        auth: record.keys.auth,
        user_timezone: record.timezone,
        latitude: record.location?.latitude ?? null,
        longitude: record.location?.longitude ?? null,
        location_name: record.location?.name ?? null,
        location_timezone_offset: record.location?.timezone ?? null,
        preferences: record.preferences,
        last_daily_date_notified: record.lastDailyDateNotified ?? null,
        last_tithi_index_notified: record.lastTithiIndexNotified ?? null,
        last_tithi_notified_at: record.lastTithiNotifiedAt ?? null,
        is_active: input.isActive !== undefined ? input.isActive : (input.is_active !== undefined ? input.is_active : true),
        last_validated_at: new Date(record.lastValidated).toISOString(),
      };

      const { error } = await supabase
        .from('push_subscriptions')
        .upsert(row, { onConflict: 'endpoint' });

      if (error) {
        console.error('[SubscriptionStore] Supabase upsert failed:', error.message);
      }
    } catch (err: unknown) {
      console.error('[SubscriptionStore] Supabase upsert exception:', err);
    }
  }

  // 3. Persistent update in KV store (if provisioned)
  const kv = getKvClient();
  if (kv) {
    try {
      // 90 days retention (refreshed on each validation/upsert)
      await kv.set(key, record, { ex: 90 * 86400 });
      await kv.sadd(INDEX_SET_KEY, endpointHash);
    } catch (err: unknown) {
      console.error(`Failed to upsert subscription in the KV store (${key}):`, err);
    }
  }

  return record;
}

/**
 * Updates execution state or preferences for an existing subscription.
 */
export async function updateSubscriptionState(
  endpoint: string,
  updates: {
    lastDailyDateNotified?: string | null;
    lastTithiIndexNotified?: number | null;
    lastTithiNotifiedAt?: number | null;
    preferences?: Partial<PushSubscriptionPreferences>;
  }
): Promise<PushSubscriptionRecord | null> {
  const existing = await getSubscription(endpoint);
  if (!existing) return null;

  const mergedPreferences = updates.preferences
    ? { ...existing.preferences, ...updates.preferences }
    : existing.preferences;

  return upsertSubscription({
    endpoint: existing.endpoint,
    keys: existing.keys,
    timezone: existing.timezone,
    location: existing.location,
    preferences: mergedPreferences,
    lastDailyDateNotified:
      updates.lastDailyDateNotified !== undefined
        ? updates.lastDailyDateNotified
        : existing.lastDailyDateNotified,
    lastTithiIndexNotified:
      updates.lastTithiIndexNotified !== undefined
        ? updates.lastTithiIndexNotified
        : existing.lastTithiIndexNotified,
    lastTithiNotifiedAt:
      updates.lastTithiNotifiedAt !== undefined
        ? updates.lastTithiNotifiedAt
        : existing.lastTithiNotifiedAt,
  });
}

export interface UpdateSubscriptionPreferencesInput {
  endpoint: string;
  isActive?: boolean;
  is_active?: boolean;
  preferences?: Partial<PushSubscriptionPreferences>;
  location?: {
    latitude: number;
    longitude: number;
    timezone?: number;
    ianaTimezone?: string;
    name?: string;
  };
  timezone?: string;
}

/**
 * Updates an existing subscription's active state, preferences, and/or location in Supabase PostgreSQL and caches.
 */
export async function updateSubscriptionPreferences(
  input: UpdateSubscriptionPreferencesInput
): Promise<boolean> {
  if (!input.endpoint) return false;
  const cleanEndpoint = input.endpoint.trim();
  const endpointHash = computeEndpointHash(cleanEndpoint);
  const activeStatus = input.isActive !== undefined ? input.isActive : (input.is_active !== undefined ? input.is_active : undefined);

  let success = true;

  // 1. Supabase PostgreSQL update
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const updateData: Record<string, unknown> = {
        last_validated_at: new Date().toISOString(),
      };

      if (activeStatus !== undefined) {
        updateData.is_active = activeStatus;
      }

      if (input.preferences) {
        // Fetch existing preferences first to merge cleanly
        const { data: existingRow } = await supabase
          .from('push_subscriptions')
          .select('preferences')
          .eq('endpoint', cleanEndpoint)
          .maybeSingle();

        const currentPrefs = (existingRow?.preferences as PushSubscriptionPreferences) || {};
        updateData.preferences = {
          ...currentPrefs,
          ...input.preferences
        };
      }

      if (input.location) {
        updateData.latitude = input.location.latitude;
        updateData.longitude = input.location.longitude;
        updateData.location_name = input.location.name ?? null;
        updateData.location_timezone_offset = input.location.timezone ?? null;
        if (input.location.ianaTimezone) {
          updateData.user_timezone = input.location.ianaTimezone;
        }
      }

      if (input.timezone) {
        updateData.user_timezone = input.timezone;
      }

      const { error } = await supabase
        .from('push_subscriptions')
        .update(updateData)
        .eq('endpoint', cleanEndpoint);

      if (error) {
        console.error('[SubscriptionStore] Supabase update preferences failed:', error.message);
        success = false;
      }
    } catch (err: unknown) {
      console.error('[SubscriptionStore] Supabase update exception:', err);
      success = false;
    }
  }

  // 2. Memory store update
  const memStore = getMemoryStore();
  const existingMem = memStore.get(endpointHash);
  if (existingMem) {
    if (input.preferences) {
      existingMem.preferences = {
        ...existingMem.preferences,
        ...input.preferences
      };
    }
    if (input.location) {
      existingMem.location = input.location;
    }
    existingMem.lastValidated = Date.now();
  }

  // 3. KV store update (if provisioned)
  const kv = getKvClient();
  if (kv) {
    try {
      const key = `${KEY_PREFIX}${endpointHash}`;
      const existingKv = await kv.get<PushSubscriptionRecord>(key);
      if (existingKv) {
        if (input.preferences) {
          existingKv.preferences = {
            ...existingKv.preferences,
            ...input.preferences
          };
        }
        if (input.location) {
          existingKv.location = input.location;
        }
        existingKv.lastValidated = Date.now();
        await kv.set(key, existingKv);
      }
    } catch (kvErr) {
      console.warn('[SubscriptionStore] KV update note:', kvErr);
    }
  }

  return success;
}

/**
 * Deletes a subscription from Supabase PostgreSQL, KV store, and memory.
 */
export async function deleteSubscription(endpoint: string): Promise<boolean> {
  if (!endpoint) return false;
  const cleanEndpoint = endpoint.trim();
  const endpointHash = computeEndpointHash(cleanEndpoint);
  const key = `${KEY_PREFIX}${endpointHash}`;

  getMemoryStore().delete(endpointHash);

  let success = true;

  // 1. Delete from Supabase PostgreSQL
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('endpoint', cleanEndpoint);

      if (error) {
        console.error('[SubscriptionStore] Supabase delete error:', error.message);
        success = false;
      }
    } catch (err: unknown) {
      console.error('[SubscriptionStore] Supabase delete exception:', err);
      success = false;
    }
  }

  // 2. Delete from KV Store
  const kv = getKvClient();
  if (kv) {
    try {
      await kv.del(key);
      await kv.srem(INDEX_SET_KEY, endpointHash);
    } catch (err: unknown) {
      console.error(`Failed to delete subscription from the KV store (${key}):`, err);
      success = false;
    }
  }

  return success;
}

/**
 * Retrieves all active push subscriptions.
 * Prioritizes Supabase PostgreSQL, falling back to KV store and in-memory pool.
 */
export async function getAllSubscriptions(): Promise<PushSubscriptionRecord[]> {
  const memoryStore = getMemoryStore();
  const recordsMap = new Map<string, PushSubscriptionRecord>();

  // Add memory store records first
  for (const [hash, rec] of memoryStore.entries()) {
    recordsMap.set(hash, rec);
  }

  // 1. Query Supabase PostgreSQL
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('is_active', true);

      if (!error && data && Array.isArray(data)) {
        for (const row of data as SupabasePushSubscriptionRow[]) {
          const rec = rowToRecord(row);
          recordsMap.set(rec.endpointHash, rec);
        }
        return Array.from(recordsMap.values());
      }
    } catch (err: unknown) {
      console.warn('[SubscriptionStore] Supabase bulk fetch error, falling back to KV/memory:', err);
    }
  }

  // 2. Query KV Store
  const kv = getKvClient();
  if (kv) {
    try {
      const hashes = await kv.smembers(INDEX_SET_KEY);
      if (Array.isArray(hashes) && hashes.length > 0) {
        const pipeline = kv.pipeline();
        for (const hash of hashes) {
          pipeline.get<PushSubscriptionRecord>(`${KEY_PREFIX}${hash}`);
        }
        const results = await pipeline.exec();
        const orphanedHashes: string[] = [];

        results.forEach((item, index) => {
          const rec = item as PushSubscriptionRecord | null;
          const hash = hashes[index];
          if (rec && rec.endpoint) {
            recordsMap.set(hash, rec);
          } else {
            orphanedHashes.push(hash);
          }
        });

        // Clean up orphaned index references asynchronously
        if (orphanedHashes.length > 0) {
          kv.srem(INDEX_SET_KEY, ...orphanedHashes).catch(() => {});
        }
      }
    } catch (err: unknown) {
      console.warn('The KV store bulk fetch error, falling back to cached records:', err);
    }
  }

  return Array.from(recordsMap.values());
}

/**
 * Checks whether an error indicates an expired or uninstalled push subscription.
 * Push Services (FCM, Mozilla, Apple APNs) return HTTP 404 Not Found or HTTP 410 Gone
 * when an endpoint is deactivated, revoked, or expired.
 */
export function isStaleSubscriptionError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null) {
    const errObj = error as { statusCode?: number; status?: number; code?: number };
    const statusCode = errObj.statusCode ?? errObj.status ?? errObj.code;
    return statusCode === 404 || statusCode === 410;
  }
  return false;
}

/**
 * Automatically prunes a subscription if the Push Service responded with 404 or 410.
 * Returns true if the subscription was stale and pruned, false otherwise.
 */
export async function pruneIfStale(endpoint: string, error: unknown): Promise<boolean> {
  if (isStaleSubscriptionError(error)) {
    console.info(`[Auto-Prune] Deleting expired push endpoint (404/410): ${endpoint.slice(0, 32)}...`);
    await deleteSubscription(endpoint);
    return true;
  }
  return false;
}
