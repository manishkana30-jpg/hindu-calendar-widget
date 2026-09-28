import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { LocationCoordinates, PRESET_LOCATIONS, TITHIS } from '@/src/lib/vedic-astronomy';
import { calculateSunTimesWithRefraction, getJulianDay, getElongationAngle, calculateTithiIndexFromElongation } from '@/src/lib/ephemeris';

import { computeDailyMorningNotification, formatTithiChangeAlert, formatTimeHHMM } from '@/src/lib/notifications/morning-push';
import {
  getAllSubscriptionRecords,
  saveSubscription,
  removeSubscription,
  StoredSubscriptionRecord
} from '@/src/lib/notifications/subscription-store';
import { configureWebPush } from '@/src/lib/notifications/vapid-config';

export async function GET(req: NextRequest) {
  return handleDailyTrigger(req);
}

export async function POST(req: NextRequest) {
  return handleDailyTrigger(req);
}

async function handleDailyTrigger(req: NextRequest) {
  try {
    // 1. Authenticate with CRON_SECRET if configured
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = req.headers.get('authorization');
      if (authHeader && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid or missing CRON_SECRET.' },
          { status: 401 }
        );
      }
    }

    // 2. Parse target date & optional target subscription from request body
    let targetSubscription: webpush.PushSubscription | null = null;
    let targetLocation: LocationCoordinates | null = null;
    let forceSend = false;

    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body?.subscription) {
          targetSubscription = body.subscription;
        }
        if (body?.location) {
          targetLocation = body.location;
        }
        if (body?.force) {
          forceSend = true;
        }
      } catch {
        // No json body
      }
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const forceParam = searchParams.get('force') === 'true';
    if (forceParam) forceSend = true;

    // 3. Configure VAPID keys securely
    const isVapidReady = configureWebPush();
    if (!isVapidReady) {
      return NextResponse.json(
        { error: 'Server VAPID credentials unconfigured or invalid.' },
        { status: 500 }
      );
    }

    // 4. If target subscription is provided directly (e.g. Test Alert from user screen), dispatch immediately
    if (targetSubscription && targetSubscription.endpoint) {
      const loc: LocationCoordinates = targetLocation || PRESET_LOCATIONS[0];
      const targetDate = dateParam ? new Date(`${dateParam}T06:00:00Z`) : new Date();
      const morningPayload = computeDailyMorningNotification(targetDate, loc);

      const payload = JSON.stringify({
        title: morningPayload.title,
        body: morningPayload.body,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        data: {
          url: '/',
          date: morningPayload.data.date,
          primaryTithi: morningPayload.data.primaryTithi,
          panchakType: morningPayload.data.panchakType,
          festivalOrVrat: morningPayload.data.festivalOrVrat,
          timestamp: Date.now()
        }
      });

      try {
        await webpush.sendNotification(targetSubscription, payload);
        return NextResponse.json({
          success: true,
          dispatchedToTarget: true,
          endpoint: targetSubscription.endpoint,
          payload: morningPayload
        });
      } catch (err: unknown) {
        return NextResponse.json({
          success: false,
          error: (err as Error)?.message || 'Failed to dispatch to target subscription'
        }, { status: 500 });
      }
    }

    // 5. Automated Server-Side Scheduler Dispatch across all registered subscriptions
    const records = await getAllSubscriptionRecords();
    const totalSubscriptions = records.length;

    if (totalSubscriptions === 0) {
      return NextResponse.json({
        success: true,
        totalSubscriptions: 0,
        message: 'Scheduler executed successfully. No subscriptions registered yet.'
      });
    }

    let dailyPushesSent = 0;
    let tithiChangePushesSent = 0;
    let skippedAlreadySent = 0;
    let failed = 0;
    const staleEndpoints: string[] = [];

    const now = new Date();

    await Promise.allSettled(
      records.map(async (record) => {
        const sub = record.subscription;
        if (!sub || !sub.endpoint) return;

        const loc: LocationCoordinates = {
          name: record.location?.name || 'User Location',
          country: 'India',
          latitude: record.location?.latitude || 28.6139,
          longitude: record.location?.longitude || 77.2090,
          timezone: record.location?.timezone || 5.5,
          ianaTimezone: record.location?.ianaTimezone || 'Asia/Kolkata',
          regionName: record.location?.name || 'Local Region'
        };

        const tz = loc.timezone;
        const ianaTz = loc.ianaTimezone;

        // Current local date in user's timezone
        const userLocalDateStr = formatTimeHHMM(now, ianaTz, tz);
        const userDateObj = new Date(now.getTime() + tz * 3600000);
        const y = userDateObj.getUTCFullYear();
        const m = String(userDateObj.getUTCMonth() + 1).padStart(2, '0');
        const d = String(userDateObj.getUTCDate()).padStart(2, '0');
        const todayStr = `${y}-${m}-${d}`;

        // Topocentric sunrise for user's coordinates
        const sunTimes = calculateSunTimesWithRefraction(
          new Date(y, Number(m) - 1, Number(d), 12, 0, 0),
          loc.latitude,
          loc.longitude,
          tz
        );
        const sunriseTimeStr = formatTimeHHMM(sunTimes.sunriseDate, ianaTz, tz);

        let recordModified = false;

        // ── TASK A: Daily Morning Push ──────────────────────────────────────
        const dailyEnabled = record.preferences?.dailyNotification !== false;
        if (dailyEnabled) {
          const prefTime = record.preferences?.notificationTime || 'sunrise';
          const alreadySentToday = record.lastNotifiedDailyDate === todayStr;

          // Check if due:
          // If forceSend, send unconditionally.
          // Otherwise, if prefTime === 'sunrise', send if local time >= sunrise.
          // If prefTime is e.g. "06:00", send if local time >= prefTime.
          const isDue = forceSend || (
            !alreadySentToday &&
            (prefTime === 'sunrise' ? userLocalDateStr >= sunriseTimeStr : userLocalDateStr >= prefTime)
          );

          if (isDue && (!alreadySentToday || forceSend)) {
            try {
              const morningPayload = computeDailyMorningNotification(now, loc);
              const payload = JSON.stringify({
                title: morningPayload.title,
                body: morningPayload.body,
                icon: '/icon-192.svg',
                badge: '/icon-192.svg',
                data: {
                  url: '/',
                  date: todayStr,
                  primaryTithi: morningPayload.data.primaryTithi,
                  panchakType: morningPayload.data.panchakType,
                  festivalOrVrat: morningPayload.data.festivalOrVrat,
                  timestamp: Date.now()
                }
              });

              await webpush.sendNotification(sub, payload);
              record.lastNotifiedDailyDate = todayStr;
              recordModified = true;
              dailyPushesSent++;
            } catch (err: unknown) {
              failed++;
              const status = (err as { statusCode?: number })?.statusCode;
              if (status === 404 || status === 410) {
                staleEndpoints.push(sub.endpoint);
              }
            }
          } else if (alreadySentToday) {
            skippedAlreadySent++;
          }
        }

        // ── TASK B: Optional Tithi Change Alert ──────────────────────────────
        const alertOnTithiChange = Boolean(record.preferences?.alertOnTithiChange);
        if (alertOnTithiChange) {
          // Compute instantaneous Tithi at this moment
          const jdNow = getJulianDay(now);
          const elongation = getElongationAngle(jdNow);
          const currentTithiIndex = calculateTithiIndexFromElongation(elongation);
          const currentTithiName = TITHIS[(currentTithiIndex - 1) % 30].name;

          if (record.lastNotifiedTithiIndex === null || record.lastNotifiedTithiIndex === undefined) {
            // First observation, initialize baseline without spamming
            record.lastNotifiedTithiIndex = currentTithiIndex;
            record.lastNotifiedTithiTime = Date.now();
            recordModified = true;
          } else if (record.lastNotifiedTithiIndex !== currentTithiIndex) {
            // TITHI HAS TRANSITIONED! Dispatch push alert within seconds of transition
            try {
              const alert = formatTithiChangeAlert({
                newTithiName: currentTithiName,
                transitionTime: now,
                timeZone: ianaTz,
                tzOffset: tz
              });

              const payload = JSON.stringify({
                title: alert.title,
                body: alert.body,
                icon: '/icon-192.svg',
                badge: '/icon-192.svg',
                data: {
                  url: '/',
                  tithiIndex: currentTithiIndex,
                  tithiName: currentTithiName,
                  timestamp: Date.now()
                }
              });

              await webpush.sendNotification(sub, payload);
              record.lastNotifiedTithiIndex = currentTithiIndex;
              record.lastNotifiedTithiTime = Date.now();
              recordModified = true;
              tithiChangePushesSent++;
            } catch (err: unknown) {
              failed++;
              const status = (err as { statusCode?: number })?.statusCode;
              if (status === 404 || status === 410) {
                staleEndpoints.push(sub.endpoint);
              }
            }
          }
        }

        // Persist deduplication updates
        if (recordModified) {
          await saveSubscription(record).catch(() => {});
        }
      })
    );

    // Prune stale or expired endpoints
    if (staleEndpoints.length > 0) {
      for (const endpoint of staleEndpoints) {
        await removeSubscription(endpoint).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      metrics: {
        totalSubscriptions,
        dailyPushesSent,
        tithiChangePushesSent,
        skippedAlreadySent,
        failed,
        prunedStaleSubscriptions: staleEndpoints.length
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown scheduler error';
    return NextResponse.json(
      { error: 'Daily trigger scheduler execution failed', details: message },
      { status: 500 }
    );
  }
}
