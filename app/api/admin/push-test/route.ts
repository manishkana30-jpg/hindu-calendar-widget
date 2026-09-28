import { NextRequest, NextResponse } from 'next/server';
import {
  verifyAdminKey,
  executeTestBroadcast,
  checkBroadcastRateLimit
} from '@/src/lib/notifications/test-broadcast-service';
import {
  getTestBroadcastReport,
  getAllTestIds
} from '@/src/lib/notifications/test-broadcast-store';

function extractAdminKey(req: NextRequest): string | null {
  const headerKey = req.headers.get('x-admin-key');
  if (headerKey) return headerKey;

  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const { searchParams } = new URL(req.url);
  return searchParams.get('adminKey');
}

/**
 * GET: Retrieve report for a specific testId or list all testIds.
 */
export async function GET(req: NextRequest) {
  const adminKey = extractAdminKey(req);
  if (!verifyAdminKey(adminKey)) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid admin key.' },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(req.url);
  const testId = searchParams.get('testId');
  const waitMin = Number(searchParams.get('unconfirmedWaitMinutes')) || 30;

  if (testId) {
    const report = getTestBroadcastReport(testId, waitMin);
    if (!report) {
      return NextResponse.json(
        { error: `Report not found for testId: ${testId}` },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true, report });
  }

  const testIds = getAllTestIds();
  return NextResponse.json({ success: true, testIds });
}

/**
 * POST: Trigger dry-run or real test broadcast.
 */
export async function POST(req: NextRequest) {
  const adminKey = extractAdminKey(req);
  if (!verifyAdminKey(adminKey)) {
    return NextResponse.json(
      { error: 'Unauthorized: Missing or invalid admin key.' },
      { status: 401 }
    );
  }

  let body: {
    dryRun?: boolean;
    confirmBroadcast?: boolean;
    testId?: string;
  } = {};

  try {
    body = await req.json();
  } catch {
    // Empty body
  }

  const isDryRun = Boolean(body.dryRun);
  const confirmBroadcast = Boolean(body.confirmBroadcast);

  // Safety confirmation check
  if (!isDryRun && !confirmBroadcast) {
    return NextResponse.json(
      {
        success: false,
        requiresConfirmation: true,
        message: 'Safety confirmation required: Pass confirmBroadcast: true to dispatch push notifications to real devices.'
      },
      { status: 400 }
    );
  }

  // Rate limit check for real broadcasts
  if (!isDryRun) {
    const rateLimit = checkBroadcastRateLimit();
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit active: Please wait ${rateLimit.waitSecondsRemaining}s before triggering another broadcast.`
        },
        { status: 429, headers: { 'Retry-After': String(rateLimit.waitSecondsRemaining) } }
      );
    }
  }

  const result = await executeTestBroadcast({
    dryRun: isDryRun,
    testId: body.testId
  });

  if (!result.success) {
    return NextResponse.json(
      { success: false, error: result.error },
      { status: 400 }
    );
  }

  return NextResponse.json({
    success: true,
    message: isDryRun ? 'Dry run completed successfully.' : 'Test broadcast dispatched.',
    report: result.report
  });
}
