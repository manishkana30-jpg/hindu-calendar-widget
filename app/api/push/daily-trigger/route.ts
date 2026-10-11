/**
 * Server-Side GPS-Local Sunrise Tithi & Daily Panchang Push Dispatch Engine
 * GET / POST /api/push/daily-trigger
 *
 * Dispatches hyper-personalized, astronomical sunrise notifications:
 * 1. Queries active subscribers directly from Supabase PostgreSQL (via Service Role).
 * 2. Computes exact astronomical sunrise for each subscriber's GPS coordinates (Swiss Ephemeris math).
 * 3. Enforces a ±15-minute time window matching the user's local sunrise in their IANA timezone.
 * 4. Strictly idempotent: records last_daily_date_notified (YYYY-MM-DD) to prevent duplicate alerts.
 * 5. Automatically marks dead / uninstalled push endpoints (HTTP 404 / 410) as inactive in Supabase.
 *
 * NOTE on Vercel Hobby Plan: Crons are strictly limited to ONCE DAILY in production vercel.json.
 */

import { NextRequest, NextResponse } from 'next/server';
import webpush, { getWebPushInstance } from '@/src/lib/webpush';
import { getSupabaseAdmin } from '@/src/lib/supabase/client';
import {
  getAllSubscriptions,
  pruneIfStale,
  updateSubscriptionState,
  isStaleSubscriptionError,
  PushSubscriptionRecord
} from '@/src/lib/push/subscription-store';
import {
  computeDailyMorningNotification,
  formatTithiChangeAlert
} from '@/src/lib/notifications/morning-push';
import {
  buildDailyFloatingPayload,
  extractDailyPanchangData
} from '@/src/lib/push/dailySummaryPayload';
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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PUSH_OPTIONS: webpush.RequestOptions = {
  TTL: 43200,                // 12-hour maximum validity window
  urgency: 'high',           // Deliver immediately, waking low-power / Doze mode
  topic: 'panchang-daily'    // Replaces older daily alerts
};

/**
 * Initializes webpush VAPID details from environment variables.
 */
