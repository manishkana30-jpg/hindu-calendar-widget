import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

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

    // If Vercel KV environment is configured, persist the subscription
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const subString = typeof subscription === 'string' ? subscription : JSON.stringify(subscription);
      await kv.sadd('push_subscriptions', subString);
      return NextResponse.json({
        success: true,
        message: 'Subscription registered successfully.'
      });
    }

    // Graceful fallback for local development or preview environments without KV
    return NextResponse.json({
      success: true,
      dryRun: true,
      message: 'KV not configured. Subscription accepted in dry-run mode.'
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

    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const allSubs: (string | object)[] = await kv.smembers('push_subscriptions');
      for (const item of allSubs) {
        const itemStr = typeof item === 'string' ? item : JSON.stringify(item);
        if (itemStr.includes(endpoint)) {
          await kv.srem('push_subscriptions', itemStr);
        }
      }
      return NextResponse.json({
        success: true,
        message: 'Subscription removed successfully.'
      });
    }

    return NextResponse.json({
      success: true,
      dryRun: true,
      message: 'KV not configured. Unsubscribe accepted in dry-run mode.'
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown unsubscribe error';
    return NextResponse.json(
      { error: 'Failed to delete subscription', details: message },
      { status: 500 }
    );
  }
}
