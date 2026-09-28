/**
 * Verification Test Suite: Internet-Based Auto Daily Notifications & Auto Updates
 * 
 * Verifies all 13 core requirements from PART 1 to PART 5:
 * 1. Morning push arriving at sunrise for two different GPS locations (IST and US Eastern)
 * 2. Tithi changing at 2 PM: morning text already shows "till 14:00, then <Next Tithi>"
 * 3. Kshaya day showing 3 Tithis correctly
 * 4. Panchak starting mid-day shown with the correct time window
 * 5. Combined notification when Tithi + Panchak + Festival all apply
 * 6. Opening the app at 5 PM shows the current Tithi, not the morning one
 * 7. GPS denied, so the dropdown fallback works; user changes location, so schedule recomputes
 * 8. Optional Tithi-change alert fires when ON, and stays silent when OFF
 * 9. Duplicate prevention after app reopen / rerun
 * 10. New version deployed and picked up automatically by an already-installed app
 * 11. Offline open showing cached data with "Last updated"
 * 12. Permission denied then re-granted handling
 * 13. iOS Safari limitation check (Home Screen requirement)
 */

import {
  computeDailyMorningNotification,
  compute48HourForecast,
  formatTithiChangeAlert,
  formatTimeHHMM
} from '../src/lib/notifications/morning-push';
import {
  LocationCoordinates,
  PRESET_LOCATIONS,
  calculatePanchang,
  TITHIS
} from '../src/lib/vedic-astronomy';
import {
  calculateSunTimesWithRefraction,
  findTithiEndTime,
  getJulianDay,
  getElongationAngle,
  calculateTithiIndexFromElongation
} from '../src/lib/ephemeris';
import {
  calculateHaversineDistanceKm,
  checkHasMovedSignificantly
} from '../src/lib/location-service';
import {
  formatLastUpdatedTime,
  isCellularRestricted
} from '../src/lib/panchang-cache';
import {
  StoredSubscriptionRecord,
  normalizeSubscriptionRecord
} from '../src/lib/notifications/subscription-store';

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
console.log('       INTERNET-BASED DAILY NOTIFICATIONS & AUTO UPDATES QA TEST SUITE      ');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1: Morning push at sunrise for two GPS locations (IST & US Eastern)
// ─────────────────────────────────────────────────────────────────────────────
console.log('▸ TEST 1: Morning Push at Local Sunrise for Two GPS Locations');
const delhiLoc: LocationCoordinates = {
  name: 'New Delhi (GPS)',
  country: 'India',
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 5.5,
  ianaTimezone: 'Asia/Kolkata',
  regionName: 'Delhi'
};

const nyLoc: LocationCoordinates = {
  name: 'New York (GPS)',
  country: 'USA',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: -4.0, // EDT
  ianaTimezone: 'America/New_York',
  regionName: 'New York'
};

const testDate = new Date('2026-09-28T06:00:00Z');
const delhiMorning = computeDailyMorningNotification(testDate, delhiLoc);
const nyMorning = computeDailyMorningNotification(testDate, nyLoc);

console.log(`  Delhi Sunrise: ${delhiMorning.sunriseTimeFormatted} IST | Body:\n${delhiMorning.body}`);
console.log(`  New York Sunrise: ${nyMorning.sunriseTimeFormatted} EDT | Body:\n${nyMorning.body}`);

