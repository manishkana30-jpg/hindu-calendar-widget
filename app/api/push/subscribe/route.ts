import { NextRequest, NextResponse } from 'next/server';
import webpush from 'web-push';
import { LocationCoordinates, PRESET_LOCATIONS } from '@/src/lib/vedic-astronomy';
import { computeDailyMorningNotification } from '@/src/lib/notifications/morning-push';
import { saveSubscription, removeSubscription } from '@/src/lib/notifications/subscription-store';

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

    const location: LocationCoordinates = body.location
      ? {
          name: body.location.name || 'Custom Location',
          country: body.location.country || 'India',
          latitude: Number(body.location.latitude) || 28.6139,
          longitude: Number(body.location.longitude) || 77.2090,
          timezone: Number(body.location.timezone) || 5.5,
          ianaTimezone: body.location.ianaTimezone || 'Asia/Kolkata',
          regionName: body.location.regionName || 'Custom Region'
        }
      : PRESET_LOCATIONS[0];

    const preferences = {
      dailyNotification: body.preferences?.dailyNotification !== false,
      notificationTime: body.preferences?.notificationTime || 'sunrise',
      alertOnTithiChange: Boolean(body.preferences?.alertOnTithiChange),
      autoUpdate: body.preferences?.autoUpdate !== false,
      wifiOnly: Boolean(body.preferences?.wifiOnly)
    };

    // Save to shared persistent subscription store with full metadata
    await saveSubscription({
      subscription,
      location: {
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        ianaTimezone: location.ianaTimezone,
        name: location.name,
        source: body.location?.source || 'fallback'
      },
      preferences,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });

    let testDispatched = false;
    let pushError: string | null = null;

    if (body.sendWelcomeTest) {
      try {
        const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || DEFAULT_VAPID_PUBLIC;
        const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || DEFAULT_VAPID_PRIVATE;
        const vapidSubject = process.env.VAPID_SUBJECT || DEFAULT_VAPID_SUBJECT;

        webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);

        const morningPayload = computeDailyMorningNotification(new Date(), location);

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

        await webpush.sendNotification(subscription, payload);
        testDispatched = true;
      } catch (pushErr: unknown) {
        pushError = pushErr instanceof Error ? pushErr.message : 'Push dispatch error';
        console.warn('Initial welcome push dispatch warning:', pushErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Subscription registered successfully with location and preferences.',
      registered: true,
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

    await removeSubscription(endpoint);

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
