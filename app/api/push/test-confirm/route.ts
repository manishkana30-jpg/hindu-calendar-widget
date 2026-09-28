import { NextRequest, NextResponse } from 'next/server';
import { recordDeviceConfirmation } from '@/src/lib/notifications/test-broadcast-store';

/**
 * Endpoint called silently by the Service Worker when a test push is received or clicked.
 * No PII is collected — only anonymous testId, subId (hash), and device capability metrics.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { testId, subId, event, platform, browser, appVersion } = body;

    if (!testId || !subId || !event) {
      return NextResponse.json(
        { error: 'Missing required parameters: testId, subId, and event are mandatory.' },
        { status: 400 }
      );
    }

    if (event !== 'received' && event !== 'opened') {
      return NextResponse.json(
        { error: 'Invalid event type. Must be "received" or "opened".' },
        { status: 400 }
      );
    }

    const recorded = recordDeviceConfirmation({
      testId,
      subId,
      event,
      platform,
      browser,
      appVersion
    });

    return NextResponse.json({
      success: true,
      confirmed: recorded,
      testId,
      event
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || 'Failed to process confirmation' },
      { status: 500 }
    );
  }
}
