/**
 * Automated Daily Floating Lock-Screen Push Trigger Route
 * POST /api/push/daily-floating-trigger
 * GET /api/push/daily-floating-trigger
 *
 * Dispatches the 5-line all-in-one floating lock-screen summary notification
 * to all active registered subscribers across Android, iOS PWA, and Desktop.
 */

import { NextRequest, NextResponse } from 'next/server';
import webpush, { getWebPushInstance } from '@/src/lib/webpush';
import {
  getAllSubscriptions,
  pruneIfStale,
  updateSubscriptionState,
  PushSubscriptionRecord
} from '@/src/lib/push/subscription-store';
import {
  buildDailyFloatingPayload,
  extractDailyPanchangData
} from '@/src/lib/push/dailySummaryPayload';
import { LocationCoordinates, PRESET_LOCATIONS } from '@/src/lib/vedic-astronomy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PUSH_OPTIONS: webpush.RequestOptions = {
  TTL: 43200,                    // 12-hour validity
  urgency: 'high',               // Deliver immediately through OS doze/power-saving
  topic: 'daily-floating-panchang'
};

function isAuthorized(req: NextRequest): boolean {
  // Support Vercel native cron request header
  const vercelCronHeader = req.headers.get('x-vercel-cron');
  if (vercelCronHeader === '1') {
    return true;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    if (process.env.NODE_ENV !== 'production') return true;
    console.warn('[CRON_WARN] CRON_SECRET not configured in production environment.');
    return true;
  }

  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

async function handleDispatch(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid CRON_SECRET authorization.' },
      { status: 401 }
    );
  }

  const wp = getWebPushInstance();
  if (!wp) {
    return NextResponse.json(
      {
        error: 'VAPID_NOT_CONFIGURED',
        message: 'VAPID credentials unconfigured on server. Please configure NEXT_PUBLIC_VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY.'
      },
      { status: 500 }
    );
  }

  const subscriptions: PushSubscriptionRecord[] = await getAllSubscriptions();
  const totalCount = subscriptions.length;
  const now = new Date();

  if (totalCount === 0) {
    return NextResponse.json({
      success: true,
      message: 'Zero active subscriptions found.',
      total: 0,
      timestamp: now.toISOString()
    });
  }

  let sentCount = 0;
  let failedCount = 0;
  let prunedCount = 0;

  const defaultLoc: LocationCoordinates = PRESET_LOCATIONS[0];

  const dispatchPromises = subscriptions.map(async (record) => {
    const userLoc: LocationCoordinates = (record.location?.latitude && record.location?.longitude)
      ? {
          name: record.location.name || 'User Location',
          country: 'India',
          latitude: record.location.latitude,
          longitude: record.location.longitude,
          timezone: record.location.timezone ?? 5.5,
          ianaTimezone: record.location.ianaTimezone || record.timezone || 'Asia/Kolkata',
          regionName: record.location.name || 'Local Region'
        }
      : defaultLoc;

    const pushSub = {
      endpoint: record.endpoint,
      keys: record.keys
    };

    // Extract panchang data using user coordinates and format 5-line floating card
    const dailyData = extractDailyPanchangData(now, userLoc);
    const floatingPayload = buildDailyFloatingPayload(dailyData);

    try {
      await wp.sendNotification(pushSub, JSON.stringify(floatingPayload), PUSH_OPTIONS);
      sentCount++;

      const localDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      await updateSubscriptionState(record.endpoint, {
        lastDailyDateNotified: localDateStr
      });

      return { status: 'sent', hash: record.endpointHash };
    } catch (err: unknown) {
      failedCount++;
      const wasPruned = await pruneIfStale(record.endpoint, err);
      if (wasPruned) {
        prunedCount++;
        return { status: 'pruned', hash: record.endpointHash };
      }
      return { status: 'failed', hash: record.endpointHash };
    }
  });

  const settledResults = await Promise.allSettled(dispatchPromises);

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    metrics: {
      total: totalCount,
      sentCount,
      failedCount,
      prunedCount,
      settledCount: settledResults.length
    }
  });
}

export async function GET(req: NextRequest) {
  return handleDispatch(req);
}

export async function POST(req: NextRequest) {
  return handleDispatch(req);
}
