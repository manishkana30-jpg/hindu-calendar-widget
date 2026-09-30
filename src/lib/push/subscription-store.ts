/**
 * KV-Backed Push Subscription Storage
 * 
 * Manages persistent Web Push subscriptions within the Redis-compatible KV store
 * (provisioned via Vercel Marketplace, backed by @upstash/redis).
 * 
 * Storage Architecture:
 * - Subscriptions are keyed by SHA-256 hash of the endpoint URL: `push_sub:{endpointHash}`.
 * - An index set `push_sub_endpoints` tracks all active hashes for fast batch retrieval.
 * - Upsert logic preserves initial `createdAt` timestamp while updating keys, timezone, and `lastValidated`.
 * - Auto-prunes subscriptions on HTTP 404 / 410 errors returned by Push Services.
 */

import { Redis } from '@upstash/redis';
import crypto from 'crypto';

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
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
 * Computes deterministic SHA-256 hash of an endpoint URL for indexing in the KV store.
 */
export function computeEndpointHash(endpoint: string): string {
  return crypto.createHash('sha256').update(endpoint.trim()).digest('hex');
}

/**
 * Retrieves a single subscription by its endpoint URL.
 */
export async function getSubscription(endpoint: string): Promise<PushSubscriptionRecord | null> {
  if (!endpoint) return null;
  const hash = computeEndpointHash(endpoint);
  const key = `${KEY_PREFIX}${hash}`;

  const kv = getKvClient();
  if (kv) {
    try {
      const record = await kv.get<PushSubscriptionRecord>(key);
      if (record) return record;
    } catch (err: unknown) {
      console.warn(`The KV store get error for ${key}:`, err);
    }
  }

  return getMemoryStore().get(hash) || null;
}

/**
 * Upserts a push subscription record in the KV store.
 * If a subscription with the same endpoint already exists:
 * - Preserves original `createdAt` timestamp.
 * - Updates `keys`, `timezone`, `lastValidated`, and optional location.
 * - Prevents duplicate registrations from the same device.
 */
export async function upsertSubscription(
  input: UpsertSubscriptionInput
): Promise<PushSubscriptionRecord> {
  const { endpoint, keys, timezone = 'Asia/Kolkata', location } = input;
  const endpointHash = computeEndpointHash(endpoint);
  const key = `${KEY_PREFIX}${endpointHash}`;
  const now = Date.now();

  const existing = await getSubscription(endpoint);

  const record: PushSubscriptionRecord = {
    endpoint: endpoint.trim(),
    endpointHash,
    keys: {
      p256dh: keys.p256dh.trim(),
      auth: keys.auth.trim()
    },
    timezone: timezone || existing?.timezone || 'Asia/Kolkata',
    createdAt: existing?.createdAt || now,
    lastValidated: now,
    location: location || existing?.location
  };

  // 1. In-memory store update
  getMemoryStore().set(endpointHash, record);

  // 2. Persistent update in the KV store
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
 * Deletes a subscription from the KV store and index set.
 */
export async function deleteSubscription(endpoint: string): Promise<boolean> {
  if (!endpoint) return false;
  const endpointHash = computeEndpointHash(endpoint);
  const key = `${KEY_PREFIX}${endpointHash}`;

  getMemoryStore().delete(endpointHash);

  const kv = getKvClient();
  if (kv) {
    try {
      await kv.del(key);
      await kv.srem(INDEX_SET_KEY, endpointHash);
      return true;
    } catch (err: unknown) {
      console.error(`Failed to delete subscription from the KV store (${key}):`, err);
      return false;
    }
  }

  return true;
}

/**
 * Retrieves all active push subscriptions from the KV store.
 */
export async function getAllSubscriptions(): Promise<PushSubscriptionRecord[]> {
  const memoryStore = getMemoryStore();
  const recordsMap = new Map<string, PushSubscriptionRecord>();

  // Add memory store records first
  for (const [hash, rec] of memoryStore.entries()) {
    recordsMap.set(hash, rec);
  }

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
 * Automatically prunes a subscription from the KV store if the Push Service responded with 404 or 410.
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
