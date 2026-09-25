import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { kv } from '@vercel/kv';
import { calculatePanchang, PRESET_LOCATIONS } from '@/src/lib/vedic-astronomy';
import { getFestivalForDate } from '@/src/lib/festivals';
import { getActivePanchakStatus } from '@/src/lib/dharmashastra-rules';
import { evaluateEkadashi } from '@/src/lib/dharmashastra-engine';
import { buildDailyNotificationPayload } from '@/src/lib/notifications/payload-builder';

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
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid or missing CRON_SECRET.' },
          { status: 401 }
        );
      }
    }

    // 2. Parse target date (supports ?date=YYYY-MM-DD for testing / simulation)
    const { searchParams } = new URL(req.url);
    const dateParam = searchParams.get('date');
    const targetDate = dateParam ? new Date(`${dateParam}T06:00:00Z`) : new Date();

    // 3. Astrometric calculations using baseline New Delhi coordinates
    const location = PRESET_LOCATIONS[0];
    const panchang = calculatePanchang(targetDate, location);
    const festivalResult = getFestivalForDate(targetDate, location);
    const panchakResult = getActivePanchakStatus(targetDate);
    const ekadashiResult = evaluateEkadashi(targetDate, location);

    // 4. Determine active Festival and Vrat attributes
    let festival: string | null = null;
    let vrat: string | null = null;

    if (festivalResult.isMajor || festivalResult.category === 'Major Festival') {
      festival = festivalResult.name;
    }

    if (ekadashiResult.isEkadashiDay) {
      vrat = festivalResult.category === 'Ekadashi' ? festivalResult.name : 'Ekadashi Vrat';
    } else if (
      festivalResult.category === 'Vrat' ||
      festivalResult.category === 'Pradosh' ||
      festivalResult.name.toLowerCase().includes('vrat')
    ) {
      vrat = festivalResult.name;
    }

    // 5. Build context-aware combined notification payload strictly adhering to 2-3 line format
    const festivalOrVrat = festival || vrat || null;
    const isInauspicious = panchakResult.isActive && panchakResult.panchak?.auspiciousness !== 'Auspicious';
    const panchakStatus = panchakResult.isActive
      ? (panchakResult.panchak?.type ? `${panchakResult.panchak.type} (Inauspicious)` : 'Active (Inauspicious)')
      : undefined;

    const notificationLines: string[] = [];
    notificationLines.push(`Tithi: ${panchang.instantaneousTithi?.name || panchang.tithi.name}`);
    if (panchakResult.isActive && isInauspicious) {
      notificationLines.push(`Panchak: 🔴 ${panchakStatus}`);
    }
    if (festivalOrVrat) {
      notificationLines.push(`Festival/Vrat: ${festivalOrVrat}`);
    }

    const payload = {
      title: 'Panchang Update',
      body: notificationLines.join('\n'),
      icon: '/icon-192.svg',
      badge: '/icon-192.svg',
      data: {
        url: '/',
        date: targetDate.toISOString().split('T')[0],
        tithi: panchang.tithi.name,
        panchakActive: panchakResult.isActive,
        festivalOrVrat
      }
    };

    // 6. Check VAPID and KV availability
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
    const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:support@hindu-calendar.local';
    const isKvConfigured = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);

    if (!vapidPublicKey || !vapidPrivateKey || !isKvConfigured) {
      return NextResponse.json({
        success: true,
        dryRun: true,
        date: targetDate.toISOString().split('T')[0],
        message: 'Astrometric calculation successful. VAPID keys or KV not configured; returned payload in dry-run mode.',
        payload
      });
    }

    // 7. Dispatch Web Push notifications to active subscribers
    webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

    const rawSubscriptions: (string | object)[] = await kv.smembers('push_subscriptions');
    const totalSubscriptions = rawSubscriptions.length;

    let dispatched = 0;
    let failed = 0;
    const staleSubscriptions: string[] = [];

    const stringifiedPayload = JSON.stringify(payload);

    await Promise.allSettled(
      rawSubscriptions.map(async (rawSub) => {
        const subStr = typeof rawSub === 'string' ? rawSub : JSON.stringify(rawSub);
        try {
          const subscription = typeof rawSub === 'string' ? JSON.parse(rawSub) : rawSub;
          await webpush.sendNotification(subscription, stringifiedPayload);
          dispatched++;
        } catch (err: unknown) {
          failed++;
          const status = (err as { statusCode?: number })?.statusCode;
          // Purge expired or unsubscribed endpoints (404 Not Found or 410 Gone)
          if (status === 404 || status === 410) {
            staleSubscriptions.push(subStr);
          }
        }
      })
    );

    // 8. Clean up stale subscriptions from KV
    for (const stale of staleSubscriptions) {
      await kv.srem('push_subscriptions', stale);
    }

    return NextResponse.json({
      success: true,
      date: targetDate.toISOString().split('T')[0],
      payload,
      metrics: {
        totalSubscriptions,
        dispatched,
        failed,
        prunedStaleSubscriptions: staleSubscriptions.length
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
