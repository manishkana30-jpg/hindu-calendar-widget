import { NextRequest, NextResponse } from 'next/server';
import { getVapidPublicKey, isVapidConfigured } from '@/src/lib/webpush';
import { getSupabaseAdmin } from '@/src/lib/supabase/client';
import {
  upsertSubscription,
  updateSubscriptionPreferences,
  deleteSubscription,
  PushSubscriptionKeys,
  PushSubscriptionPreferences
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
  preferences?: PushSubscriptionPreferences;
  isActive?: boolean;
  is_active?: boolean;
  visitorSession?: string;
  session_id?: string;
}

/**
 * Validates whether the incoming request is origin-compliant.
 * Rejects cross-origin POST requests from unauthorized domains.
 */
function isOriginAllowed(req: NextRequest): boolean {
  const origin = req.headers.get('origin');
  const host = req.headers.get('host')?.toLowerCase() || '';

  // If host header matches our domain or localhost, allow
  if (
    host === 'dailytithi.com' ||
    host.endsWith('.dailytithi.com') ||
    host.endsWith('.vercel.app') ||
    host.startsWith('localhost') ||
    host.startsWith('127.0.0.1')
  ) {
    // If an explicit cross-origin header is present, check that it's not a third party
    if (origin) {
      try {
        const originUrl = new URL(origin);
        const originHost = originUrl.host.toLowerCase();
        if (
          originHost !== host &&
          !originHost.includes('dailytithi.com') &&
          !originHost.includes('localhost') &&
          !originHost.endsWith('.vercel.app')
        ) {
          return false;
        }
      } catch {
        return false;
      }
    }
    return true;
  }

  // Fallback for dev / test runners
  if (process.env.NODE_ENV !== 'production') return true;

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
  const publicKey = getVapidPublicKey();
  return NextResponse.json({
    publicKey,
    configured: isVapidConfigured()
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

    const isActive = body.isActive !== undefined ? body.isActive : (body.is_active !== undefined ? body.is_active : true);

    // 3. Upsert into primary KV subscription store (keyed by SHA-256 hash)
    const record = await upsertSubscription({
      endpoint,
      keys: {
        p256dh: keys.p256dh,
        auth: keys.auth
      },
      timezone,
      location: body.location,
      preferences: body.preferences,
      isActive
    });

    // 4. Track Conversion: Update visitor_logs for current session
    const visitorSession =
      req.cookies.get('visitor_session')?.value ||
      body.visitorSession ||
      body.session_id;

    if (visitorSession) {
      const supabase = getSupabaseAdmin();
      if (supabase) {
        try {
          const { error: logErr } = await supabase
            .from('visitor_logs')
            .update({ is_subscribed: true })
            .eq('session_id', visitorSession);

          if (logErr) {
            console.warn('[Conversion Tracking] visitor_logs update note:', logErr.message);
          }
        } catch (err: unknown) {
          console.warn('[Conversion Tracking] visitor_logs update exception:', err);
        }
      }
    }

    // 5. Synchronize with legacy subscription store for backward compatibility
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
 * PATCH /api/push/subscribe
 * Updates subscription preferences, location, or is_active toggle in Supabase PostgreSQL.
 */
export async function PATCH(req: NextRequest) {
  if (!isOriginAllowed(req)) {
    return NextResponse.json(
      { error: 'Forbidden: Cross-origin request rejected.' },
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

    const endpoint = body.subscription?.endpoint || body.endpoint;
    if (!isValidPushEndpoint(endpoint)) {
      return NextResponse.json(
        { error: 'Bad Request: Valid push subscription endpoint URL is required.' },
        { status: 400 }
      );
    }

    const isActive = body.isActive !== undefined ? body.isActive : (body.is_active !== undefined ? body.is_active : undefined);

    const success = await updateSubscriptionPreferences({
      endpoint,
      isActive,
      preferences: body.preferences,
      location: body.location,
      timezone: body.timezone || body.location?.ianaTimezone
    });

    return NextResponse.json({
      success,
      message: 'Subscription updated successfully.',
      isActive,
      preferences: body.preferences
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown update failure';
    return NextResponse.json(
      { error: 'Failed to update subscription', details: message },
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

    await updateSubscriptionPreferences({ endpoint, isActive: false });
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