function ensureVapidConfig(): boolean {
  const wp = getWebPushInstance();
  if (wp) return true;

  if (process.env.NODE_ENV === 'production') {
    console.error('[CRITICAL] VAPID credentials missing in production environment.');
    return false;
  }

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
 * Strictly validates CRON_SECRET via the `Authorization: Bearer` header.
 * Also supports Vercel's automated cron runner header ('x-vercel-cron: 1').
 */
function isAuthorized(req: NextRequest): boolean {
  const vercelCronHeader = req.headers.get('x-vercel-cron');
  if (vercelCronHeader === '1') {
    return true;
  }

  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[SECURITY] CRON_SECRET is not configured. Permitting in non-production.');
      return true;
    }
    console.error('[SECURITY CRITICAL] CRON_SECRET is not configured in production environment.');
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
 * 
 * Rules:
 * 1. Idempotency: Must not have already been notified for today's local date.
 * 2. Time-Window: Current server time must be within ±15 minutes of the user's astronomical sunrise.
 */
function isEligibleForMorningPush(
  now: Date,
  userLoc: LocationCoordinates,
  preferredTime: string | undefined,
  lastNotifiedDate: string | null | undefined,
  isForceAll: boolean = false
): { eligible: boolean; diffMinutes?: number; sunriseIso?: string; reason?: string } {
  const userTz = resolveTimezoneOffset(now, userLoc);
  const todayDateStr = getLocalDateStr(now, userLoc.ianaTimezone, userTz);

  // 1. Idempotency Check: Prevent duplicate sends on the same calendar day
  if (!isForceAll && lastNotifiedDate === todayDateStr) {
    return { eligible: false, reason: 'ALREADY_NOTIFIED_TODAY' };
  }

  // 2. Dynamic Astronomical Sunrise Calculation (Swiss Ephemeris with atmospheric refraction)
  const sunTimes = calculateSunTimesWithRefraction(
    now,
    userLoc.latitude,
    userLoc.longitude,
    userTz
  );
  const sunriseDate = sunTimes.sunriseDate;

  let targetDate: Date = sunriseDate;

  // Custom user alert preference (defaults to local astronomical sunrise)
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

  // 3. Time-Window Matching: Current time within ±15 minutes (900,000 ms) of target
  const diffMs = Math.abs(now.getTime() - targetDate.getTime());
  const diffMinutes = Math.round(diffMs / 60000);
  const isWithinWindow = diffMs <= 15 * 60 * 1000;

  if (isForceAll || isWithinWindow) {
    return {
      eligible: true,
      diffMinutes,
      sunriseIso: sunriseDate.toISOString()
    };
  }

  return {
    eligible: false,
    diffMinutes,
    sunriseIso: sunriseDate.toISOString(),
    reason: `OUTSIDE_WINDOW_${diffMinutes}M_FROM_SUNRISE`
  };
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

  if (record.lastTithiIndexNotified === undefined || record.lastTithiIndexNotified === null) {
    return {
      hasChanged: false,
      currentTithiIndex,
      currentTithiName,
      transitionTime
    };
  }

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

  // 2. Validate authorization
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
        message: 'VAPID credentials are not configured in environment variables.'
      },
      { status: 500 }
    );
  }

  const now = new Date();
  const defaultLoc: LocationCoordinates = PRESET_LOCATIONS[0]; // New Delhi reference
  const isForceAll = Boolean(testPayload?.forceAll);

  // 4. Query active subscriptions from Supabase (Service Role bypasses RLS)
  const supabase = getSupabaseAdmin();
  let subscriptions: PushSubscriptionRecord[] = [];

  if (supabase) {
    const { data: dbRows, error: dbError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true);

    if (dbError) {
      console.warn('[Daily Trigger] Supabase query warning:', dbError.message);
    } else if (dbRows && Array.isArray(dbRows)) {
      subscriptions = dbRows.map((row) => ({
        endpoint: row.endpoint,
        endpointHash: row.endpoint_hash,
        keys: { p256dh: row.p256dh, auth: row.auth },
        timezone: row.user_timezone || 'Asia/Kolkata',
        createdAt: row.created_at ? new Date(row.created_at).getTime() : now.getTime(),
        lastValidated: row.last_validated_at ? new Date(row.last_validated_at).getTime() : now.getTime(),
        location: (row.latitude !== null && row.longitude !== null) ? {
          latitude: row.latitude,
          longitude: row.longitude,
          timezone: row.location_timezone_offset ?? 5.5,
          ianaTimezone: row.user_timezone || 'Asia/Kolkata',
          name: row.location_name || 'User Location'
        } : undefined,
        preferences: row.preferences || {},
        lastDailyDateNotified: row.last_daily_date_notified,
        lastTithiIndexNotified: row.last_tithi_index_notified,
        lastTithiNotifiedAt: row.last_tithi_notified_at
      }));
    }
  }

  // Fallback to KV / in-memory store if Supabase returns 0 records
  if (subscriptions.length === 0) {
    subscriptions = await getAllSubscriptions();
  }

  const totalCount = subscriptions.length;
  if (totalCount === 0) {
    return NextResponse.json({
      success: true,
      message: 'Trigger executed successfully. Zero active subscribers in database.',
      total: 0,
      timestamp: now.toISOString()
    });
  }

  // 5. Dual-Trigger Evaluation Engine (Morning Sunrise Udaya + Tithi Change Alert)
  let morningSentCount = 0;
  let tithiSentCount = 0;
  let failedCount = 0;
  let prunedCount = 0;
  let skippedCount = 0;

  const staleEndpoints: string[] = [];

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

    // ── TRIGGER 1: GPS-Local Sunrise Notification ──
    const dailyEnabled = record.preferences?.dailyNotification !== false;
    if (dailyEnabled) {
      const eligibility = isEligibleForMorningPush(
        now,
        userLoc,
        record.preferences?.notificationTime,
        record.lastDailyDateNotified,
        isForceAll
      );

      if (eligibility.eligible) {
        const dailyData = extractDailyPanchangData(now, userLoc);
        const floatingPayload = buildDailyFloatingPayload(dailyData);
        const morningPayload = JSON.stringify(floatingPayload);

        try {
          await webpush.sendNotification(pushSub, morningPayload, {
            ...PUSH_OPTIONS,
            topic: 'daily-floating-panchang'
          });
          sentMorning = true;
          morningSentCount++;

          // IMMEDIATELY update last_daily_date_notified in Supabase for idempotency
          if (supabase) {
            await supabase
              .from('push_subscriptions')
              .update({
                last_daily_date_notified: todayDateStr,
                last_validated_at: new Date().toISOString()
              })
              .eq('endpoint', record.endpoint);
          }

          await updateSubscriptionState(record.endpoint, {
            lastDailyDateNotified: todayDateStr
          });
        } catch (err: unknown) {
          failedCount++;
          if (isStaleSubscriptionError(err)) {
            staleEndpoints.push(record.endpoint);
            if (supabase) {
              await supabase
                .from('push_subscriptions')
                .delete()
                .eq('endpoint', record.endpoint);
            }
            await pruneIfStale(record.endpoint, err);
            return { status: 'pruned', hash: record.endpointHash };
          }
          const errMsg = err instanceof Error ? err.message : 'Morning push failed';
          console.warn(`[Morning Push Failed] Sub ${record.endpointHash.slice(0, 8)}: ${errMsg}`);
        }
      } else {
        skippedCount++;
      }
    }

    // ── TRIGGER 2: Instantaneous Tithi Change Alert ──
    const alertOnTithi = Boolean(record.preferences?.alertOnTithiChange);
    const tithiEval = evaluateTithiChangeTrigger(now, userLoc, record);

    if (record.lastTithiIndexNotified === undefined || record.lastTithiIndexNotified === null) {
      await updateSubscriptionState(record.endpoint, {
        lastTithiIndexNotified: tithiEval.currentTithiIndex
      });
    } else if (alertOnTithi && (tithiEval.hasChanged || isForceAll)) {
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
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
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

        if (supabase) {
          await supabase
            .from('push_subscriptions')
            .update({
              last_tithi_index_notified: tithiEval.currentTithiIndex,
              last_tithi_notified_at: Date.now(),
              last_validated_at: new Date().toISOString()
            })
            .eq('endpoint', record.endpoint);
        }

        await updateSubscriptionState(record.endpoint, {
          lastTithiIndexNotified: tithiEval.currentTithiIndex,
          lastTithiNotifiedAt: Date.now()
        });
      } catch (err: unknown) {
        failedCount++;
        if (isStaleSubscriptionError(err)) {
          staleEndpoints.push(record.endpoint);
          if (supabase) {
            await supabase
              .from('push_subscriptions')
              .delete()
              .eq('endpoint', record.endpoint);
          }
          await pruneIfStale(record.endpoint, err);
          return { status: 'pruned', hash: record.endpointHash };
        }
        const errMsg = err instanceof Error ? err.message : 'Tithi push failed';
        console.warn(`[Tithi Push Failed] Sub ${record.endpointHash.slice(0, 8)}: ${errMsg}`);
      }
    }

    return {
      status: (sentMorning || sentTithi) ? 'sent' : 'skipped',
      hash: record.endpointHash
    };
  });

  const settled = await Promise.allSettled(dispatchPromises);

  // 6. Clean up dead endpoints in Supabase in bulk (DELETE query)
  if (staleEndpoints.length > 0 && supabase) {
    prunedCount = staleEndpoints.length;
    console.info(`[Auto-Prune] Deleting ${prunedCount} dead endpoints from Supabase push_subscriptions...`);
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', staleEndpoints);
  }

  return NextResponse.json({
    success: true,
    timestamp: now.toISOString(),
    metrics: {
      total: totalCount,
      totalSent: morningSentCount + tithiSentCount,
      morningSent: morningSentCount,
      tithiSent: tithiSentCount,
      failed: failedCount,
      pruned: prunedCount,
      skipped: skippedCount,
      settledCount: settled.length
    }
  });
}
