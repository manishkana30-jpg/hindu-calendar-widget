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
import webpush, { getWebPushInstance } from '@/src/lib/webpush';
import {
  getAllSubscriptions,
  pruneIfStale,
  updateSubscriptionState,
  PushSubscriptionRecord
} from '@/src/lib/push/subscription-store';
import {
  computeDailyMorningNotification,
  formatTithiChangeAlert
} from '@/src/lib/notifications/morning-push';
import {
  PRESET_LOCATIONS,
  LocationCoordinates,
  resolveTimezoneOffset,
  calculatePanchang
} from '@/src/lib/vedic-astronomy';
import { calculateSunTimesWithRefraction } from '@/src/lib/ephemeris';
import { getActivePanchakStatus } from '@/src/lib/dharmashastra-rules';
import { getFestivalForDate } from '@/src/lib/festivals';
import { isPanchakTrulyInauspicious } from '@/src/lib/notifications/state-diff';

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
  const wp = getWebPushInstance();
  if (wp) return true;

  if (process.env.NODE_ENV === 'production') {
    console.error('[CRITICAL] VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY is missing in production environment.');
    return false;
  }
  // Sandboxed development fallback keys
  const subject = process.env.VAPID_SUBJECT || 'mailto:contact@dailytithi.com';
  const DEV_PUBLIC = 'BFtksPslrqWiKgmwNbXvC5TDbAGAcswktRZg8dgdGz6dl4_SHsEMw3XL1uaucS7ZimTAz4Fnbnt1dmqSb19bAFo';
  const DEV_PRIVATE = 'skKieBAhF18DZxm85wT2ZNBrZZVhdK8-84mh3syKYfM';
  try {
    webpush.setVapidDetails(subject, DEV_PUBLIC, DEV_PRIVATE);
    return true;
  } catch (err: unknown) {
    console.error('Failed to configure web-push VAPID details:', err);
    return false;
  }
}

/**
 * Validates request authorization:
 * When CRON_SECRET is configured, requests must supply `Authorization: Bearer <CRON_SECRET>`.
 * In permissive mode (unconfigured in production or dev), logs a warning and permits execution.
 */
function isAuthorized(req: NextRequest): boolean {
  // Support Vercel native cron request header (guaranteed by Vercel edge infrastructure)
  const vercelCronHeader = req.headers.get('x-vercel-cron');
  if (vercelCronHeader === '1') {
    return true;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    if (process.env.NODE_ENV !== 'production') return true;
    console.warn('[SECURITY NOTE] CRON_SECRET is not configured in environment variables. Permitting cron execution.');
    return true;
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
  forceAll?: boolean;
  subscription?: {
    endpoint: string;
    keys: {
      p256dh: string;
      auth: string;
    };
  };
  location?: LocationCoordinates;
}

/**
 * Formats local date string (YYYY-MM-DD) for a given timestamp and timezone.
 */
function getLocalDateStr(date: Date, timeZone?: string, tzOffsetHours?: number): string {
  if (timeZone) {
    try {
      const formatter = new Intl.DateTimeFormat('en-CA', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone
      });
      return formatter.format(date);
    } catch {
      // Fall through to offset
    }
  }

  const offset = tzOffsetHours ?? 5.5;
  const localMs = date.getTime() + offset * 3600000;
  const d = new Date(localMs);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Determines if the current moment is eligible for today's daily morning notification.
 * Window: Current time is at or past (targetTime - 10 minutes) AND not yet sent today.
 */
function isEligibleForMorningPush(
  now: Date,
  userLoc: LocationCoordinates,
  preferredTime: string | undefined,
  lastNotifiedDate: string | null | undefined
): boolean {
  const userTz = resolveTimezoneOffset(now, userLoc);
  const todayDateStr = getLocalDateStr(now, userLoc.ianaTimezone, userTz);

  // If already notified for this local date, do not resend
  if (lastNotifiedDate === todayDateStr) {
    return false;
  }

  // Calculate local sunrise for today
  const sunTimes = calculateSunTimesWithRefraction(
    now,
    userLoc.latitude,
    userLoc.longitude,
    userTz
  );
  const sunriseDate = sunTimes.sunriseDate;

  let targetDate: Date = sunriseDate;

  if (preferredTime && preferredTime !== 'sunrise') {
    const match = preferredTime.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const targetHour = parseInt(match[1], 10);
      const targetMin = parseInt(match[2], 10);
      const localSunriseMs = sunriseDate.getTime() + userTz * 3600000;
      const d = new Date(localSunriseMs);
      d.setUTCHours(targetHour, targetMin, 0, 0);
      targetDate = new Date(d.getTime() - userTz * 3600000);
    }
  }

  // Allow trigger if now is at or past (targetTime - 2 hours)
  // Wide window needed because Vercel Hobby cron fires at most once/day
  // and GitHub Actions cron may drift due to throttling
  const windowStartMs = targetDate.getTime() - 120 * 60 * 1000;
  return now.getTime() >= windowStartMs;
}

