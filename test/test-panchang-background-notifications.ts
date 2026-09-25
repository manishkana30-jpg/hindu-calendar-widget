/**
 * Automated Verification Suite for Panchang Background Notification System
 * 
 * Verifies:
 * 1. Strict combined notification formatting (2-3 lines, no extra text, 🔴 indicator for Panchak).
 * 2. Deduplication engine (idempotency, prevents repeat pushes for same state).
 * 3. Trigger 1: Tithi transition detection.
 * 4. Trigger 2: Inauspicious Panchak onset detection.
 * 5. Trigger 3: Daily Festival / Vrat observance detection.
 * 6. Multi-event combination: Single combined notification generated when multiple triggers fire together.
 */

import {
  evaluatePanchangNotificationTriggers,
  formatPanchangNotificationBody,
  PanchangCurrentState,
  LastNotifiedState
} from '../src/lib/notifications/state-diff';

let passed = 0;
let total = 0;

function assert(condition: boolean, message: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
  }
}

console.log('═══════════════════════════════════════════════════════════════════════════════════');
console.log('       PANCHANG BACKGROUND NOTIFICATION SYSTEM VERIFICATION SUITE                  ');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1: Strict Notification Formatting Tests (No extra text, exact 2-3 lines)
// ─────────────────────────────────────────────────────────────────────────────
console.log('▸ Test 1: Strict Notification Formatting');

// Case A: Normal day (no Panchak, no Festival/Vrat) -> Exactly 1 line
const body1 = formatPanchangNotificationBody({
  tithi: 'Shukla Navami (9)',
  panchak: { isActive: false },
  festivalOrVrat: null
});
console.log('  [Case A - Normal Day]:\n', body1.split('\n').map(l => `    | ${l}`).join('\n'));
assert(body1 === 'Tithi: Shukla Navami (9)', 'Normal day format is strictly "Tithi: <Name>" without extra lines');
assert(!body1.includes('Panchak'), 'Panchak line omitted entirely when no Panchak');
assert(!body1.includes('Festival/Vrat'), 'Festival/Vrat line omitted entirely when none today');

// Case B: Panchak Active (Inauspicious) without Festival -> Exactly 2 lines
const body2 = formatPanchangNotificationBody({
  tithi: 'Shukla Dashami (10)',
  panchak: {
    isActive: true,
    isInauspicious: true,
    type: 'Mrityu Panchak'
  },
  festivalOrVrat: null
});
console.log('\n  [Case B - Panchak Active]:\n', body2.split('\n').map(l => `    | ${l}`).join('\n'));
const lines2 = body2.split('\n');
assert(lines2.length === 2, 'Panchak active has exactly 2 lines');
assert(lines2[0] === 'Tithi: Shukla Dashami (10)', 'Line 1 is Tithi');
assert(lines2[1] === 'Panchak: 🔴 Mrityu Panchak (Inauspicious)', 'Line 2 has 🔴 indicator with inauspicious status');

// Case C: Festival observed today without Panchak -> Exactly 2 lines
const body3 = formatPanchangNotificationBody({
  tithi: 'Krishna Chaturdashi (14)',
  panchak: { isActive: false },
  festivalOrVrat: 'Maha Shivaratri'
});
console.log('\n  [Case C - Festival Day]:\n', body3.split('\n').map(l => `    | ${l}`).join('\n'));
const lines3 = body3.split('\n');
assert(lines3.length === 2, 'Festival day without Panchak has exactly 2 lines');
assert(lines3[0] === 'Tithi: Krishna Chaturdashi (14)', 'Line 1 is Tithi');
assert(lines3[1] === 'Festival/Vrat: Maha Shivaratri', 'Line 2 is Festival/Vrat');

