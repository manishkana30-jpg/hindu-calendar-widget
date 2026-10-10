/**
 * Test Push Dispatch Route
 * POST /api/push/test
 *
 * Dispatches the formatted 5-line all-in-one floating lock-screen
 * notification card directly to the testing device subscription.
 */

import { NextRequest, NextResponse } from 'next/server';
import webpush, { getWebPushInstance, isVapidConfigured, getVapidPublicKey } from '@/src/lib/webpush';
import { pruneIfStale } from '@/src/lib/push/subscription-store';
import { buildDailyFloatingPayload, extractDailyPanchangData } from '@/src/lib/push/dailySummaryPayload';
import { LocationCoordinates, PRESET_LOCATIONS } from '@/src/lib/vedic-astronomy';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TestPushRequestBody {
  subscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  location?: LocationCoordinates;
}

const PUSH_OPTIONS: webpush.RequestOptions = {
  TTL: 43200,                    // 12 hours
  urgency: 'high',               // Deliver immediately
  topic: 'daily-floating-panchang'
};

export async function GET() {
  const configured = isVapidConfigured();
  return NextResponse.json({
    status: 'ok',
    vapidConfigured: configured,
    publicKey: getVapidPublicKey()
  });
}

export async function POST(req: NextRequest) {
  const wp = getWebPushInstance();
  if (!wp) {
    return NextResponse.json(
      {
        error: 'VAPID_NOT_CONFIGURED',
        message: 'VAPID credentials unconfigured on server. Please run "npm run generate-vapid" or configure environment variables.'
      },
      { status: 500 }
    );
  }

  let body: TestPushRequestBody;
  try {
    body = (await req.json()) as TestPushRequestBody;
  } catch {
    return NextResponse.json(
      { error: 'INVALID_PAYLOAD', message: 'Request body must be valid JSON.' },
      { status: 400 }
    );
  }

  const sub = body.subscription;
  if (!sub || !sub.endpoint || !sub.keys?.p256dh || !sub.keys?.auth) {
    return NextResponse.json(
      { error: 'MISSING_SUBSCRIPTION', message: 'Target push subscription details are required.' },
      { status: 400 }
    );
  }

  const loc: LocationCoordinates = body.location || PRESET_LOCATIONS[0];
  const now = new Date();

  // Extract live astrometric data and format floating payload
  const dailyData = extractDailyPanchangData(now, loc);
  const floatingPayload = buildDailyFloatingPayload(dailyData);

  try {
    await wp.sendNotification(sub, JSON.stringify(floatingPayload), PUSH_OPTIONS);
    return NextResponse.json({
      success: true,
      message: 'Daily floating test notification dispatched successfully.',
      payload: floatingPayload,
      deliveredTo: sub.endpoint.slice(0, 32) + '...'
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Push notification dispatch failed';
    console.error('[Test Push Error]', err);
    await pruneIfStale(sub.endpoint, err);

    return NextResponse.json(
      {
        error: 'DISPATCH_FAILED',
        message: 'Failed to deliver test notification to device.',
        details: errorMsg
      },
      { status: 500 }
    );
  }
}
