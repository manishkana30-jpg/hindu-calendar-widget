/**
 * Automated Verification Suite for Panchang Background Notification System
 * 
 * Verifies:
 * 1. Option B Inline Horizontal Glanceable formatting:
 *    Tithi: <Name> [ • 🔴 Panchak: <Type>] [ • Festival: <Name>]
 * 2. Auspicious Panchak Filtering (Dharmashastra compliance):
 *    - Nirdosha Panchak (Wed/Thu) is auspicious/benign -> Strictly EXCLUDED.
 *    - Raja / Nripa Panchak (Mon) is auspicious -> Strictly EXCLUDED.
 *    - Inauspicious Panchaks (Mrityu, Agni, Chora, Roga) -> INCLUDED with 🔴.
 * 3. Major Observances Filtering:
 *    - Primary focus remains on Tithi.
 *    - Only major festivals and premier fasts (Ekadashi) are alerted.
 * 4. Deduplication & Idempotency:
 *    - Zero duplicate pushes for same state.
 * 5. Multi-trigger single combined notification.
 */

import {
  evaluatePanchangNotificationTriggers,
  formatPanchangNotificationBody,
  isPanchakTrulyInauspicious,
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
console.log('    OPTION B & DHARMASHASTRA AUSPICIOUSNESS NOTIFICATION VERIFICATION SUITE       ');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1: Panchak Auspiciousness Filter Verification
// ─────────────────────────────────────────────────────────────────────────────
console.log('▸ Test 1: Panchak Auspiciousness Classification');

assert(
  isPanchakTrulyInauspicious({ isActive: true, type: 'Nirdosha Panchak', isInauspicious: false }) === false,
  'Nirdosha Panchak is recognized as auspicious/benign -> excluded from warnings'
);

assert(
  isPanchakTrulyInauspicious({ isActive: true, type: 'Raja Panchak', isInauspicious: false }) === false,
  'Raja Panchak is recognized as auspicious -> excluded from warnings'
);

assert(
  isPanchakTrulyInauspicious({ isActive: true, type: 'Raj Panchak', statusText: 'Raj Panchak (Auspicious)' }) === false,
  'Raj Panchak variation is excluded'
);

assert(
  isPanchakTrulyInauspicious({ isActive: true, type: 'Mrityu Panchak', isInauspicious: true }) === true,
  'Mrityu Panchak is recognized as strictly inauspicious -> alerted'
);

assert(
  isPanchakTrulyInauspicious({ isActive: true, type: 'Agni Panchak', isInauspicious: true }) === true,
  'Agni Panchak is recognized as inauspicious -> alerted'
);

assert(
  isPanchakTrulyInauspicious({ isActive: true, type: 'Chora Panchak', isInauspicious: true }) === true,
  'Chora Panchak is recognized as inauspicious -> alerted'
);

assert(
  isPanchakTrulyInauspicious({ isActive: true, type: 'Roga Panchak', isInauspicious: true }) === true,
  'Roga Panchak is recognized as inauspicious -> alerted'
);

assert(
  isPanchakTrulyInauspicious({ isActive: false }) === false,
  'Inactive Panchak returns false'
);

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2: Option B Single-Line Inline Formatting Tests
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Test 2: Option B Single-Line Inline Formatting (Mobile Glanceable)');

// Case A: Normal day (no Panchak, no festival)
const bodyA = formatPanchangNotificationBody({
  tithi: 'Shukla Navami (9)',
  panchak: { isActive: false },
  festivalOrVrat: null
});
console.log(`  [Case A - Normal Day]: "${bodyA}"`);
assert(bodyA === 'Tithi: Shukla Navami (9)', 'Normal day format is strictly "Tithi: <Name>" without separators');

// Case B: Active Nirdosh Panchak (Auspicious) -> MUST OMIT PANCHAK!
const bodyB_Nirdosh = formatPanchangNotificationBody({
  tithi: 'Shukla Chaturdashi (14)',
  panchak: {
    isActive: true,
    type: 'Nirdosha Panchak',
    isInauspicious: false,
    statusText: 'Nirdosha Panchak (Auspicious)'
  },
  festivalOrVrat: 'Anant Chaturdashi'
});
console.log(`  [Case B - Nirdosh Panchak Day]: "${bodyB_Nirdosh}"`);
assert(
  bodyB_Nirdosh === 'Tithi: Shukla Chaturdashi (14) • Festival: Anant Chaturdashi',
  'Nirdosha Panchak is omitted from body; only Tithi & Festival shown'
);
assert(!bodyB_Nirdosh.includes('Panchak'), 'Panchak is completely absent when Nirdosha');

// Case C: Active Raja Panchak (Auspicious) -> MUST OMIT PANCHAK!
const bodyC_Raja = formatPanchangNotificationBody({
  tithi: 'Shukla Pratipada (1)',
  panchak: {
    isActive: true,
    type: 'Raja Panchak',
    isInauspicious: false
  },
  festivalOrVrat: null
});
console.log(`  [Case C - Raja Panchak Day]: "${bodyC_Raja}"`);
assert(bodyC_Raja === 'Tithi: Shukla Pratipada (1)', 'Raja Panchak is omitted from body');

// Case D: Inauspicious Mrityu Panchak (without festival) -> Option B inline bullet
const bodyD_Mrityu = formatPanchangNotificationBody({
  tithi: 'Shukla Dashami (10)',
  panchak: {
    isActive: true,
    type: 'Mrityu Panchak',
    isInauspicious: true
  },
  festivalOrVrat: null
});
console.log(`  [Case D - Mrityu Panchak]: "${bodyD_Mrityu}"`);
assert(
  bodyD_Mrityu === 'Tithi: Shukla Dashami (10) • 🔴 Panchak: Mrityu Panchak',
  'Mrityu Panchak is formatted inline with • and 🔴 indicator'
);

// Case E: Triple combined (Tithi + Inauspicious Agni Panchak + Major Festival)
const bodyE_Triple = formatPanchangNotificationBody({
  tithi: 'Shukla Ekadashi (11)',
  panchak: {
    isActive: true,
    type: 'Agni Panchak',
    isInauspicious: true
  },
  festivalOrVrat: 'Putrada Ekadashi'
});
console.log(`  [Case E - Triple Combined]: "${bodyE_Triple}"`);
assert(
  bodyE_Triple === 'Tithi: Shukla Ekadashi (11) • 🔴 Panchak: Agni Panchak • Festival: Putrada Ekadashi',
  'Triple event uses Option B single-line bullet separators without newlines'
);
assert(!bodyE_Triple.includes('\n'), 'No newlines in Option B notification body to avoid mobile lock-screen truncation');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3: State-Diffing Engine with Auspiciousness Filter
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Test 3: State-Diffing Trigger Behavior');

const baseTimestamp = 1758788400000;

// Subtest 3.1: Nirdosha Panchak starts -> SHOULD NOT NOTIFY!
const lastStateNoPanchak: LastNotifiedState = {
  tithi: 'Shukla Chaturdashi (14)',
  isPanchakActive: false,
  panchakType: null,
  festivalDate: '2026-09-25',
  festivalOrVrat: 'Anant Chaturdashi',
  lastNotifiedAt: baseTimestamp
};

const currentStateNirdosh: PanchangCurrentState = {
  tithi: 'Shukla Chaturdashi (14)', // same tithi
  panchak: {
    isActive: true,
    type: 'Nirdosha Panchak',
    isInauspicious: false
  },
  festivalOrVrat: 'Anant Chaturdashi', // same festival
  dateStr: '2026-09-25',
  timestamp: baseTimestamp + 3600000
};

const diffNirdosh = evaluatePanchangNotificationTriggers(currentStateNirdosh, lastStateNoPanchak);
assert(diffNirdosh.shouldNotify === false, 'Nirdosha Panchak onset does NOT trigger notification alert');
assert(diffNirdosh.triggers.panchakStarting === false, 'panchakStarting is false for benign Panchak');

// Subtest 3.2: Inauspicious Mrityu Panchak starts -> SHOULD NOTIFY!
const currentStateMrityu: PanchangCurrentState = {
  tithi: 'Shukla Chaturdashi (14)',
  panchak: {
    isActive: true,
    type: 'Mrityu Panchak',
    isInauspicious: true
  },
  festivalOrVrat: 'Anant Chaturdashi',
  dateStr: '2026-09-25',
  timestamp: baseTimestamp + 3600000
};

const diffMrityu = evaluatePanchangNotificationTriggers(currentStateMrityu, lastStateNoPanchak);
assert(diffMrityu.shouldNotify === true, 'Mrityu Panchak onset DOES trigger notification alert');
assert(diffMrityu.triggers.panchakStarting === true, 'panchakStarting is true for inauspicious Panchak');
assert(
  diffMrityu.payload?.body === 'Tithi: Shukla Chaturdashi (14) • 🔴 Panchak: Mrityu Panchak • Festival: Anant Chaturdashi',
  'Payload body adheres to Option B inline format'
);

// Subtest 3.3: Tithi transition occurs -> SHOULD NOTIFY (Primary Focus)
const currentStateTithiChange: PanchangCurrentState = {
  tithi: 'Purnima (15)', // Changed!
  panchak: {
    isActive: true,
    type: 'Nirdosha Panchak',
    isInauspicious: false // Auspicious
  },
  festivalOrVrat: null,
  dateStr: '2026-09-25',
  timestamp: baseTimestamp + 7200000
};

const diffTithi = evaluatePanchangNotificationTriggers(currentStateTithiChange, lastStateNoPanchak);
assert(diffTithi.shouldNotify === true, 'Tithi transition triggers notification alert');
assert(diffTithi.triggers.tithiChanged === true, 'tithiChanged is true');
assert(diffTithi.payload?.body === 'Tithi: Purnima (15)', 'Panchak omitted since Nirdosh, body has Tithi prominently');

// ─────────────────────────────────────────────────────────────────────────────
// TEST 4: Deduplication & Idempotency
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Test 4: Deduplication & Idempotency');

const savedState = diffMrityu.nextNotifiedState;
const duplicateState: PanchangCurrentState = {
  ...currentStateMrityu,
  timestamp: currentStateMrityu.timestamp + 15 * 60 * 1000 // 15 mins later
};

const diffDuplicate = evaluatePanchangNotificationTriggers(duplicateState, savedState);
assert(diffDuplicate.shouldNotify === false, 'Duplicate check returns shouldNotify = false');
assert(diffDuplicate.payload === null, 'No duplicate payload dispatched');

console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
if (passed === total) {
  console.log('  🎉 ALL OPTION B & AUSPICIOUSNESS FILTER REQUIREMENTS VERIFIED!');
}
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

if (passed !== total) {
  process.exit(1);
}
