/**
 * Admin Web Push Broadcast Engine
 * POST /api/push/admin-broadcast
 *
 * Dispatches an "App Update" (or custom announcement) push notification to all
 * active subscribers in the Supabase PostgreSQL database.
 * Protected by CRON_SECRET authorization.
 */

import { NextRequest, NextResponse } from 'next/server';
import webpush, { getWebPushInstance } from '@/src/lib/webpush';
import { getSupabaseAdmin } from '@/src/lib/supabase/client';
import { isStaleSubscriptionError } from '@/src/lib/push/subscription-store';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface AdminBroadcastBody {
  title?: string;
  body?: string;
  url?: string;
  version?: string;
  forceReload?: boolean;
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
 * Validates request authorization using the CRON_SECRET token.
 */
function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  }

  const authHeader = req.headers.get('authorization');
  const cronHeader = req.headers.get('x-cron-secret');
  return (
    authHeader === `Bearer ${cronSecret}` ||
    authHeader === cronSecret ||
    cronHeader === cronSecret
  );
}

export async function POST(req: NextRequest) {
  // 1. Authorize Request
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid CRON_SECRET.' },
      { status: 401 }
    );
  }

  // 2. Validate WebPush VAPID Configuration
  const wp = getWebPushInstance();
  if (!wp) {
    return NextResponse.json(
      { error: 'VAPID_NOT_CONFIGURED', message: 'VAPID keys unconfigured on server.' },
      { status: 500 }
    );
  }

  // 3. Parse Custom Payload
  let body: AdminBroadcastBody = {};
  try {
    body = await req.json();
  } catch {
    // Body is optional; fallback to defaults
  }

  const title = body.title?.trim() || '⚡ Daily Tithi Update Available';
  const messageBody =
    body.body?.trim() || 'A new update is available with improved Panchang calculations. Tap to refresh!';
  const targetUrl = body.url?.trim() || 'https://dailytithi.com/';
  const version = body.version?.trim() || Date.now().toString(36);
  const forceReload = body.forceReload !== false;

  // 4. Query Active Subscribers from Supabase using Service Role (bypasses RLS)
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(
      { error: 'DATABASE_UNAVAILABLE', message: 'Supabase client could not be initialized.' },
      { status: 500 }
    );
  }

  const { data: subscribers, error: dbError } = await supabase
    .from('push_subscriptions')
    .select('id, endpoint, endpoint_hash, p256dh, auth, user_timezone, is_active')
    .eq('is_active', true);

  if (dbError) {
    console.error('[Admin Broadcast] Database query error:', dbError.message);
    return NextResponse.json(
      { error: 'DATABASE_QUERY_ERROR', details: dbError.message },
      { status: 500 }
    );
  }

  const activeRows = (subscribers || []) as PushSubscriptionRow[];
  const totalCount = activeRows.length;

  if (totalCount === 0) {
    return NextResponse.json({
      success: true,
      message: 'Zero active subscribers in database. No notifications dispatched.',
      total: 0,
      sent: 0,
      failed: 0,
      pruned: 0,
      timestamp: new Date().toISOString()
    });
  }

  // 5. Build Push Payload (Tagged with 'app-update')
  const broadcastPayload = JSON.stringify({
    title,
    body: messageBody,
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
      timestamp: Date.now()
    },
    actions: [
      { action: 'update_now', title: '⚡ Update Now' },
      { action: 'dismiss', title: 'Later' }
    ]
  });

  const pushOptions: webpush.RequestOptions = {
    TTL: 86400, // 24 hours validity
    urgency: 'high',
    topic: 'app-update'
  };

  // 6. Concurrently Dispatch Notifications via Promise.allSettled
  let sentCount = 0;
  let failedCount = 0;
  let prunedCount = 0;

  const staleEndpoints: string[] = [];

  const results = await Promise.allSettled(
    activeRows.map(async (row) => {
      const subscription = {
        endpoint: row.endpoint,
        keys: {
          p256dh: row.p256dh,
          auth: row.auth
        }
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
          console.warn(`[Admin Broadcast Error] Sub ${row.endpoint_hash.slice(0, 8)}: ${errMsg}`);
        }
      }
    })
  );

  // 7. Auto-Prune Stale / Expired Endpoints in Bulk
  if (staleEndpoints.length > 0) {
    prunedCount = staleEndpoints.length;
    console.info(`[Admin Broadcast Auto-Prune] Marking ${prunedCount} dead endpoints as inactive in Supabase...`);
    await supabase
      .from('push_subscriptions')
      .update({ is_active: false })
      .in('endpoint', staleEndpoints);
  }

  return NextResponse.json({
    success: true,
    message: `Admin broadcast finished: ${sentCount} sent, ${failedCount} failed, ${prunedCount} auto-pruned.`,
    total: totalCount,
    sent: sentCount,
    failed: failedCount,
    pruned: prunedCount,
    version,
    timestamp: new Date().toISOString()
  });
}
