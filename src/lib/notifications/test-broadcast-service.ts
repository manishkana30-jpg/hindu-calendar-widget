/**
 * Test Broadcast Service Orchestrator
 * 
 * Handles:
 * 1. Admin authentication & rate limiting (30s cooldown).
 * 2. Dry run preview (counts eligible vs opted-out).
 * 3. Batched Web Push execution (50 per batch with 50ms delay).
 * 4. Per-subscription error isolation & automatic 404/410 expiration pruning.
 * 5. One-way anonymous hashing for device tracking.
 */

import webpush from 'web-push';
import {
  getAllSubscriptionRecords,
  removeSubscription,
  StoredSubscriptionRecord
} from './subscription-store';
import {
  createTestBroadcastReport,
  getTestBroadcastReport,
  recordSendResult,
  hashEndpoint,
  getLastBroadcastTimestamp,
  setLastBroadcastTimestamp,
  TestBroadcastReport
} from './test-broadcast-store';
import { configureWebPush } from './vapid-config';

// Admin authentication secret (configurable via ADMIN_SECRET_KEY env variable)
export const DEFAULT_ADMIN_SECRET = 'panchang-admin-secret-2026';

export function verifyAdminKey(providedKey: string | null | undefined): boolean {
  const expectedKey = process.env.ADMIN_SECRET_KEY || DEFAULT_ADMIN_SECRET;
  if (!providedKey) return false;
  return providedKey.trim() === expectedKey.trim();
}

/**
 * Checks rate limit (minimum 30 seconds between real broadcast dispatches).
 */
export function checkBroadcastRateLimit(): { allowed: boolean; waitSecondsRemaining: number } {
  const now = Date.now();
  const lastTime = getLastBroadcastTimestamp();
  const cooldownMs = 30 * 1000;
  const elapsed = now - lastTime;

  if (elapsed < cooldownMs) {
    const remaining = Math.ceil((cooldownMs - elapsed) / 1000);
    return { allowed: false, waitSecondsRemaining: remaining };
  }
  return { allowed: true, waitSecondsRemaining: 0 };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface BroadcastOptions {
  dryRun?: boolean;
  testId?: string;
  batchSize?: number;
  batchDelayMs?: number;
}

export interface BroadcastResult {
  success: boolean;
  error?: string;
  report?: TestBroadcastReport;
}

/**
 * Executes a test broadcast (dry-run or real delivery).
 */
export async function executeTestBroadcast(options: BroadcastOptions = {}): Promise<BroadcastResult> {
  const isDryRun = Boolean(options.dryRun);
  const testId = options.testId || `test_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const batchSize = options.batchSize || 50;
  const batchDelayMs = options.batchDelayMs || 50;

  // 1. Check deduplication: if this testId already exists in store and is not dry run, block duplicate
  const existingReport = getTestBroadcastReport(testId);
  if (existingReport && !existingReport.isDryRun && !isDryRun) {
    return {
      success: false,
      error: `Duplicate send blocked: Test ID "${testId}" has already been broadcast.`
    };
  }

  // 2. Fetch all subscription records from store
  const allRecords = await getAllSubscriptionRecords();
  const totalSubscriptions = allRecords.length;

  let eligibleCount = 0;
  let optedOutCount = 0;

  const eligibleRecords: StoredSubscriptionRecord[] = [];

  for (const record of allRecords) {
    // Check if user has opted out in settings
    const isDailyEnabled = record.preferences?.dailyNotification !== false;
    if (!isDailyEnabled) {
      optedOutCount++;
    } else {
      eligibleCount++;
      eligibleRecords.push(record);
    }
  }

  // Initialize report in store
  const report = createTestBroadcastReport({
    testId,
    isDryRun,
    totalSubscriptions,
    eligibleCount,
    optedOutCount
  });

  // If dry run, return calculation immediately without sending anything
  if (isDryRun) {
    return {
      success: true,
      report: getTestBroadcastReport(testId) || report
    };
  }

  // 3. Rate-limit check for real broadcasts
  const rateLimit = checkBroadcastRateLimit();
  if (!rateLimit.allowed) {
    return {
      success: false,
      error: `Rate limit active: Please wait ${rateLimit.waitSecondsRemaining}s before triggering another broadcast.`
    };
  }

  setLastBroadcastTimestamp(Date.now());

  // 4. Configure VAPID keys securely
  const isVapidReady = configureWebPush();
  if (!isVapidReady) {
    return {
      success: false,
      error: 'Server VAPID credentials unconfigured or invalid.'
    };
  }

  // 5. Batched execution
  for (let i = 0; i < eligibleRecords.length; i += batchSize) {
    const batch = eligibleRecords.slice(i, i + batchSize);

    await Promise.allSettled(
      batch.map(async (record) => {
        const sub = record.subscription;
        if (!sub?.endpoint) return;

        const subId = hashEndpoint(sub.endpoint);

        // Derive platform & browser guess if available
        let platform: 'Android' | 'iOS' | 'Desktop' | 'Other' = 'Other';
        let browser: 'Chrome' | 'Edge' | 'Safari' | 'Firefox' | 'Other' = 'Other';

        const endpointLower = sub.endpoint.toLowerCase();
        if (endpointLower.includes('web.push.apple.com')) {
          platform = 'iOS';
          browser = 'Safari';
        } else if (endpointLower.includes('fcm.googleapis.com')) {
          browser = 'Chrome';
          platform = 'Android';
        } else if (endpointLower.includes('mozilla')) {
          browser = 'Firefox';
        }

        const notificationPayload = JSON.stringify({
          title: 'Panchang Test Notification',
          body: 'If you see this, daily Panchang alerts are working on your device. Tap to confirm.',
          icon: '/icon-192.svg',
          badge: '/icon-192.svg',
          data: {
            isTestBroadcast: true,
            testId,
            subId,
            url: `/?test_confirmed=true&test_id=${testId}`,
            timestamp: Date.now()
          }
        });

        try {
          await webpush.sendNotification(sub, notificationPayload);
          recordSendResult(testId, subId, {
            status: 'sent',
            platform,
            browser
          });
        } catch (err: unknown) {
          const webPushError = err as { statusCode?: number; message?: string };
          const statusCode = webPushError.statusCode || 500;

          if (statusCode === 404 || statusCode === 410) {
            // Subscription expired or uninstalled -> Remove automatically
            try {
              await removeSubscription(sub.endpoint);
            } catch {}
            recordSendResult(testId, subId, {
              status: 'expired',
              statusCode,
              errorMessage: 'Subscription expired or unregistered (410/404)',
              platform,
              browser
            });
          } else {
            recordSendResult(testId, subId, {
              status: 'failed',
              statusCode,
              errorMessage: webPushError.message || 'Push service error',
              platform,
              browser
            });
          }
        }
      })
    );

    // Small delay between batches to respect server limits
    if (i + batchSize < eligibleRecords.length) {
      await sleep(batchDelayMs);
    }
  }

  return {
    success: true,
    report: getTestBroadcastReport(testId) || report
  };
}