// Case D: Triple combined occurrence (Tithi + Inauspicious Panchak + Festival/Vrat) -> Exactly 3 lines
const body4 = formatPanchangNotificationBody({
  tithi: 'Shukla Ekadashi (11)',
  panchak: {
    isActive: true,
    isInauspicious: true,
    type: 'Roga Panchak'
  },
  festivalOrVrat: 'Putrada Ekadashi'
});
console.log('\n  [Case D - Triple Combined]:\n', body4.split('\n').map(l => `    | ${l}`).join('\n'));
const lines4 = body4.split('\n');
assert(lines4.length === 3, 'Triple event has strictly 3 lines');
assert(lines4[0] === 'Tithi: Shukla Ekadashi (11)', 'Line 1 is Tithi');
assert(lines4[1] === 'Panchak: 🔴 Roga Panchak (Inauspicious)', 'Line 2 is Panchak with 🔴');
assert(lines4[2] === 'Festival/Vrat: Putrada Ekadashi', 'Line 3 is Festival/Vrat');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2: State-Diffing Trigger 1 (Tithi Transition)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Test 2: Trigger 1 - Tithi Transition');

const baseTimestamp = 1758788400000;
const lastState: LastNotifiedState = {
  tithi: 'Shukla Navami (9)',
  isPanchakActive: false,
  panchakType: null,
  festivalDate: '2026-09-24',
  festivalOrVrat: null,
  lastNotifiedAt: baseTimestamp - 3600000
};

// Current state has transitioned to Shukla Dashami (10)
const currentStateTithiChange: PanchangCurrentState = {
  tithi: 'Shukla Dashami (10)',
  panchak: { isActive: false },
  festivalOrVrat: null,
  dateStr: '2026-09-24',
  timestamp: baseTimestamp
};

const diffResult1 = evaluatePanchangNotificationTriggers(currentStateTithiChange, lastState);
assert(diffResult1.shouldNotify === true, 'shouldNotify is true on Tithi transition');
assert(diffResult1.triggers.tithiChanged === true, 'Trigger tithiChanged flagged as true');
assert(diffResult1.triggers.panchakStarting === false, 'panchakStarting is false');
assert(diffResult1.triggers.festivalTriggered === false, 'festivalTriggered is false');
assert(diffResult1.payload?.title === 'Panchang Update', 'Payload title is "Panchang Update"');
assert(diffResult1.payload?.body === 'Tithi: Shukla Dashami (10)', 'Payload body matches strict format');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3: State-Diffing Trigger 2 (Inauspicious Panchak Commences)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Test 3: Trigger 2 - Panchak Commences');

const lastStatePanchakOff: LastNotifiedState = {
  tithi: 'Shukla Dashami (10)',
  isPanchakActive: false,
  panchakType: null,
  festivalDate: '2026-09-24',
  festivalOrVrat: null,
  lastNotifiedAt: baseTimestamp
};

// Current state enters Mrityu Panchak while Tithi remains unchanged
const currentStatePanchakOn: PanchangCurrentState = {
  tithi: 'Shukla Dashami (10)',
  panchak: {
    isActive: true,
    isInauspicious: true,
    type: 'Mrityu Panchak'
  },
  festivalOrVrat: null,
  dateStr: '2026-09-24',
  timestamp: baseTimestamp + 1800000
};

const diffResult2 = evaluatePanchangNotificationTriggers(currentStatePanchakOn, lastStatePanchakOff);
assert(diffResult2.shouldNotify === true, 'shouldNotify is true on Panchak onset');
assert(diffResult2.triggers.panchakStarting === true, 'Trigger panchakStarting flagged as true');
assert(diffResult2.triggers.tithiChanged === false, 'tithiChanged is false since Tithi was already Shukla Dashami');
assert(Boolean(diffResult2.payload?.body.includes('Panchak: 🔴 Mrityu Panchak (Inauspicious)')), 'Body includes 🔴 Panchak status');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 4: State-Diffing Trigger 3 (Daily Festival / Vrat Observance)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Test 4: Trigger 3 - Festival/Vrat for New Date');

const lastStateYesterday: LastNotifiedState = {
  tithi: 'Shukla Dashami (10)',
  isPanchakActive: false,
  panchakType: null,
  festivalDate: '2026-09-24',
  festivalOrVrat: null,
  lastNotifiedAt: baseTimestamp
};

