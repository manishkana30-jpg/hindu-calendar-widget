/**
 * Server-Side Daily Push Trigger & Cron Dispatch Engine
 * 
 * ─────────────────────────────────────────────────────────────────────────────
 * CRON FREQUENCY REALITY CHECK:
 * - Vercel Hobby Plan: Crons are strictly limited to ONCE DAILY (1 invocation/day).
 * - Vercel Pro Plan: Crons can run up to once per minute or hourly (e.g. `0 * * * *`).
 * This project defaults to a daily morning trigger cadence appropriate for Vercel
 * Hobby (e.g. `0 0 * * *` UTC / 05:30 AM IST).
 * Do NOT assume minute-level or sub-hourly cron execution without an active Vercel Pro plan.
 * ─────────────────────────────────────────────────────────────────────────────
 * 
 * VAPID KEY ROTATION SECURITY RULE:
 * Require VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT (mailto: contact).
 * Generate once using `npx web-push generate-vapid-keys`.
 * CAUTION: Regenerating VAPID keys immediately invalidates EVERY existing user
 * push subscription across all browser vendors. Never rotate keys casually.
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import {
  getAllSubscriptions,
  pruneIfStale,
  PushSubscriptionRecord
} from '@/src/lib/push/subscription-store';
import { computeDailyMorningNotification } from '@/src/lib/notifications/morning-push';
import { PRESET_LOCATIONS, LocationCoordinates } from '@/src/lib/vedic-astronomy';

// Mandatory Vercel Serverless Node.js runtime enforcement
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Push notification delivery options per W3C Push API specification
const PUSH_OPTIONS: webpush.RequestOptions = {
  TTL: 43200,                // 12-hour maximum validity window
  urgency: 'high',           // Deliver immediately even on low battery / Doze
  topic: 'panchang-daily'    // Replaces stale/unread daily notifications with the latest banner
};

/**
 * Initializes webpush VAPID details from environment variables.
 * In development, provides a fallback to ensure local testing succeeds.
 */
function ensureVapidConfig(): boolean {
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:support@vikram-samvat-widget.vercel.app';

  if (!publicKey || !privateKey) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[CRITICAL] VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY is missing in production environment.');
      return false;
    }
    // Sandboxed development fallback keys
    const DEV_PUBLIC = 'BH1fnOYbyEs8cQyQ_1DaThTkoufbHocO3Sj_bgKKqofiBCWpLvz422SoGGIRD73Q6v-j6H13yUnmo1fxFNj43Q0';
    const DEV_PRIVATE = 'LYNMX0BVCNOZpLIkgdTc2NCSgz-a__rjmQ_tl9JEsak';
    webpush.setVapidDetails(subject, DEV_PUBLIC, DEV_PRIVATE);
    return true;
  }

  try {
    webpush.setVapidDetails(subject, publicKey, privateKey);
    return true;
  } catch (err: unknown) {
    console.error('Failed to configure web-push VAPID details:', err);
    return false;
  }
}

/**
 * Validates request authorization:
 * When CRON_SECRET is configured, requests must supply `Authorization: Bearer <CRON_SECRET>`.
 */
function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // If no secret configured in dev, allow invocation with warning
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  }

  const authHeader = req.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  return handleDispatch(req);
}

export async function POST(req: NextRequest) {
  return handleDispatch(req);
}

interface TestRequestPayload {
  isTest?: boolean;
  subscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  location?: LocationCoordinates;
}