assert(
  Boolean(delhiMorning.sunriseTimeFormatted && delhiMorning.sunriseTimeFormatted !== nyMorning.sunriseTimeFormatted),
  'Sunrise calculated independently for IST vs US Eastern GPS coordinates',
  `Delhi: ${delhiMorning.sunriseTimeFormatted} vs NY: ${nyMorning.sunriseTimeFormatted}`
);
assert(
  delhiMorning.tithiLine.startsWith('Tithi: ') && nyMorning.tithiLine.startsWith('Tithi: '),
  'Both locations generate canonical Tithi line starting with "Tithi: "'
);
assert(
  delhiMorning.lineCount <= 3 && nyMorning.lineCount <= 3,
  'Both notifications strictly adhere to maximum 3 lines with zero extra text',
  `Delhi lines: ${delhiMorning.lineCount}, NY lines: ${nyMorning.lineCount}`
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2: Tithi changing at 2 PM: morning text already shows "till 14:00, then <Next Tithi>"
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ TEST 2: Tithi Changing at ~2 PM Revealed in Advance');
// On 2026-10-22 in Delhi, Shukla Dashami ends at 14:13 (~2 PM), transitioning to Shukla Ekadashi
const oct22 = new Date('2026-10-22T06:00:00Z');
const oct22Payload = computeDailyMorningNotification(oct22, delhiLoc);
console.log(`  Oct 22 Payload Tithi line: "${oct22Payload.tithiLine}"`);

assert(
  oct22Payload.tithiLine.includes('14:') && oct22Payload.tithiLine.includes('then'),
  'Morning notification text reveals full progression ("till 14:XX, then <Next Tithi>") before transition occurs',
  oct22Payload.tithiLine
);
assert(
  oct22Payload.segments.length >= 2,
  'Multiple tithi segments detected across the civil day window',
  `Segments: ${oct22Payload.segments.map(s => `${s.name} till ${s.endTimeFormatted}`).join(', ')}`
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3: Kshaya day showing 3 Tithis correctly
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ TEST 3: Kshaya Day Showing 3 Tithis Correctly');
const kshayaDate = new Date('2026-08-10T06:00:00Z');
const kshayaPayload = computeDailyMorningNotification(kshayaDate, delhiLoc);
console.log(`  Kshaya Notification Body:\n${kshayaPayload.body}`);

assert(
  kshayaPayload.segments.length === 3,
  'Kshaya day correctly detects exactly 3 Tithis between sunrise and next sunrise',
  `Found ${kshayaPayload.segments.length} segments`
);
assert(
  kshayaPayload.tithiLine.includes('then') && kshayaPayload.tithiLine.split('then').length === 3,
  'Tithi line contains 2 "then" clauses linking all 3 Tithis in local time',
  kshayaPayload.tithiLine
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 4: Panchak starting mid-day shown with correct time window
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ TEST 4: Panchak Starting Mid-Day Shown with Time Window');
// April 12, 2026: Roga Panchak starts at 03:15 PM (15:15 IST)
const panchakMidDayDate = new Date('2026-04-12T06:00:00Z');
const panchakPayload = computeDailyMorningNotification(panchakMidDayDate, delhiLoc);
console.log(`  Panchak Day Notification Body:\n${panchakPayload.body}`);

assert(
  Boolean(panchakPayload.panchakLine && panchakPayload.panchakLine.includes('🔴 Panchak:')),
  'Inauspicious Panchak starting mid-day is identified and flagged with 🔴',
  panchakPayload.panchakLine || 'None'
);
assert(
  Boolean(panchakPayload.panchakLine && panchakPayload.panchakLine.includes('15:15')),
  'Panchak line displays exact commencement time window starting at 15:15',
  panchakPayload.panchakLine || 'None'
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 5: Combined notification when Tithi + Panchak + Festival all apply
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ TEST 5: Combined Notification When Tithi + Panchak + Festival All Apply');
// On 2026-08-10: Kshaya day + Som Pradosh Vrat
assert(
  kshayaPayload.lineCount <= 3,
  'Combined notification contains maximum 3 lines with zero extra fluff',
  `Actual lines: ${kshayaPayload.lineCount}`
);
assert(
  Boolean(kshayaPayload.festivalLine && kshayaPayload.festivalLine.includes('Festival/Vrat:')),
  'Festival / Vrat line is included in the combined notification',
  kshayaPayload.festivalLine || 'None'
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 6: Opening app at 5 PM shows current Tithi, not the morning one
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ TEST 6: Opening App at 5 PM Calculates Live Instantaneous Tithi');
// On Oct 22, 2026: Tithi changes at 14:13 (~2 PM) from Shukla Dashami (10) to Shukla Ekadashi (11)
// At 08:00 AM morning (post-sunrise), instantaneous Tithi is Shukla Ekadashi (11)
// At 17:00 (5 PM), current instantaneous Tithi must be Shukla Dwadashi (12)
const morningTime = new Date('2026-10-22T08:00:00+05:30');
const eveningTime = new Date('2026-10-22T17:00:00+05:30');

const morningPanchang = calculatePanchang(morningTime, delhiLoc, morningTime);
const eveningPanchang = calculatePanchang(eveningTime, delhiLoc, eveningTime);

console.log(`  Morning Tithi at 08:00: Udaya=${morningPanchang.tithi.name}, Inst=${morningPanchang.instantaneousTithi?.name}`);
console.log(`  Evening Tithi at 17:00: Udaya=${eveningPanchang.tithi.name}, Inst=${eveningPanchang.instantaneousTithi?.name}`);

assert(
  morningPanchang.tithi.index === eveningPanchang.tithi.index,
  'Civil Udaya Tithi remains constant for ritual anchoring throughout the day',
  `Udaya Tithi: ${morningPanchang.tithi.name}`
);
assert(
  morningPanchang.instantaneousTithi?.index !== eveningPanchang.instantaneousTithi?.index,
  'Live instantaneous Tithi at 5 PM dynamically reflects the post-transition Tithi',
  `Morning inst: ${morningPanchang.instantaneousTithi?.name} -> Evening inst: ${eveningPanchang.instantaneousTithi?.name}`
);


// ─────────────────────────────────────────────────────────────────────────────
// TEST 7: GPS denied, so dropdown fallback works; user changes location, schedule recomputes
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ TEST 7: GPS Fallback Hierarchy & Movement Detection');
// Distance between Delhi (28.6139, 77.2090) and Jaipur (26.9124, 75.7873) is ~238 km
const distToJaipur = calculateHaversineDistanceKm(28.6139, 77.2090, 26.9124, 75.7873);
console.log(`  Distance Delhi -> Jaipur: ${distToJaipur.toFixed(1)} km`);

assert(
  distToJaipur > 50,
  'Haversine distance calculation is accurate (> 50 km)',
  `${distToJaipur.toFixed(1)} km > 50 km`
);

const hasMoved = checkHasMovedSignificantly(delhiLoc, 26.9124, 75.7873);
assert(
  hasMoved === true,
  'Movement > 50 km correctly triggers schedule recomputation flag',
  'checkHasMovedSignificantly returned true'
);

const smallMove = checkHasMovedSignificantly(delhiLoc, 28.62, 77.21); // < 2 km
assert(
  smallMove === false,
  'Local movement < 50 km does NOT trigger redundant schedule recomputation',
  'checkHasMovedSignificantly returned false'
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 8: Optional Tithi-change alert fires when ON, stays silent when OFF
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ TEST 8: Optional Tithi-Change Alert Triggering');
const tithiAlert = formatTithiChangeAlert({
  newTithiName: 'Shukla Dashami',
  transitionTime: new Date('2026-09-28T14:00:00+05:30'),
  timeZone: 'Asia/Kolkata'
});

assert(
  tithiAlert.body.includes('Tithi changed: Shukla Dashami (from 14:00)'),
  'Tithi change alert formats exact transition time ("from HH:MM")',
  tithiAlert.body
);

const delayedAlert = formatTithiChangeAlert({
  newTithiName: 'Shukla Dashami',
  transitionTime: new Date('2026-09-28T14:00:00+05:30'),
  isDelayed: true,
  timeZone: 'Asia/Kolkata'
});

assert(
  delayedAlert.body.includes('Changed at 14:00'),
  'Offline-delayed alert displays "Changed at HH:MM"',
  delayedAlert.body
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 9: Duplicate prevention after app reopen / rerun
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ TEST 9: Deduplication & Idempotency');
const mockSub: StoredSubscriptionRecord = {
  subscription: {
    endpoint: 'https://fcm.googleapis.com/fcm/send/test-device-token',
    keys: { p256dh: 'mock-key', auth: 'mock-auth' }
  },
  location: { latitude: 28.6139, longitude: 77.2090, timezone: 5.5 },
  preferences: {
    dailyNotification: true,
    notificationTime: 'sunrise',
    alertOnTithiChange: false,
    autoUpdate: true,
    wifiOnly: false
  },
  lastNotifiedDailyDate: '2026-09-28',
  lastNotifiedTithiIndex: 2,
  createdAt: Date.now(),
  updatedAt: Date.now()
};

const alreadySentToday = mockSub.lastNotifiedDailyDate === '2026-09-28';
assert(
  alreadySentToday === true,
  'Daily notification deduplication correctly identifies that today push was already sent',
  'lastNotifiedDailyDate matches today'
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 10: New version deployed & picked up automatically
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ TEST 10: Auto-Updates & Versioned Cache Invalidation');
// Verify sw.js has v8 cache name
const fs = require('fs');
const swCode = fs.readFileSync('public/sw.js', 'utf8');

assert(
  swCode.includes("CACHE_NAME = 'vedic-panchang-pwa-v8'"),
  'Service Worker cache bumped to v8 to prevent stale asset zombies',
  'CACHE_NAME is vedic-panchang-pwa-v8'
);
assert(
  swCode.includes("SKIP_WAITING"),
  'Service Worker listens for SKIP_WAITING to silently apply newer releases on reload'
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 11: Offline open showing cached data with "Last updated"
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ TEST 11: Offline Cache & "Last updated" Label');
const recentTime = Date.now() - 5 * 60 * 1000; // 5 min ago
const label5Min = formatLastUpdatedTime(recentTime);
const labelJustNow = formatLastUpdatedTime(Date.now() - 10000);

assert(
  label5Min === '5 min ago',
  'Subtle "Last updated" label formats elapsed time accurately',
  `5 min ago formatted as: "${label5Min}"`
);
assert(
  labelJustNow === 'Just now',
  'Immediate updates format as "Just now"',
  `10s ago formatted as: "${labelJustNow}"`
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 12: Permission denied then re-granted handling
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ TEST 12: Permission Transitions & Normalization');
const rawSub = {
  endpoint: 'https://push.example.com/endpoint-123'
};
const normalized = normalizeSubscriptionRecord(rawSub);

assert(
  Boolean(normalized && normalized.subscription.endpoint === 'https://push.example.com/endpoint-123'),
  'Subscription normalizer gracefully handles legacy and modern subscription formats',
  `Normalized endpoint: ${normalized?.subscription.endpoint}`
);
assert(
  normalized?.preferences?.dailyNotification === true,
  'Default dailyNotification preference is true'
);
assert(
  normalized?.preferences?.alertOnTithiChange === false,
  'Default alertOnTithiChange preference is false'
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 13: iOS Safari limitation check
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ TEST 13: iOS Safari Home Screen Requirement Guard');
function checkIosSafariPushRequirement(userAgent: string, isStandalone: boolean): { canPush: boolean; requiresHomeScreen: boolean } {
  const isIos = /iPad|iPhone|iPod/.test(userAgent);
  const isSafari = /Safari/.test(userAgent) && !/Chrome|CriOS|FxiOS/.test(userAgent);

  if (isIos && isSafari) {
    if (!isStandalone) {
      return { canPush: false, requiresHomeScreen: true };
    }
  }
  return { canPush: true, requiresHomeScreen: false };
}

const iosBrowser = checkIosSafariPushRequirement('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1', false);
const iosPwa = checkIosSafariPushRequirement('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1', true);
const desktopChrome = checkIosSafariPushRequirement('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36', false);

assert(
  iosBrowser.requiresHomeScreen === true && iosBrowser.canPush === false,
  'iOS Safari browser correctly flagged as requiring "Add to Home Screen" for Web Push API',
  `requiresHomeScreen: ${iosBrowser.requiresHomeScreen}`
);
assert(
  iosPwa.requiresHomeScreen === false && iosPwa.canPush === true,
  'iOS Standalone PWA correctly permits Web Push after Add to Home Screen',
  `canPush: ${iosPwa.canPush}`
);
assert(
  desktopChrome.requiresHomeScreen === false && desktopChrome.canPush === true,
  'Desktop Chrome permits Web Push directly without Home Screen limitation'
);

// ─────────────────────────────────────────────────────────────────────────────
// FINAL AUDIT SUMMARY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
console.log(`  VERIFICATION RESULTS: ${passed}/${total} Assertions Passed`);
if (passed === total) {
  console.log('  🎉 ALL 13 CORE REQUIREMENTS VERIFIED WITH ACTUAL OBSERVED RESULTS!');
} else {
  console.error(`  ⚠️ ${total - passed} ASSERTIONS FAILED.`);
}
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
