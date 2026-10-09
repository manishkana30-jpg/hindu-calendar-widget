import { NextRequest, NextResponse } from 'next/server';
import {
  upsertSubscription,
  deleteSubscription,
  PushSubscriptionKeys
} from '@/src/lib/push/subscription-store';
import { saveSubscription, removeSubscription } from '@/src/lib/notifications/subscription-store';

// Vercel Serverless Node.js runtime enforcement (required for Web Push crypto)
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface SubscribePayload {
  subscription?: {
    endpoint: string;
    keys?: PushSubscriptionKeys;
  };
  endpoint?: string;
  keys?: PushSubscriptionKeys;
  timezone?: string;
  location?: {
    latitude: number;
    longitude: number;
    timezone?: number;
    ianaTimezone?: string;
    name?: string;
  };
  preferences?: {
    dailyNotification?: boolean;
    notificationTime?: string;
    alertOnTithiChange?: boolean;
    autoUpdate?: boolean;
    wifiOnly?: boolean;
  };
}

/**
 * Validates whether the incoming request is origin-compliant.
 * Rejects cross-origin POST requests from unauthorized domains.
 */
function isOriginAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host');
  const referer = req.headers.get('referer');

  // Allow server-to-server or test runners in non-production environments
  if (!origin && !referer) {
    if (process.env.NODE_ENV !== 'production') return true;
    return false;
  }

  const expectedHost = host ? host.toLowerCase() : '';

  if (origin) {
    try {
      const originUrl = new URL(origin);
      const originHost = originUrl.host.toLowerCase();
      if (expectedHost && originHost === expectedHost) return true;
      if (originUrl.hostname === 'localhost' || originUrl.hostname === '127.0.0.1') return true;
      if (originUrl.hostname === 'dailytithi.com' || originUrl.hostname.endsWith('.dailytithi.com')) return true;
      if (originUrl.hostname.endsWith('.vercel.app')) return true;
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererUrl = new URL(referer);
      const refererHost = refererUrl.host.toLowerCase();
      if (expectedHost && refererHost === expectedHost) return true;
      if (refererUrl.hostname === 'localhost' || refererUrl.hostname === '127.0.0.1') return true;
      if (refererUrl.hostname === 'dailytithi.com' || refererUrl.hostname.endsWith('.dailytithi.com')) return true;
      if (refererUrl.hostname.endsWith('.vercel.app')) return true;
    } catch {
      return false;
    }
  }

  return false;
}

/**
 * Validates endpoint URL strictly to HTTPS push services (or local development).
 */
function isValidPushEndpoint(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== 'string' || !endpoint.trim()) return false;
  try {
    const url = new URL(endpoint.trim());
    if (url.protocol === 'https:') return true;
    if (url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) return true;
    return false;
  } catch {
    return false;
  }
}

/**
 * Validates p256dh and auth crypto keys.
 */
function isValidKeys(keys: unknown): keys is PushSubscriptionKeys {
  if (typeof keys !== 'object' || keys === null) return false;
  const k = keys as Record<string, unknown>;
  return (
    typeof k.p256dh === 'string' &&
    k.p256dh.trim().length > 0 &&
    typeof k.auth === 'string' &&
    k.auth.trim().length > 0
  );
}

/**
 * GET /api/push/subscribe
 * Exposes the configured VAPID public key to authenticated client PWA instances.
 */
export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY || process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || null;
  return NextResponse.json({
    publicKey,
    configured: Boolean(publicKey)
  });
}

/**
 * POST /api/push/subscribe
 * Validates payload shape and origin, then upserts the push subscription into the KV store.
 */
export async function POST(req: NextRequest) {
  // 1. Origin verification
  if (!isOriginAllowed(req)) {
    return NextResponse.json(
      { error: 'Forbidden: Cross-origin subscription requests are rejected.' },
      { status: 403 }
    );
  }

  try {
    let body: SubscribePayload;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request: Malformed JSON payload.' },
        { status: 400 }
      );
    }

    // Support both nested { subscription: { endpoint, keys } } and flat { endpoint, keys }
    const endpoint = body.subscription?.endpoint || body.endpoint;
    const keys = body.subscription?.keys || body.keys;

    // 2. Validate payload shape
    if (!isValidPushEndpoint(endpoint)) {
      return NextResponse.json(
        { error: 'Bad Request: Invalid or missing push subscription endpoint URL.' },
        { status: 400 }
      );
    }

    if (!isValidKeys(keys)) {
      return NextResponse.json(
        { error: 'Bad Request: Missing or invalid encryption keys (p256dh, auth).' },
        { status: 400 }
      );
    }

    const timezone = typeof body.timezone === 'string' && body.timezone.trim()
      ? body.timezone.trim()
      : (body.location?.ianaTimezone || 'Asia/Kolkata');

    // 3. Upsert into primary KV subscription store (keyed by SHA-256 hash)
    const record = await upsertSubscription({
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth
      },
      timezone,
      location: body.location,
      preferences: body.preferences
    });

    // 4. Synchronize with legacy subscription store for backward compatibility
    await saveSubscription({
      subscription: {
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth
        }
      },
      location: body.location ? {
        latitude: body.location.latitude,
        longitude: body.location.longitude,
        timezone: body.location.timezone,
        ianaTimezone: body.location.ianaTimezone,
        name: body.location.name,
        source: 'gps'
      } : undefined,
      preferences: {
        dailyNotification: body.preferences?.dailyNotification !== false,
        notificationTime: body.preferences?.notificationTime || 'sunrise',
        alertOnTithiChange: Boolean(body.preferences?.alertOnTithiChange),
        autoUpdate: body.preferences?.autoUpdate !== false,
        wifiOnly: Boolean(body.preferences?.wifiOnly)
      },
      createdAt: record.createdAt,
      updatedAt: record.lastValidated
    }).catch((err: unknown) => {
      console.warn('Legacy subscription store sync note:', err);
    });

    return NextResponse.json({
      success: true,
      message: 'Push subscription successfully registered and validated.',
      endpointHash: record.endpointHash,
      createdAt: record.createdAt,
      lastValidated: record.lastValidated
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown subscription failure';
    console.error('Subscription processing error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error while saving subscription', details: message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/push/subscribe
 * Removes a subscription when the user disables alerts in-app or uninstalls.
 */
export async function DELETE(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return NextResponse.json(
      { error: 'Forbidden: Cross-origin request rejected.' },
      { status: 403 }
    );
  }

  try {
    let body: { endpoint?: string };
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request: Malformed JSON payload.' },
        { status: 400 }
      );
    }

    const endpoint = body?.endpoint;
    if (!endpoint || typeof endpoint !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request: Valid endpoint string is required to unsubscribe.' },
        { status: 400 }
      );
    }

    await deleteSubscription(endpoint);
    await removeSubscription(endpoint).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Subscription successfully removed.'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown unsubscribe failure';
    return NextResponse.json(
      { error: 'Failed to delete subscription', details: message },
      { status: 500 }
    );
  }
}