async function handleDispatch(req: NextRequest) {
  // 1. Check for single-device test alert trigger from client UI
  let testPayload: TestRequestPayload | null = null;
  if (req.method === 'POST') {
    try {
      const clonedReq = req.clone();
      testPayload = await clonedReq.json();
    } catch {
      testPayload = null;
    }
  }

  // If this is a targeted test alert, bypass CRON_SECRET check and dispatch to target immediately
  if (testPayload?.isTest && testPayload.subscription?.endpoint) {
    const isReady = ensureVapidConfig();
    if (!isReady) {
      return NextResponse.json(
        { error: 'VAPID credentials unconfigured on server.' },
        { status: 500 }
      );
    }

    const targetSub = testPayload.subscription;
    const loc: LocationCoordinates = testPayload.location || PRESET_LOCATIONS[0];
    const today = new Date();
    const morningPayload = computeDailyMorningNotification(today, loc);

    const notificationPayload = JSON.stringify({
      title: 'Panchang Alert • Test Notification',
      body: morningPayload.body || 'Vedic Panchang background push verified. Tap to view today\'s live astrometry.',
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      tag: 'panchang-alert',
      data: {
        url: '/',
        timestamp: Date.now(),
        isTest: true,
        date: morningPayload.data.date,
        primaryTithi: morningPayload.data.primaryTithi
      }
    });

    try {
      await webpush.sendNotification(targetSub, notificationPayload, PUSH_OPTIONS);
      console.info(`[Test Alert] Dispatched successfully to endpoint: ${targetSub.endpoint.slice(0, 32)}...`);
      return NextResponse.json({
        success: true,
        message: 'Test notification dispatched successfully.',
        deliveredTo: targetSub.endpoint
      });
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Push dispatch failed';
      console.error('[Test Alert Error]', err);
      // Auto-prune if endpoint is stale
      await pruneIfStale(targetSub.endpoint, err);
      return NextResponse.json(
        { error: 'Failed to deliver test notification', details: errorMsg },
        { status: 500 }
      );
    }
  }

  // 2. Validate authorization for scheduled cron dispatch
  if (!isAuthorized(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing CRON_SECRET.' },
      { status: 401 }
    );
  }

  // 3. Configure VAPID
  const isVapidReady = ensureVapidConfig();
  if (!isVapidReady) {
    return NextResponse.json(
      { error: 'Server VAPID credentials unconfigured or invalid.' },
      { status: 500 }
    );
  }

  // 4. Pre-compute daily event windows BEFORE querying the KV store
  // Consumes output of morning-push / ephemeris without modifying core ephemeris math
  const now = new Date();
  const defaultLoc: LocationCoordinates = PRESET_LOCATIONS[0]; // New Delhi reference
  const referenceMorningData = computeDailyMorningNotification(now, defaultLoc);

  console.info(`[Daily Trigger] Pre-computed daily window: Tithi="${referenceMorningData.data.primaryTithi}", Panchak="${referenceMorningData.data.panchakType || 'None'}", Festival="${referenceMorningData.data.festivalOrVrat || 'None'}"`);

  // 5. Query active subscriptions from the KV store
  const subscriptions: PushSubscriptionRecord[] = await getAllSubscriptions();
  const totalCount = subscriptions.length;

  if (totalCount === 0) {
    console.info('[Daily Trigger] No active push subscriptions found in the KV store.');
    return NextResponse.json({
      success: true,
      message: 'Trigger executed successfully. Zero subscriptions in the KV store.',
      total: 0,
      timestamp: now.toISOString()
    });
  }

  // 6. Dispatch with Promise.allSettled() for complete fault-tolerance
  // One failed or unresponsive subscription NEVER blocks delivery to other users
  let sentCount = 0;
  let failedCount = 0;
  let prunedCount = 0;

  const dispatchPromises = subscriptions.map(async (record) => {
    // If record has custom coordinates, compute localized sunrise/tithi; else use precomputed
    let morningData = referenceMorningData;
    if (record.location?.latitude && record.location?.longitude) {
      const userLoc: LocationCoordinates = {
        name: record.location.name || 'User Location',
        country: 'India',
        latitude: record.location.latitude,
        longitude: record.location.longitude,
        timezone: record.location.timezone ?? 5.5,
        ianaTimezone: record.location.ianaTimezone || record.timezone || 'Asia/Kolkata',
        regionName: record.location.name || 'Local Region'
      };
      morningData = computeDailyMorningNotification(now, userLoc);
    }

    const payload = JSON.stringify({
      title: morningData.title,
      body: morningData.body,
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      tag: 'panchang-alert',
      data: {
        url: '/',
        date: morningData.data.date,
        primaryTithi: morningData.data.primaryTithi,
        panchakType: morningData.data.panchakType,
        festivalOrVrat: morningData.data.festivalOrVrat,
        timestamp: Date.now()
      }
    });

    const pushSub = {
      endpoint: record.endpoint,
      keys: record.keys
    };

    try {
      await webpush.sendNotification(pushSub, payload, PUSH_OPTIONS);
      sentCount++;
      console.info(`[Push Sent] Sub ${record.endpointHash.slice(0, 8)} (${record.timezone})`);
      return { status: 'sent', hash: record.endpointHash };
    } catch (err: unknown) {
      failedCount++;
      const wasPruned = await pruneIfStale(record.endpoint, err);
      if (wasPruned) {
        prunedCount++;
        console.info(`[Push Pruned] Sub ${record.endpointHash.slice(0, 8)} expired (404/410).`);
        return { status: 'pruned', hash: record.endpointHash };
      }
      const errMsg = err instanceof Error ? err.message : 'Unknown push failure';
      console.warn(`[Push Failed] Sub ${record.endpointHash.slice(0, 8)}: ${errMsg}`);
      return { status: 'failed', hash: record.endpointHash, error: errMsg };
    }
  });

  const results = await Promise.allSettled(dispatchPromises);

  console.info(`[Daily Trigger Summary] Total: ${totalCount}, Sent: ${sentCount}, Failed: ${failedCount}, Pruned: ${prunedCount}`);

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    metrics: {
      total: totalCount,
      sent: sentCount,
      failed: failedCount,
      pruned: prunedCount,
      settledCount: results.length
    }
  });
}