// Next day arrives with Putrada Ekadashi
const currentStateFestival: PanchangCurrentState = {
  tithi: 'Shukla Dashami (10)', // Same tithi momentarily
  panchak: { isActive: false },
  festivalOrVrat: 'Vijayadashami',
  dateStr: '2026-09-25', // New date!
  timestamp: baseTimestamp + 86400000
};

const diffResult3 = evaluatePanchangNotificationTriggers(currentStateFestival, lastStateYesterday);
assert(diffResult3.shouldNotify === true, 'shouldNotify is true for new date with festival');
assert(diffResult3.triggers.festivalTriggered === true, 'Trigger festivalTriggered flagged as true');
assert(Boolean(diffResult3.payload?.body.includes('Festival/Vrat: Vijayadashami')), 'Festival included in body');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 5: Single Combined Notification When Multiple Triggers Fire Together
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Test 5: Single Combined Notification (Multi-Trigger)');

const lastStateOld: LastNotifiedState = {
  tithi: 'Shukla Dashami (10)',
  isPanchakActive: false,
  panchakType: null,
  festivalDate: '2026-09-24',
  festivalOrVrat: null,
  lastNotifiedAt: baseTimestamp
};

// All 3 conditions occur simultaneously:
// 1. Tithi changed: Shukla Ekadashi (11)
// 2. Inauspicious Panchak starts: Agni Panchak
// 3. Sacred Festival/Vrat observed today: Putrada Ekadashi
const currentStateTriple: PanchangCurrentState = {
  tithi: 'Shukla Ekadashi (11)',
  panchak: {
    isActive: true,
    isInauspicious: true,
    type: 'Agni Panchak'
  },
  festivalOrVrat: 'Putrada Ekadashi',
  dateStr: '2026-09-25',
  timestamp: baseTimestamp + 86400000
};

const diffResultMulti = evaluatePanchangNotificationTriggers(currentStateTriple, lastStateOld);
assert(diffResultMulti.shouldNotify === true, 'shouldNotify is true when multiple triggers fire');
assert(diffResultMulti.triggers.tithiChanged === true, 'tithiChanged is true');
assert(diffResultMulti.triggers.panchakStarting === true, 'panchakStarting is true');
assert(diffResultMulti.triggers.festivalTriggered === true, 'festivalTriggered is true');
assert(diffResultMulti.payload?.title === 'Panchang Update', 'Single combined title is "Panchang Update"');
const multiLines = diffResultMulti.payload?.body.split('\n') || [];
assert(multiLines.length === 3, 'Combined notification contains exactly 3 lines');
assert(multiLines[0] === 'Tithi: Shukla Ekadashi (11)', 'Combined Line 1: Tithi');
assert(multiLines[1] === 'Panchak: 🔴 Agni Panchak (Inauspicious)', 'Combined Line 2: Panchak');
assert(multiLines[2] === 'Festival/Vrat: Putrada Ekadashi', 'Combined Line 3: Festival/Vrat');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 6: Deduplication & Idempotency (Repeat Checks Must Not Re-alert)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Test 6: Deduplication & Idempotency');

// Save nextNotifiedState from the previous alert
const stateSavedAfterAlert = diffResultMulti.nextNotifiedState;

// Check again 15 minutes later under the same running state
const sameStateCheck: PanchangCurrentState = {
  ...currentStateTriple,
  timestamp: currentStateTriple.timestamp + 15 * 60 * 1000 // 15 mins later
};

const duplicateCheckResult = evaluatePanchangNotificationTriggers(sameStateCheck, stateSavedAfterAlert);
assert(duplicateCheckResult.shouldNotify === false, 'Duplicate check returns shouldNotify = false');
assert(duplicateCheckResult.payload === null, 'No notification payload generated for duplicate state');
assert(duplicateCheckResult.triggers.tithiChanged === false, 'tithiChanged is false');
assert(duplicateCheckResult.triggers.panchakStarting === false, 'panchakStarting is false');
assert(duplicateCheckResult.triggers.festivalTriggered === false, 'festivalTriggered is false');

console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
if (passed === total) {
  console.log('  🎉 ALL PANCHANG BACKGROUND NOTIFICATION REQUIREMENTS VERIFIED!');
}
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

if (passed !== total) {
  process.exit(1);
}
