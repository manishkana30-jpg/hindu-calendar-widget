/**
 * Test Broadcast & Delivery Confirmation Storage Engine
 * 
 * Tracks one-time admin test broadcasts, delivery receipts, and click confirmations.
 * 
 * Privacy & Safety:
 * - Uses one-way anonymous subscription IDs (subId = 12-char SHA-256 hash of endpoint).
 * - Zero personal identifiable information (PII) stored.
 * - Deduplicates per testId.
 * - Records device platform, browser, and app version anonymously.
 */

import crypto from 'crypto';

export interface DeviceConfirmationMetadata {
  subId: string;
  status: 'sent' | 'failed' | 'expired' | 'opted-out';
  statusCode?: number;
  errorMessage?: string;
  sentAt?: number;
  receivedAt?: number;
  openedAt?: number;
  platform?: 'Android' | 'iOS' | 'Desktop' | 'Other';
  browser?: 'Chrome' | 'Edge' | 'Safari' | 'Firefox' | 'Other';
  appVersion?: string;
}

export interface PlatformMetrics {
  sent: number;
  received: number;
  opened: number;
}

export interface TestBroadcastReport {
  testId: string;
  createdAt: number;
  isDryRun: boolean;
  totalSubscriptions: number;
  eligibleCount: number;
  optedOutCount: number;
  sentCount: number;
  failedCount: number;
  expiredRemovedCount: number;
  receivedCount: number;
  openedCount: number;
  receivedPercentage: number;
  openedPercentage: number;
  platformBreakdown: Record<string, PlatformMetrics>;
  browserBreakdown: Record<string, PlatformMetrics>;
  unconfirmedSubIds: {
    subId: string;
    sentAt: number;
    elapsedMinutes: number;
    platform?: string;
    browser?: string;
    diagnostic: string;
  }[];
  devices: Record<string, DeviceConfirmationMetadata>;
}

// Global in-memory storage pool (retained across hot-reloads and API calls)
interface GlobalTestPool {
  __test_broadcasts?: Map<string, TestBroadcastReport>;
  __last_broadcast_time?: number;
}

function getTestStore(): Map<string, TestBroadcastReport> {
  const g = globalThis as unknown as GlobalTestPool;
  if (!g.__test_broadcasts) {
    g.__test_broadcasts = new Map<string, TestBroadcastReport>();
  }
  return g.__test_broadcasts;
}

export function getLastBroadcastTimestamp(): number {
  const g = globalThis as unknown as GlobalTestPool;
  return g.__last_broadcast_time || 0;
}

export function setLastBroadcastTimestamp(ts: number): void {
  const g = globalThis as unknown as GlobalTestPool;
  g.__last_broadcast_time = ts;
}

/**
 * Creates an anonymous 12-char hash for a push endpoint.
 */
export function hashEndpoint(endpoint: string): string {
  return crypto.createHash('sha256').update(endpoint).digest('hex').substring(0, 12);
}

/**
 * Creates or initializes a new TestBroadcastReport.
 */
export function createTestBroadcastReport(params: {
  testId: string;
  isDryRun: boolean;
  totalSubscriptions: number;
  eligibleCount: number;
  optedOutCount: number;
}): TestBroadcastReport {
  const report: TestBroadcastReport = {
    testId: params.testId,
    createdAt: Date.now(),
    isDryRun: params.isDryRun,
    totalSubscriptions: params.totalSubscriptions,
    eligibleCount: params.eligibleCount,
    optedOutCount: params.optedOutCount,
    sentCount: 0,
    failedCount: 0,
    expiredRemovedCount: 0,
    receivedCount: 0,
    openedCount: 0,
    receivedPercentage: 0,
    openedPercentage: 0,
    platformBreakdown: {
      Android: { sent: 0, received: 0, opened: 0 },
      iOS: { sent: 0, received: 0, opened: 0 },
      Desktop: { sent: 0, received: 0, opened: 0 },
      Other: { sent: 0, received: 0, opened: 0 }
    },
    browserBreakdown: {
      Chrome: { sent: 0, received: 0, opened: 0 },
      Edge: { sent: 0, received: 0, opened: 0 },
      Safari: { sent: 0, received: 0, opened: 0 },
      Firefox: { sent: 0, received: 0, opened: 0 },
      Other: { sent: 0, received: 0, opened: 0 }
    },
    unconfirmedSubIds: [],
    devices: {}
  };

  const store = getTestStore();
  store.set(params.testId, report);
  return report;
}

/**
 * Retrieves a test broadcast report by ID.
 */
