/**
 * Shared VAPID Broadcast Engine
 * Dispatches targeted or broadcast push notifications to active subscribers
 * using the configured VAPID credentials and Supabase database.
 */

import webpush, { getWebPushInstance } from '../webpush';
import { getSupabaseAdmin } from '../supabase/client';
import { isStaleSubscriptionError } from './subscription-store';

export interface BroadcastAppUpdateOptions {
  title?: string;
  body?: string;
  url?: string;
  version?: string;
  forceReload?: boolean;
}

export interface BroadcastAppUpdateResult {
  success: boolean;
  message: string;
  total: number;
  sent: number;
  failed: number;
  pruned: number;
  version: string;
  timestamp: string;
  error?: string;
}

interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  endpoint_hash: string;
  p256dh: string;
  auth: string;
  user_timezone: string | null;
  is_active: boolean;
}

/**
 * Dispatches an "App Update" push notification broadcast to all active subscribers.
 * Handles parallel dispatching, RFC 8292 signing, and automatic 404/410 expiration pruning.
 */
export async function broadcastAppUpdate(
  options: BroadcastAppUpdateOptions = {}
): Promise<BroadcastAppUpdateResult> {
  const wp = getWebPushInstance();
  if (!wp) {
    return {
      success: false,
      message: 'VAPID credentials unconfigured. Please configure NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY in .env.local.',
      total: 0,
      sent: 0,
      failed: 0,
      pruned: 0,
      version: options.version || Date.now().toString(36),
      timestamp: new Date().toISOString(),
      error: 'VAPID_NOT_CONFIGURED',
    };
  }

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return {
      success: false,
      message: 'Supabase client could not be initialized.',
      total: 0,
      sent: 0,
      failed: 0,
      pruned: 0,
      version: options.version || Date.now().toString(36),
      timestamp: new Date().toISOString(),
      error: 'DATABASE_UNAVAILABLE',
    };
  }

  const title = options.title?.trim() || '⚡ New Update Available: Tap to refresh Daily Tithi';
  const body =
    options.body?.trim() ||
    'A new update is available with improved Panchang calculations. Tap to refresh!';
  const targetUrl = options.url?.trim() || 'https://dailytithi.com/';
  const version = options.version?.trim() || Date.now().toString(36);
  const forceReload = options.forceReload !== false;

  const { data: subscribers, error: dbError } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, endpoint_hash, p256dh, auth, user_timezone, is_active')
    .eq('is_active', true);

  if (dbError) {
    return {
      success: false,
      message: `Database query error: ${dbError.message}`,
      total: 0,
      sent: 0,
      failed: 0,
      pruned: 0,
      version,
      timestamp: new Date().toISOString(),
      error: 'DATABASE_QUERY_ERROR',
    };
  }

  const activeRows = (subscribers || []) as PushSubscriptionRow[];
  const totalCount = activeRows.length;

  if (totalCount === 0) {
    return {
      success: true,
      message: 'Zero active subscribers in database. No notifications dispatched.',
      total: 0,
      sent: 0,
      failed: 0,
      pruned: 0,
      version,
      timestamp: new Date().toISOString(),
    };
  }

  const broadcastPayload = JSON.stringify({
    title,
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'app-update',
    renotify: true,
    requireInteraction: true,
    vibrate: [200, 100, 200],
    data: {
      url: targetUrl,
      tag: 'app-update',
      isAppUpdate: true,
      forceReload,
      version,
      timestamp: Date.now(),
    },
    actions: [
      { action: 'update_now', title: '⚡ Update Now' },
      { action: 'dismiss', title: 'Later' },
    ],
  });

  const pushOptions: webpush.RequestOptions = {
    TTL: 86400,
    urgency: 'high',
    topic: 'app-update',
  };

  let sentCount = 0;
  let failedCount = 0;
  const staleEndpoints: string[] = [];

  await Promise.allSettled(
    activeRows.map(async (row) => {
      const subscription = {
        endpoint: row.endpoint,
        keys: {
          p256dh: row.p256dh,
          auth: row.auth,
        },
      };

      try {
        await wp.sendNotification(subscription, broadcastPayload, pushOptions);
        sentCount++;
      } catch (err: unknown) {
        failedCount++;
        if (isStaleSubscriptionError(err)) {
          staleEndpoints.push(row.endpoint);
        } else {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.warn(`[Broadcast Error] Sub ${row.endpoint_hash.slice(0, 8)}: ${errMsg}`);
        }
      }
    })
  );

  let prunedCount = 0;
  if (staleEndpoints.length > 0) {
    prunedCount = staleEndpoints.length;
    await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .in('endpoint', staleEndpoints);
  }

  return {
    success: true,
    message: `Broadcast finished: ${sentCount} sent, ${failedCount} failed, ${prunedCount} auto-pruned.`,
    total: totalCount,
    sent: sentCount,
    failed: failedCount,
    pruned: prunedCount,
    version,
    timestamp: new Date().toISOString(),
  };
}
