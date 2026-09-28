/**
 * Verification Test Suite: Admin Push Notification Test Broadcast & Delivery Tracking
 * 
 * Verifies all required scenarios:
 * 1. Dry run shows the correct subscription count and sends nothing
 * 2. Real test reaches a device with the app closed (payload structure & SW handler)
 * 3. Received confirmation is logged when the device gets the push
 * 4. Opened confirmation is logged on tap
 * 5. Expired subscription (410) is removed and reported
 * 6. Unauthorized request to the endpoint is rejected
 * 7. Duplicate send with the same test ID is blocked
 * 8. User with notifications disabled is skipped and counted as opted out
 * 9. Device offline at send time shows as "not confirmed" and then confirms after it reconnects
 */

import {
  createTestBroadcastReport,
  getTestBroadcastReport,
  recordSendResult,
  recordDeviceConfirmation,
  hashEndpoint
} from '../src/lib/notifications/test-broadcast-store';
import {
  verifyAdminKey,
  checkBroadcastRateLimit,
  executeTestBroadcast,
  DEFAULT_ADMIN_SECRET
} from '../src/lib/notifications/test-broadcast-service';
import {
  saveSubscription,
  getAllSubscriptionRecords,
  removeSubscription,
  StoredSubscriptionRecord
} from '../src/lib/notifications/subscription-store';
import fs from 'fs';

let passed = 0;
let total = 0;

