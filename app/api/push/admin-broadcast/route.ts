/**
 * Admin Web Push Broadcast Engine
 * POST /api/push/admin-broadcast
 *
 * Dispatches an "App Update" (or custom announcement) push notification to all
 * active subscribers in the Supabase PostgreSQL database.
 * Protected by CRON_SECRET authorization.
 */

import { NextRequest, NextResponse } from 'next/server';
import { broadcastAppUpdate, BroadcastAppUpdateOptions } from '@/src/lib/push/broadcast';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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

  // 2. Parse Custom Payload
  let body: BroadcastAppUpdateOptions = {};
  try {
    body = await req.json();
  } catch {
    // Body is optional; fallback to defaults
  }

  // 3. Dispatch Broadcast via Shared Helper
  const result = await broadcastAppUpdate(body);

  if (!result.success) {
    return NextResponse.json(
      {
        error: result.error || 'BROADCAST_FAILED',
        message: result.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(result);
}