export function getTestBroadcastReport(testId: string, unconfirmedWaitMinutes: number = 30): TestBroadcastReport | null {
  const store = getTestStore();
  const report = store.get(testId);
  if (!report) return null;

  // Refresh percentages
  if (report.sentCount > 0) {
    report.receivedPercentage = Number(((report.receivedCount / report.sentCount) * 100).toFixed(1));
    report.openedPercentage = Number(((report.openedCount / report.sentCount) * 100).toFixed(1));
  }

  // Refresh unconfirmed list based on elapsed wait time
  const now = Date.now();
  const unconfirmed: TestBroadcastReport['unconfirmedSubIds'] = [];

  for (const [subId, dev] of Object.entries(report.devices)) {
    if (dev.status === 'sent' && !dev.receivedAt) {
      const elapsedMs = now - (dev.sentAt || report.createdAt);
      const elapsedMin = Math.floor(elapsedMs / 60000);
      
      let diagnostic = 'Pending delivery';
      if (elapsedMin >= unconfirmedWaitMinutes) {
        if (dev.platform === 'iOS') {
          diagnostic = 'Unconfirmed >30m: App may not be added to iOS Home Screen, notifications blocked, or device offline.';
        } else {
          diagnostic = 'Unconfirmed >30m: Device is offline, browser in background power-save, or notifications blocked in OS.';
        }
      }

      unconfirmed.push({
        subId,
        sentAt: dev.sentAt || report.createdAt,
        elapsedMinutes: elapsedMin,
        platform: dev.platform,
        browser: dev.browser,
        diagnostic
      });
    }
  }

  report.unconfirmedSubIds = unconfirmed;
  return report;
}

/**
 * Records a sent or failed result for an anonymous subId during broadcast.
 */
export function recordSendResult(
  testId: string,
  subId: string,
  result: {
    status: 'sent' | 'failed' | 'expired' | 'opted-out';
    statusCode?: number;
    errorMessage?: string;
    platform?: 'Android' | 'iOS' | 'Desktop' | 'Other';
    browser?: 'Chrome' | 'Edge' | 'Safari' | 'Firefox' | 'Other';
  }
): void {
  const store = getTestStore();
  const report = store.get(testId);
  if (!report) return;

  const now = Date.now();
  report.devices[subId] = {
    subId,
    status: result.status,
    statusCode: result.statusCode,
    errorMessage: result.errorMessage,
    sentAt: now,
    platform: result.platform || 'Other',
    browser: result.browser || 'Other'
  };

  if (result.status === 'sent') {
    report.sentCount++;
    const plat = result.platform || 'Other';
    const brow = result.browser || 'Other';
    if (report.platformBreakdown[plat]) report.platformBreakdown[plat].sent++;
    if (report.browserBreakdown[brow]) report.browserBreakdown[brow].sent++;
  } else if (result.status === 'failed') {
    report.failedCount++;
  } else if (result.status === 'expired') {
    report.expiredRemovedCount++;
  } else if (result.status === 'opted-out') {
    report.optedOutCount++;
  }

  if (report.sentCount > 0) {
    report.receivedPercentage = Number(((report.receivedCount / report.sentCount) * 100).toFixed(1));
    report.openedPercentage = Number(((report.openedCount / report.sentCount) * 100).toFixed(1));
  }
}

/**
 * Records a delivery confirmation event ("received" or "opened") from a client device.
 */
export function recordDeviceConfirmation(params: {
  testId: string;
  subId: string;
  event: 'received' | 'opened';
  platform?: 'Android' | 'iOS' | 'Desktop' | 'Other';
  browser?: 'Chrome' | 'Edge' | 'Safari' | 'Firefox' | 'Other';
  appVersion?: string;
}): boolean {
  const store = getTestStore();
  const report = store.get(params.testId);
  if (!report) return false;

  const now = Date.now();
  let dev = report.devices[params.subId];

  if (!dev) {
    dev = {
      subId: params.subId,
      status: 'sent',
      sentAt: report.createdAt
    };
    report.devices[params.subId] = dev;
  }

  if (params.platform) dev.platform = params.platform;
  if (params.browser) dev.browser = params.browser;
  if (params.appVersion) dev.appVersion = params.appVersion;

  const plat = dev.platform || 'Other';
  const brow = dev.browser || 'Other';

  if (params.event === 'received' && !dev.receivedAt) {
    dev.receivedAt = now;
    report.receivedCount++;
    if (report.platformBreakdown[plat]) report.platformBreakdown[plat].received++;
    if (report.browserBreakdown[brow]) report.browserBreakdown[brow].received++;
  } else if (params.event === 'opened' && !dev.openedAt) {
    dev.openedAt = now;
    report.openedCount++;
    if (!dev.receivedAt) {
      dev.receivedAt = now;
      report.receivedCount++;
      if (report.platformBreakdown[plat]) report.platformBreakdown[plat].received++;
      if (report.browserBreakdown[brow]) report.browserBreakdown[brow].received++;
    }
    if (report.platformBreakdown[plat]) report.platformBreakdown[plat].opened++;
    if (report.browserBreakdown[brow]) report.browserBreakdown[brow].opened++;
  }

  if (report.sentCount > 0) {
    report.receivedPercentage = Number(((report.receivedCount / report.sentCount) * 100).toFixed(1));
    report.openedPercentage = Number(((report.openedCount / report.sentCount) * 100).toFixed(1));
  }

  return true;
}

/**
 * Returns all recorded test IDs.
 */
export function getAllTestIds(): string[] {
  const store = getTestStore();
  return Array.from(store.keys());
}