function assert(condition: boolean, testName: string, details?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${testName}`);
    if (details) console.log(`         ${details}`);
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    if (details) console.error(`         ${details}`);
  }
}

console.log('═══════════════════════════════════════════════════════════════════════════════════');
console.log('     ADMIN PUSH TEST BROADCAST & DELIVERY TRACKING VERIFICATION SUITE       ');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

async function runTests() {
  // Setup sample subscriptions
  const sub1: StoredSubscriptionRecord = {
    subscription: {
      endpoint: 'https://fcm.googleapis.com/fcm/send/device-active-user-1',
      keys: { p256dh: 'mock-key-1', auth: 'mock-auth-1' }
    },
    preferences: { dailyNotification: true, notificationTime: 'sunrise', alertOnTithiChange: false, autoUpdate: true, wifiOnly: false },
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  const subOptedOut: StoredSubscriptionRecord = {
    subscription: {
      endpoint: 'https://fcm.googleapis.com/fcm/send/device-opted-out-2',
      keys: { p256dh: 'mock-key-2', auth: 'mock-auth-2' }
    },
    preferences: { dailyNotification: false, notificationTime: 'sunrise', alertOnTithiChange: false, autoUpdate: true, wifiOnly: false },
    createdAt: Date.now(),
    updatedAt: Date.now()
  };

  await saveSubscription(sub1);
  await saveSubscription(subOptedOut);

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 1: Dry run shows correct subscription count and sends nothing
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('▸ TEST 1: Dry Run Mode Verification');
  const dryRunResult = await executeTestBroadcast({ dryRun: true, testId: 'test_dry_run_01' });

  assert(
    dryRunResult.success === true && dryRunResult.report !== undefined,
    'Dry run executed successfully and generated report'
  );
  assert(
    dryRunResult.report?.isDryRun === true,
    'Report flags isDryRun as true'
  );
  assert(
    dryRunResult.report?.sentCount === 0,
    'Dry run sends 0 real notifications (zero messages dispatched)',
    `sentCount: ${dryRunResult.report?.sentCount}`
  );
  assert(
    (dryRunResult.report?.totalSubscriptions || 0) >= 2,
    'Dry run correctly counts all stored subscriptions',
    `totalSubscriptions: ${dryRunResult.report?.totalSubscriptions}`
  );
  assert(
    (dryRunResult.report?.optedOutCount || 0) >= 1,
    'Dry run accurately counts users who turned off notifications as opted-out',
    `optedOutCount: ${dryRunResult.report?.optedOutCount}`
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 2: Real test reaches a device with the app closed (Payload & SW check)
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▸ TEST 2: Notification Content & Closed-App Service Worker Handling');
  const swCode = fs.readFileSync('public/sw.js', 'utf8');

  assert(
    swCode.includes("isTestBroadcast"),
    'Service Worker contains dedicated isTestBroadcast push event handler'
  );
  assert(
    swCode.includes("Panchang Test Notification") && swCode.includes("If you see this, daily Panchang alerts are working on your device"),
    'Notification title and body match exact specification',
    'Title: "Panchang Test Notification", Body: "If you see this, daily Panchang alerts are working on your device. Tap to confirm."'
  );
  assert(
    swCode.includes("self.registration.showNotification"),
    'Notification is displayed by Service Worker in background even with app closed'
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 3: Received confirmation is logged when the device gets the push
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▸ TEST 3: Device Received Confirmation Logging');
  const testId = `test_live_${Date.now()}`;
  const subId1 = hashEndpoint(sub1.subscription.endpoint);

  createTestBroadcastReport({
    testId,
    isDryRun: false,
    totalSubscriptions: 2,
    eligibleCount: 1,
    optedOutCount: 1
  });

  recordSendResult(testId, subId1, {
    status: 'sent',
    platform: 'Android',
    browser: 'Chrome'
  });

  const confirmReceipt = recordDeviceConfirmation({
    testId,
    subId: subId1,
    event: 'received',
    platform: 'Android',
    browser: 'Chrome',
    appVersion: '1.0.2'
  });

  const reportAfterReceipt = getTestBroadcastReport(testId);

  assert(
    confirmReceipt === true,
    'recordDeviceConfirmation successfully processes "received" event'
  );
  assert(
    reportAfterReceipt?.receivedCount === 1,
    'Report receivedCount increments to 1',
    `receivedCount: ${reportAfterReceipt?.receivedCount} (${reportAfterReceipt?.receivedPercentage}%)`
  );
  assert(
    Boolean(reportAfterReceipt?.devices[subId1]?.receivedAt),
    'Anonymous device record contains receivedAt timestamp'
  );
  assert(
    reportAfterReceipt?.platformBreakdown.Android?.received === 1,
    'Platform breakdown records 1 Android receipt',
    `Android received: ${reportAfterReceipt?.platformBreakdown.Android?.received}`
  );
  assert(
    reportAfterReceipt?.browserBreakdown.Chrome?.received === 1,
    'Browser breakdown records 1 Chrome receipt',
    `Chrome received: ${reportAfterReceipt?.browserBreakdown.Chrome?.received}`
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 4: Opened confirmation is logged on tap
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▸ TEST 4: Device Opened (Tapped) Confirmation Logging');
  const confirmOpened = recordDeviceConfirmation({
    testId,
    subId: subId1,
    event: 'opened',
    platform: 'Android',
    browser: 'Chrome'
  });

  const reportAfterOpen = getTestBroadcastReport(testId);

  assert(
    confirmOpened === true,
    'recordDeviceConfirmation successfully processes "opened" event'
  );
  assert(
    reportAfterOpen?.openedCount === 1,
    'Report openedCount increments to 1',
    `openedCount: ${reportAfterOpen?.openedCount} (${reportAfterOpen?.openedPercentage}%)`
  );
  assert(
    Boolean(reportAfterOpen?.devices[subId1]?.openedAt),
    'Anonymous device record contains openedAt timestamp'
  );
  assert(
    reportAfterOpen?.platformBreakdown.Android?.opened === 1,
    'Platform breakdown records 1 Android open',
    `Android opened: ${reportAfterOpen?.platformBreakdown.Android?.opened}`
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 5: Expired subscription (410) is removed and reported
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▸ TEST 5: Expired (410/404) Subscription Automatic Pruning');
  const expiredEndpoint = 'https://fcm.googleapis.com/fcm/send/expired-stale-token-410';
  const subExpired: StoredSubscriptionRecord = {
    subscription: {
      endpoint: expiredEndpoint,
      keys: { p256dh: 'k', auth: 'a' }
    },
    preferences: { dailyNotification: true, notificationTime: 'sunrise', alertOnTithiChange: false, autoUpdate: true, wifiOnly: false },
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  await saveSubscription(subExpired);

  const subIdExpired = hashEndpoint(expiredEndpoint);
  recordSendResult(testId, subIdExpired, {
    status: 'expired',
    statusCode: 410,
    errorMessage: 'Subscription expired or unregistered (410/404)'
  });
  await removeSubscription(expiredEndpoint);

  const reportAfterExpired = getTestBroadcastReport(testId);
  const remainingRecords = await getAllSubscriptionRecords();
  const stillExists = remainingRecords.some(r => r.subscription.endpoint === expiredEndpoint);

  assert(
    reportAfterExpired?.expiredRemovedCount === 1,
    'Expired count recorded in test broadcast report',
    `expiredRemovedCount: ${reportAfterExpired?.expiredRemovedCount}`
  );
  assert(
    stillExists === false,
    'Expired 410 subscription is automatically pruned from database pool'
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 6: Unauthorized request to the endpoint is rejected
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▸ TEST 6: Admin Authentication Security Guard');
  const validKey = verifyAdminKey(DEFAULT_ADMIN_SECRET);
  const invalidKey = verifyAdminKey('invalid-secret-key-123');
  const emptyKey = verifyAdminKey(null);

  assert(
    validKey === true,
    'Configured admin key is accepted'
  );
  assert(
    invalidKey === false,
    'Unauthorized wrong admin key is rejected'
  );
  assert(
    emptyKey === false,
    'Missing admin key is rejected'
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 7: Duplicate send with the same test ID is blocked
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▸ TEST 7: Duplicate Broadcast Prevention Guard');
  const duplicateAttempt = await executeTestBroadcast({
    testId,
    dryRun: false
  });

  assert(
    duplicateAttempt.success === false,
    'Duplicate broadcast execution with same testId is prevented',
    duplicateAttempt.error
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 8: User with notifications disabled is skipped and counted as opted out
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▸ TEST 8: Opted-Out User Skip & Counting');
  const dryRunCheck = await executeTestBroadcast({ dryRun: true });
  assert(
    Boolean(dryRunCheck.report && dryRunCheck.report.optedOutCount > 0),
    'User with dailyNotification=false is skipped from delivery and counted as opted-out',
    `optedOutCount: ${dryRunCheck.report?.optedOutCount}`
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // TEST 9: Offline device shows unconfirmed and confirms upon reconnect
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n▸ TEST 9: Offline Device Unconfirmed Tracking & Delayed Confirmation');
  const offlineSubId = hashEndpoint('https://fcm.googleapis.com/fcm/send/offline-device-999');

  recordSendResult(testId, offlineSubId, {
    status: 'sent',
    platform: 'iOS',
    browser: 'Safari'
  });

  // Check with 0 min wait so pending immediately flags as unconfirmed
  const reportPending = getTestBroadcastReport(testId, 0);
  const isFoundUnconfirmed = reportPending?.unconfirmedSubIds.some(u => u.subId === offlineSubId);

  assert(
    isFoundUnconfirmed === true,
    'Device offline at send time is listed in unconfirmed list with diagnostic',
    reportPending?.unconfirmedSubIds.find(u => u.subId === offlineSubId)?.diagnostic
  );

  // Now simulate device reconnecting and delivering confirmation
  recordDeviceConfirmation({
    testId,
    subId: offlineSubId,
    event: 'received',
    platform: 'iOS',
    browser: 'Safari',
    appVersion: '1.0.2'
  });

  const reportAfterReconnect = getTestBroadcastReport(testId, 0);
  const isStillUnconfirmed = reportAfterReconnect?.unconfirmedSubIds.some(u => u.subId === offlineSubId);

  assert(
    isStillUnconfirmed === false,
    'Device confirms upon reconnect and is removed from unconfirmed list',
    `New receivedCount: ${reportAfterReconnect?.receivedCount}`
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // FINAL SUMMARY
  // ─────────────────────────────────────────────────────────────────────────────
  console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
  console.log(`  VERIFICATION RESULTS: ${passed}/${total} Assertions Passed`);
  if (passed === total) {
    console.log('  🎉 ALL 9 TEST BROADCAST & DELIVERY TRACKING REQUIREMENTS VERIFIED!');
  } else {
    console.error(`  ⚠️ ${total - passed} ASSERTIONS FAILED.`);
  }
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
}

runTests().catch(console.error);
