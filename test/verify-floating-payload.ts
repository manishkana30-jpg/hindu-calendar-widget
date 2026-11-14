/**
 * Verification Test Suite for Floating Lock-Screen Push Notification Payload
 * DailyTithi.com — High-Precision Vedic Panchang PWA
 */

import {
  buildDailyFloatingPayload,
  extractDailyPanchangData,
  DailyPanchangData
} from '../src/lib/push/dailySummaryPayload';
import { PRESET_LOCATIONS } from '../src/lib/vedic-astronomy';
import { validateVapidSetup, getVapidCredentials } from '../src/lib/webpush';

let passed = 0;
let total = 0;

function assert(condition: boolean, desc: string, extra?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${desc}`);
  } else {
    console.error(`  ✗ FAIL: ${desc} ${extra || ''}`);
    throw new Error(`Failed: ${desc}`);
  }
}

async function runAudit() {
  console.log('═══════════════════════════════════════════════════════════════════════════════════');
  console.log('       ALL-IN-ONE FLOATING DAILY LOCK-SCREEN NOTIFICATION AUDIT                   ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

  // ── TEST 1: Exact Notification Structure & Template Verification ─────────────
  console.log('▸ 1. Verifying Canonical Example Budget & Formatting:');
  const sampleData: DailyPanchangData = {
    vara: 'Shanivara',
    day: '10',
    month: 'Oct',
    tithiName: 'Krishna Amavasya',
    significance: 'Mahalaya / सर्वपितृ',
    tithiEndRelative: 'today',
    tithiEndTime: '09:20 PM',
    auspiciousName: 'Abhijit',
    auspiciousStart: '11:45 AM',
    auspiciousEnd: '12:33 PM',
    rahuStart: '09:15 AM',
    rahuEnd: '10:45 AM',
    panchakStatus: 'Free',
    sunrise: '06:19 AM',
    sunset: '05:57 PM'
  };

  const payload = buildDailyFloatingPayload(sampleData);
  const lines = payload.options.body.split('\n');

  console.log('Title:  ' + payload.title + ` (${payload.title.length} chars)`);
  lines.forEach((l, idx) => console.log(`Line ${idx + 1}: ${l} (${l.length} chars)`));
  console.log(`Total Body Length: ${payload.options.body.length} chars\n`);

  assert(payload.title.length <= 38, 'Title is strictly <= 38 characters', `Got ${payload.title.length}`);
  assert(lines.length === 3, 'Notification body has exactly 3 glanceable lines without blank separators', `Got ${lines.length}`);
  assert(lines[0].length <= 50, 'Line 1 is strictly <= 50 characters', `Got ${lines[0].length}`);
  assert(lines[1].length <= 55, 'Line 2 is strictly <= 55 characters', `Got ${lines[1].length}`);
  assert(lines[2].length <= 50, 'Line 3 is strictly <= 50 characters', `Got ${lines[2].length}`);
  assert(payload.options.body.length <= 150, 'Total Body Length fits mobile lock screens without truncation', `Got ${payload.options.body.length}`);

  // Options verification
  assert(payload.options.tag === 'daily-tithi-panchang', 'Canonical Tag is "daily-tithi-panchang"');
  assert(payload.options.requireInteraction === true, 'requireInteraction is true for persistent lock-screen docking');
  assert(payload.options.renotify === true, 'renotify is true for lock-screen alert and vibration');
  assert(payload.options.actions?.length === 2, 'Contains exactly 2 action buttons');
  assert(payload.options.actions?.[0].action === 'open_panchang', 'Action 1 is open_panchang');
  assert(payload.options.actions?.[1].action === 'open_muhurat', 'Action 2 is open_muhurat');
  assert(payload.options.icon === '/icons/icon-192x192.png', 'Icon points to /icons/icon-192x192.png');
  assert(payload.options.badge === '/icons/badge-72x72.png', 'Badge points to /icons/badge-72x72.png');

  // ── TEST 2: Multi-Date Astronomical Extraction ───────────────────────────────
  console.log('\n▸ 2. Verifying Real Astronomical Panchang Extraction across Dates:');
  const testDates = [
    new Date('2026-10-10T06:00:00Z'), // October Amavasya
    new Date('2026-11-08T06:00:00Z'), // Diwali season
    new Date('2026-08-15T06:00:00Z'), // Monsoon Bhadrapada
    new Date('2026-03-03T06:00:00Z'), // Lunar Eclipse day
  ];

  const loc = PRESET_LOCATIONS[0]; // New Delhi

  for (const date of testDates) {
    const extracted = extractDailyPanchangData(date, loc);
    const datePayload = buildDailyFloatingPayload(extracted);
    const dateLines = datePayload.options.body.split('\n');

    assert(datePayload.title.length <= 38, `Date ${date.toISOString().slice(0, 10)} title <= 38 chars (${datePayload.title.length})`);
    assert(dateLines.length === 3, `Date ${date.toISOString().slice(0, 10)} has 3 compact lines without blanks`);
    assert(dateLines[0].length <= 50, `Date ${date.toISOString().slice(0, 10)} Line 1 <= 50 chars (${dateLines[0].length})`);
    assert(dateLines[1].length <= 55, `Date ${date.toISOString().slice(0, 10)} Line 2 <= 55 chars (${dateLines[1].length})`);
    assert(dateLines[2].length <= 50, `Date ${date.toISOString().slice(0, 10)} Line 3 <= 50 chars (${dateLines[2].length})`);
    assert(datePayload.options.body.length <= 150, `Date ${date.toISOString().slice(0, 10)} Total body <= 150 chars (${datePayload.options.body.length})`);
  }

  // ── TEST 3: VAPID Status & Safe Validation ──────────────────────────────────
  console.log('\n▸ 3. Verifying Server VAPID Configuration & Validation Helpers:');
  const vapidStatus = validateVapidSetup();
  assert(vapidStatus.valid === true, 'validateVapidSetup reports valid: true');
  assert(vapidStatus.statusCode === 200, 'validateVapidSetup status code is 200');
  const creds = getVapidCredentials();
  assert(creds !== null, 'getVapidCredentials returns active credentials');
  assert(typeof creds?.publicKey === 'string' && creds.publicKey.length > 32, 'VAPID public key is cryptographically valid length');
  assert(typeof creds?.privateKey === 'string' && creds.privateKey.length > 16, 'VAPID private key is cryptographically valid length');

  console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
  console.log('  🎉 ALL FLOATING LOCK-SCREEN NOTIFICATION BUDGETS & SPECS VERIFIED!');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
}

runAudit().catch((e) => {
  console.error(e);
  process.exit(1);
});
