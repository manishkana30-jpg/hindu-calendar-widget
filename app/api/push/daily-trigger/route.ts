import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { calculatePanchang, PRESET_LOCATIONS } from '@/src/lib/vedic-astronomy';
import { getFestivalForDate } from '@/src/lib/festivals';
import { getActivePanchakStatus } from '@/src/lib/dharmashastra-rules';
import { evaluateEkadashi } from '@/src/lib/dharmashastra-engine';
import { formatPanchangNotificationBody, isPanchakTrulyInauspicious } from '@/src/lib/notifications/state-diff';
import { getAllSubscriptions, removeSubscription } from '@/src/lib/notifications/subscription-store';

const DEFAULT_VAPID_PUBLIC = 'BFtksPslrqWiKgmwNbXvC5TDbAGAcswktRZg8dgdGz6dl4_SHsEMw3XL1uaucS7ZimTAz4Fnbnt1dmqSb19bAFo';
const DEFAULT_VAPID_PRIVATE = 'skKieBAhF18DZxm85wT2ZNBrZZVhdK8-84mh3syKYfM';
const DEFAULT_VAPID_SUBJECT = 'mailto:support@vikram-samvat-widget.vercel.app';

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
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (body?.subscription) {
          targetSubscription = body.subscription;
        }
      } catch {
        // No json body
      }
    }

    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const targetDate = dateParam ? new Date(`${dateParam}T06:00:00Z`) : new Date();

    // 3. Astrometric calculations using baseline New Delhi coordinates
    const location = PRESET_LOCATIONS[0];
    const panchang = calculatePanchang(targetDate, location);
    const festivalResult = getFestivalForDate(targetDate, location);
    const panchakResult = getActivePanchakStatus(targetDate);
    const ekadashiResult = evaluateEkadashi(targetDate, location);

    // 4. Determine active Festival & Vrat (strictly major festivals and Ekadashi vrats)
    // Minor daily vrats omitted to maintain primary focus on Tithi
    let festivalOrVrat: string | null = null;
    if (festivalResult.isMajor || festivalResult.category === 'Major Festival') {
      festivalOrVrat = festivalResult.name;
    } else if (ekadashiResult.isEkadashiDay) {
      festivalOrVrat = festivalResult.category === 'Ekadashi' ? festivalResult.name : 'Ekadashi Vrat';
    }

    // 5. Build context-aware combined notification payload (Option B inline format)
    const panchakInfo = {
      isActive: panchakResult.isActive,
      type: panchakResult.panchak?.type,
      isInauspicious: panchakResult.panchak?.auspiciousness !== 'Auspicious',
      statusText: panchakResult.panchak?.type
    };

    const isTrulyInauspicious = isPanchakTrulyInauspicious(panchakInfo);
    const tithiName = panchang.instantaneousTithi?.name || panchang.tithi.name;

    const notificationBody = formatPanchangNotificationBody({
      tithi: tithiName,
      panchak: panchakInfo,
      festivalOrVrat
    });

    const payload = {
      title: 'Panchang Update',
      body: notificationBody,
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      data: {
        url: '/',
        date: targetDate.toISOString().split('T')[0],
        tithi: tithiName,
        panchakActive: isTrulyInauspicious,
        festivalOrVrat
      }
    };

    // 6. Resolve VAPID keys (env vars or default production keys)
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE;
    const vapidSubject = process.env.VAPID_SUBJECT || DEFAULT_VAPID_SUBJECT;

    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
    const stringifiedPayload = JSON.stringify(payload);

    // 7. If target subscription is provided directly (e.g. Test Alert from device), dispatch to it immediately!
    if (targetSubscription && targetSubscription.endpoint) {
      try {
        await webpush.sendNotification(targetSubscription, stringifiedPayload);
        return NextResponse.json({
          success: true,
          dispatchedToTarget: true,
          endpoint: targetSubscription.endpoint,
          payload
        });
      } catch (err: unknown) {
        return NextResponse.json({
          success: false,
          error: (err as Error)?.message || 'Failed to dispatch to target subscription'
        }, { status: 500 });
      }
    }

    // 8. Otherwise, dispatch to all registered subscriptions in persistent store
    const rawSubscriptions = await getAllSubscriptions();
    const totalSubscriptions = rawSubscriptions.length;

    if (totalSubscriptions === 0) {
      return NextResponse.json({
        success: true,
        dryRun: false,
        totalSubscriptions: 0,
        message: 'Astrometric calculation successful. No devices currently registered in subscription pool.',
        payload
      });
    }

    let dispatched = 0;
    let failed = 0;
    const staleEndpoints: string[] = [];

    await Promise.allSettled(
      rawSubscriptions.map(async (rawSub) => {
        try {
          const subscription = typeof rawSub === 'string' ? JSON.parse(rawSub) : rawSub;
          await webpush.sendNotification(subscription, stringifiedPayload);
          dispatched++;
        } catch (err: unknown) {
          failed++;
          const status = (err as { statusCode?: number })?.statusCode;
          // Purge expired or unsubscribed endpoints (404 Not Found or 410 Gone)
          if (status === 404 || status === 410) {
            try {
              const parsed = typeof rawSub === 'string' ? JSON.parse(rawSub) : rawSub;
              if (parsed?.endpoint) {
                staleEndpoints.push(parsed.endpoint);
              }
            } catch {
              // ignore
            }
          }
        }
      })
    );

    // Clean up stale subscriptions from pool
    if (staleEndpoints.length > 0) {
      for (const endpoint of staleEndpoints) {
        await removeSubscription(endpoint).catch(() => {});
      }
    }

    return NextResponse.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      payload,
      metrics: {
        totalSubscriptions,
        dispatched,
        failed,
        prunedStaleSubscriptions: staleEndpoints.length
      }
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown notification dispatch error';
    return NextResponse.json(
      { error: 'Daily push notification dispatch failed', details: message },
      { status: 500 }
    );
  }
}