/**
 * Evaluates whether a Tithi transition has occurred for the subscriber's location.
 */
function evaluateTithiChangeTrigger(
  now: Date,
  userLoc: LocationCoordinates,
  record: PushSubscriptionRecord
): {
  hasChanged: boolean;
  currentTithiIndex: number;
  currentTithiName: string;
  transitionTime: Date;
} {
  const panchang = calculatePanchang(now, userLoc);
  const currentTithiIndex = panchang.instantaneousTithi?.index || panchang.tithi.index;
  const currentTithiName = panchang.instantaneousTithi?.name || panchang.tithi.name;
  const transitionTime = now;

  // First check: Seed without false alarm
  if (record.lastTithiIndexNotified === undefined || record.lastTithiIndexNotified === null) {
    return {
      hasChanged: false,
      currentTithiIndex,
      currentTithiName,
      transitionTime
    };
  }

  // Tithi transition detected
  if (record.lastTithiIndexNotified !== currentTithiIndex) {
    return {
      hasChanged: true,
      currentTithiIndex,
      currentTithiName,
      transitionTime
    };
  }

  return {
    hasChanged: false,
    currentTithiIndex,
    currentTithiName,
    transitionTime
  };
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
        {
          error: 'VAPID_NOT_CONFIGURED',
          message: 'VAPID credentials are not configured in environment variables. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT.'
        },
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
      {
        error: 'VAPID_NOT_CONFIGURED',
        message: 'VAPID credentials are not configured in environment variables. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, and VAPID_SUBJECT.'
      },
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

  // 6. Dual-Trigger Evaluation Engine (Morning Udaya + Tithi Change Alert)
  const isForceAll = Boolean(testPayload?.forceAll);
  let morningSentCount = 0;
  let tithiSentCount = 0;
  let failedCount = 0;
  let prunedCount = 0;

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

    const userTz = resolveTimezoneOffset(now, userLoc);
    const todayDateStr = getLocalDateStr(now, userLoc.ianaTimezone, userTz);
    const pushSub = {
      endpoint: record.endpoint,
      keys: record.keys
    };

    let sentMorning = false;
    let sentTithi = false;

    // ── TRIGGER 1: Daily Morning Notification at Udaya / Sunrise ──
    const dailyEnabled = record.preferences?.dailyNotification !== false;
    if (dailyEnabled) {
      const isDueForMorning = isForceAll || isEligibleForMorningPush(
        now,
        userLoc,
        record.preferences?.notificationTime,
        record.lastDailyDateNotified
      );

      if (isDueForMorning) {
        const morningData = computeDailyMorningNotification(now, userLoc);
        const morningPayload = JSON.stringify({
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

        try {
          await webpush.sendNotification(pushSub, morningPayload, PUSH_OPTIONS);
          sentMorning = true;
          morningSentCount++;
          console.info(`[Morning Push Sent] Sub ${record.endpointHash.slice(0, 8)} (${userLoc.name} @ ${todayDateStr})`);
          await updateSubscriptionState(record.endpoint, {
            lastDailyDateNotified: todayDateStr
          });
        } catch (err: unknown) {
          failedCount++;
          const wasPruned = await pruneIfStale(record.endpoint, err);
          if (wasPruned) {
            prunedCount++;
            return { status: 'pruned', hash: record.endpointHash };
          }
          const errMsg = err instanceof Error ? err.message : 'Morning push failed';
          console.warn(`[Morning Push Failed] Sub ${record.endpointHash.slice(0, 8)}: ${errMsg}`);
        }
      }
    }

    // ── TRIGGER 2: Instantaneous Tithi Change Alert ──
    const alertOnTithi = Boolean(record.preferences?.alertOnTithiChange);
    const tithiEval = evaluateTithiChangeTrigger(now, userLoc, record);

    if (record.lastTithiIndexNotified === undefined || record.lastTithiIndexNotified === null) {
      // First observation: initialize the index so future transitions are accurately detected
      await updateSubscriptionState(record.endpoint, {
        lastTithiIndexNotified: tithiEval.currentTithiIndex
      });
    } else if (alertOnTithi && (tithiEval.hasChanged || isForceAll)) {
      // Transition detected!
      const panchakResult = getActivePanchakStatus(now);
      const festivalResult = getFestivalForDate(now, userLoc);

      const panchakInfo = panchakResult.isActive ? {
        isActive: true,
        type: panchakResult.panchak?.type,
        isInauspicious: panchakResult.panchak?.auspiciousness !== 'Auspicious'
      } : null;

      const tithiAlert = formatTithiChangeAlert({
        newTithiName: tithiEval.currentTithiName,
        transitionTime: tithiEval.transitionTime,
        panchakStatus: (panchakInfo && isPanchakTrulyInauspicious(panchakInfo)) ? panchakInfo : null,
        festivalName: festivalResult?.name,
        timeZone: userLoc.ianaTimezone,
        tzOffset: userTz
      });

      const tithiPayload = JSON.stringify({
        title: tithiAlert.title,
        body: tithiAlert.body,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        tag: `tithi-change-${tithiEval.currentTithiIndex}`,
        data: {
          url: '/',
          tithiIndex: tithiEval.currentTithiIndex,
          tithiName: tithiEval.currentTithiName,
          timestamp: Date.now()
        }
      });

      try {
        await webpush.sendNotification(pushSub, tithiPayload, {
          ...PUSH_OPTIONS,
          topic: 'panchang-tithi-change'
        });
        sentTithi = true;
        tithiSentCount++;
        console.info(`[Tithi Alert Sent] Sub ${record.endpointHash.slice(0, 8)} -> ${tithiEval.currentTithiName}`);
        await updateSubscriptionState(record.endpoint, {
          lastTithiIndexNotified: tithiEval.currentTithiIndex,
          lastTithiNotifiedAt: Date.now()
        });
      } catch (err: unknown) {
        failedCount++;
        const wasPruned = await pruneIfStale(record.endpoint, err);
        if (wasPruned) {
          prunedCount++;
          return { status: 'pruned', hash: record.endpointHash };
        }
        const errMsg = err instanceof Error ? err.message : 'Tithi push failed';
        console.warn(`[Tithi Push Failed] Sub ${record.endpointHash.slice(0, 8)}: ${errMsg}`);
      }
    }

    return {
      status: (sentMorning || sentTithi) ? 'sent' : 'skipped',
      sentMorning,
      sentTithi,
      hash: record.endpointHash
    };
  });

  const results = await Promise.allSettled(dispatchPromises);
  const totalSent = morningSentCount + tithiSentCount;

  console.info(`[Daily Trigger Summary] Total: ${totalCount}, Morning Sent: ${morningSentCount}, Tithi Sent: ${tithiSentCount}, Failed: ${failedCount}, Pruned: ${prunedCount}`);

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    metrics: {
      total: totalCount,
      totalSent,
      morningSent: morningSentCount,
      tithiSent: tithiSentCount,
      failed: failedCount,
      pruned: prunedCount,
      settledCount: results.length
    }
  });
}
