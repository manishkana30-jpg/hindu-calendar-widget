#!/usr/bin/env node
/**
 * CLI Tool: Admin Push Notification Test Broadcast & Delivery Tracking
 * 
 * Usage:
 *   npx tsx scripts/broadcast-test-push.ts --dry-run
 *   npx tsx scripts/broadcast-test-push.ts --send
 *   npx tsx scripts/broadcast-test-push.ts --report <testId>
 */

import { executeTestBroadcast, DEFAULT_ADMIN_SECRET } from '../src/lib/notifications/test-broadcast-service';
import { getTestBroadcastReport, getAllTestIds } from '../src/lib/notifications/test-broadcast-store';

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isSend = args.includes('--send');
  const reportIndex = args.indexOf('--report');

  console.log('═══════════════════════════════════════════════════════════════════════════════════');
  console.log('           PANCHANG WEBAPP: ADMIN PUSH BROADCAST & CONFIRMATION CLI        ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

  if (reportIndex !== -1 && args[reportIndex + 1]) {
    const testId = args[reportIndex + 1];
    const report = getTestBroadcastReport(testId);
    if (!report) {
      console.error(`❌ Error: No report found for Test ID: "${testId}"`);
      process.exit(1);
    }

    printReport(report);
    return;
  }

  if (isDryRun) {
    console.log('🔍 Executing DRY RUN (No notifications will be dispatched to real devices)...\n');
    const result = await executeTestBroadcast({ dryRun: true });
    if (!result.success || !result.report) {
      console.error('❌ Dry run failed:', result.error);
      process.exit(1);
    }
    printReport(result.report);
    return;
  }

  if (isSend) {
    console.log('🚀 Executing REAL TEST BROADCAST to all registered devices...\n');
    const result = await executeTestBroadcast({ dryRun: false });
    if (!result.success || !result.report) {
      console.error('❌ Broadcast failed:', result.error);
      process.exit(1);
    }
    printReport(result.report);
    return;
  }

  // Default: Show usage & recent tests
  console.log('Available Commands:');
  console.log('  --dry-run             Preview eligible subscribers without sending');
  console.log('  --send                Execute real test broadcast to all subscribers');
  console.log('  --report <testId>     Display summary report for a specific test');
  console.log('\nRecent Test IDs:', getAllTestIds().join(', ') || 'None yet');
  console.log('\n═══════════════════════════════════════════════════════════════════════════════════\n');
}

function printReport(report: ReturnType<typeof getTestBroadcastReport>) {
  if (!report) return;

  console.log(`▸ TEST ID: ${report.testId} ${report.isDryRun ? '(DRY RUN PREVIEW)' : '(REAL BROADCAST)'}`);
  console.log(`  Triggered at: ${new Date(report.createdAt).toLocaleString()}`);
  console.log('───────────────────────────────────────────────────────────────────────────────────');
  console.log(`  Total Registered Subscriptions: ${report.totalSubscriptions}`);
  console.log(`  Eligible Subscribers:           ${report.eligibleCount}`);
  console.log(`  Opted-out (Notifications OFF):  ${report.optedOutCount}`);
  
  if (!report.isDryRun) {
    console.log(`  Successfully Sent:              ${report.sentCount}`);
    console.log(`  Failed (Temporary error):       ${report.failedCount}`);
    console.log(`  Expired & Pruned (410/404):     ${report.expiredRemovedCount}`);
    console.log(`  Device Receipts Confirmed:      ${report.receivedCount} (${report.receivedPercentage}%)`);
    console.log(`  Notifications Opened (Tapped):  ${report.openedCount} (${report.openedPercentage}%)`);
    
    console.log('\n▸ PLATFORM BREAKDOWN:');
    for (const [platform, stats] of Object.entries(report.platformBreakdown)) {
      if (stats.sent > 0 || stats.received > 0) {
        console.log(`    ${platform.padEnd(10)} Sent: ${stats.sent} | Received: ${stats.received} | Opened: ${stats.opened}`);
      }
    }

    console.log('\n▸ BROWSER BREAKDOWN:');
    for (const [browser, stats] of Object.entries(report.browserBreakdown)) {
      if (stats.sent > 0 || stats.received > 0) {
        console.log(`    ${browser.padEnd(10)} Sent: ${stats.sent} | Received: ${stats.received} | Opened: ${stats.opened}`);
      }
    }

    if (report.unconfirmedSubIds.length > 0) {
      console.log(`\n▸ UNCONFIRMED DEVICES (${report.unconfirmedSubIds.length}):`);
      for (const item of report.unconfirmedSubIds) {
        console.log(`    Sub ID: ${item.subId} | Elapsed: ${item.elapsedMinutes}m | Diagnostic: ${item.diagnostic}`);
      }
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════════════\n');
}

main().catch(console.error);
