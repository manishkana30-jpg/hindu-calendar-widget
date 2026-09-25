/**
 * Persistent Push Subscription Storage
 * 
 * Supports:
 * 1. Vercel KV (if configured in production)
 * 2. Shared Cloud Object Store (zero-credential fallback that persists across all serverless lambda instances)
 * 3. In-memory Set (fast local cache)
 */

import { kv } from '@vercel/kv';

const SHARED_STORE_URL = 'https://api.restful-api.dev/objects/ff808181a09d98f701a0d71c0bc80fb2';

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

export async function getAllSubscriptions(): Promise<string[]> {
  const subsMap = new Map<string, string>(); // endpoint -> full sub string

  // 1. In-memory pool
  const memPool = getMemoryPool();
  for (const s of memPool) {
    try {
      const parsed = JSON.parse(s);
      if (parsed.endpoint) subsMap.set(parsed.endpoint, s);
    } catch {
      subsMap.set(s, s);
    }
  }

  // 2. Vercel KV (if configured)
  const isKvConfigured = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  if (isKvConfigured) {
    try {
      const kvSubs = await kv.smembers('push_subscriptions');
      if (Array.isArray(kvSubs)) {
        for (const item of kvSubs) {
          const s = typeof item === 'string' ? item : JSON.stringify(item);
          try {
            const parsed = JSON.parse(s);
            if (parsed.endpoint) subsMap.set(parsed.endpoint, s);
          } catch {
            subsMap.set(s, s);
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
          const s = typeof item === 'string' ? item : JSON.stringify(item);
          try {
            const parsed = JSON.parse(s);
            if (parsed.endpoint) subsMap.set(parsed.endpoint, s);
          } catch {
            subsMap.set(s, s);
          }
        }
      }
    }
  } catch (storeErr) {
    console.warn('Shared store fetch warning:', storeErr);
  }

  return Array.from(subsMap.values());
}

export async function saveSubscription(subStr: string): Promise<void> {
  let endpoint = '';
  try {
    const parsed = JSON.parse(subStr);
    endpoint = parsed.endpoint || '';
  } catch {
    return;
  }
  if (!endpoint) return;

  // 1. Save to memory pool
  getMemoryPool().add(subStr);

  // 2. Save to Vercel KV if available
  const isKvConfigured = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  if (isKvConfigured) {
    try {
      await kv.sadd('push_subscriptions', subStr);
    } catch (kvErr) {
      console.warn('Vercel KV sadd error:', kvErr);
    }
  }

  // 3. Save to Shared Persistent Object Store
  try {
    const current = await getAllSubscriptions();
    const exists = current.some((s) => {
      try {
        return JSON.parse(s).endpoint === endpoint;
      } catch {
        return false;
      }
    });

    if (!exists) {
      const updatedList = [...current, subStr];
      await fetch(SHARED_STORE_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'vedic_panchang_push_subscriptions',
          data: { subscriptions: updatedList }
        })
      });
    }
  } catch (storeErr) {
    console.warn('Shared store update warning:', storeErr);
  }
}

export async function removeSubscription(endpoint: string): Promise<void> {
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
    const current = await getAllSubscriptions();
    const filtered = current.filter((s) => {
      try {
        return JSON.parse(s).endpoint !== endpoint;
      } catch {
        return !s.includes(endpoint);
      }
    });

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
