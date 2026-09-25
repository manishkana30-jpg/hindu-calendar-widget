import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';
import webpush from 'web-push';
import { calculatePanchang, PRESET_LOCATIONS } from '@/src/lib/vedic-astronomy';
import { getFestivalForDate } from '@/src/lib/festivals';
import { getActivePanchakStatus } from '@/src/lib/dharmashastra-rules';
import { evaluateEkadashi } from '@/src/lib/dharmashastra-engine';
import { formatPanchangNotificationBody, isPanchakTrulyInauspicious } from '@/src/lib/notifications/state-diff';

const DEFAULT_VAPID_PUBLIC = 'BFtksPslrqWiKgmwNbXvC5TDbAGAcswktRZg8dgdGz6dl4_SHsEMw3XL1uaucS7ZimTAz4Fnbnt1dmqSb19bAFo';
const DEFAULT_VAPID_PRIVATE = 'skKieBAhF18DZxm85wT2ZNBrZZVhdK8-84mh3syKYfM';
const DEFAULT_VAPID_SUBJECT = 'mailto:support@vikram-samvat-widget.vercel.app';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const subscription = body?.subscription;

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid PushSubscription: endpoint is required.' },
        { status: 400 }
      );
    }

    const subString = typeof subscription === 'string' ? subscription : JSON.stringify(subscription);

    // 1. Maintain in-memory subscription pool for serverless instances
    if (!('__push_subscriptions' in globalThis)) {
      (globalThis as unknown as { __push_subscriptions: Set<string> }).__push_subscriptions = new Set<string>();
    }
    const globalSubs = (globalThis as unknown as { __push_subscriptions: Set<string> }).__push_subscriptions;
    globalSubs.add(subString);

    // 2. If Vercel KV environment is configured, persist the subscription
    const isKvConfigured = Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
    if (isKvConfigured) {
      try {
        await kv.sadd('push_subscriptions', subString);
      } catch (kvErr) {
        console.warn('Failed to save subscription to Vercel KV:', kvErr);
      }
    }

    // 3. Immediately dispatch a test combined push notification to the subscribing device
    let testDispatched = false;
    let pushError: string | null = null;

    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC;
      const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE;
      const vapidSubject = process.env.VAPID_SUBJECT || DEFAULT_VAPID_SUBJECT;

      webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

      // Compute current real panchang state
      const now = new Date();
      const panchang = calculatePanchang(now, PRESET_LOCATIONS[0]);
      const festivalResult = getFestivalForDate(now, PRESET_LOCATIONS[0]);
      const panchakResult = getActivePanchakStatus(now);
      const ekadashiResult = evaluateEkadashi(now, PRESET_LOCATIONS[0]);

      // Only major festivals and Ekadashi vrats to keep primary focus on Tithi
      let festivalOrVrat: string | null = null;
      if (festivalResult.isMajor || festivalResult.category === 'Major Festival') {
        festivalOrVrat = festivalResult.name;
      } else if (ekadashiResult.isEkadashiDay) {
        festivalOrVrat = festivalResult.category === 'Ekadashi' ? festivalResult.name : 'Ekadashi Vrat';
      }

      const panchakInfo = {
        isActive: panchakResult.isActive,
        type: panchakResult.panchak?.type,
        isInauspicious: panchakResult.panchak?.auspiciousness !== 'Auspicious',
        statusText: panchakResult.panchak?.type
      };

      const isTrulyInauspicious = isPanchakTrulyInauspicious(panchakInfo);
      const tithiName = panchang.instantaneousTithi?.name || panchang.tithi.name;

      const bodyText = formatPanchangNotificationBody({
        tithi: tithiName,
        panchak: panchakInfo,
        festivalOrVrat
      });

      const payload = JSON.stringify({
        title: 'Panchang Update',
        body: bodyText,
        icon: '/icon-192.svg',
        badge: '/icon-192.svg',
        data: {
          url: '/',
          tithi: tithiName,
          panchakActive: isTrulyInauspicious,
          festivalOrVrat,
          timestamp: Date.now()
        }
      });

      const parsedSub = typeof subscription === 'string' ? JSON.parse(subscription) : subscription;
      await webpush.sendNotification(parsedSub, payload);
      testDispatched = true;
    } catch (pushErr: unknown) {
      pushError = pushErr instanceof Error ? pushErr.message : 'Push dispatch error';
      console.warn('Initial welcome push dispatch warning:', pushErr);
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription registered successfully.',
      isKvConfigured,
      testDispatched,
      pushError
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown subscription error';
    return NextResponse.json(
      { error: 'Failed to process subscription', details: message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const endpoint = body?.endpoint;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required to unsubscribe.' },
        { status: 400 }
      );
    }

    // Remove from in-memory pool
    const globalSubs = (globalThis as unknown as { __push_subscriptions?: Set<string> }).__push_subscriptions;
    if (globalSubs) {
      for (const item of Array.from(globalSubs)) {
        if (item.includes(endpoint)) {
          globalSubs.delete(item);
        }
      }
    }

    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const allSubs: (string | object)[] = await kv.smembers('push_subscriptions');
      for (const item of allSubs) {
        const itemStr = typeof item === 'string' ? item : JSON.stringify(item);
        if (itemStr.includes(endpoint)) {
          await kv.srem('push_subscriptions', itemStr).catch(() => {});
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription removed successfully.'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown unsubscribe error';
    return NextResponse.json(
      { error: 'Failed to delete subscription', details: message },
      { status: 500 }
    );
  }
}
