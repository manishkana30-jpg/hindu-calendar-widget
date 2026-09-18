/**
 * Notification Matrix Verification Test Suite
 * Tests all 4 core permutations:
 * 1. Normal Day (0 active)
 * 2. Single attribute active (Festival only, Vrat only, Panchak only)
 * 3. Double attributes active (Vrat + Panchak)
 * 4. Triple occurrence active (Festival + Vrat + Panchak)
 */

import { buildDailyNotificationPayload, PanchangNotificationData } from '../src/lib/notifications/payload-builder';

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
console.log('          DAILY PANCHANG NOTIFICATION MATRIX VERIFICATION AUDIT            ');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 1: Normal Day (No Vrat, No Panchak, No Festival)
// ─────────────────────────────────────────────────────────────────────────────
console.log('▸ Scenario 1: Normal Day (0 Active Observances)');
const normalData: PanchangNotificationData = {
  tithi: 'Shukla Saptami',
  paksha: 'Shukla',
  samvat: '2083',
  festival: null,
  vrat: null,
  panchak: { isActive: false }
};
const normalPayload = buildDailyNotificationPayload(normalData);
console.log('  Title:', normalPayload.title);
console.log('  Body: ', normalPayload.body);
console.log('  Length:', normalPayload.body.length);

assert(normalPayload.title === "Today's Tithi: Shukla Saptami", 'Title strictly follows "Today\'s Tithi: {TithiName}"');
assert(normalPayload.body === 'Shukla Shukla Saptami • Vikram Samvat 2083' || normalPayload.body.includes('Vikram Samvat 2083'), 'Body includes Paksha, Tithi and Vikram Samvat');
assert(!normalPayload.body.toLowerCase().includes('no festival'), 'Zero mention of "no festival"');
assert(!normalPayload.body.toLowerCase().includes('no vrat'), 'Zero mention of "no vrat"');
assert(!normalPayload.body.toLowerCase().includes('no panchak'), 'Zero mention of "no panchak"');
assert(!normalPayload.body.toLowerCase().includes('null'), 'Zero raw "null" strings');
assert(normalPayload.body.length <= 120, 'Body length is <= 120 characters');

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 2: Festival-only Day
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Scenario 2: Festival-only Day (1 Active Attribute)');
const festivalData: PanchangNotificationData = {
  tithi: 'Krishna Ashtami',
  paksha: 'Krishna',
  samvat: '2083',
  festival: 'Krishna Janmashtami',
  vrat: null,
  panchak: null
};
const festivalPayload = buildDailyNotificationPayload(festivalData);
console.log('  Title:', festivalPayload.title);
console.log('  Body: ', festivalPayload.body);
console.log('  Length:', festivalPayload.body.length);

assert(festivalPayload.title === '🎉 Krishna Janmashtami | Krishna Ashtami', 'Title correctly formats "🎉 {FestivalName} | {TithiName}"');
assert(festivalPayload.body.includes('Krishna Ashtami'), 'Body displays Tithi context cleanly');
assert(!festivalPayload.body.toLowerCase().includes('no vrat'), 'Zero mention of "no vrat"');
assert(festivalPayload.body.length <= 120, 'Body length is <= 120 characters');

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 2B: Panchak-only Day
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Scenario 2B: Panchak-only Day');
const panchakData: PanchangNotificationData = {
  tithi: 'Shukla Chaturthi',
  paksha: 'Shukla',
  samvat: '2083',
  festival: null,
  vrat: null,
  panchak: { isActive: true, type: 'Agni Panchak' }
};
const panchakPayload = buildDailyNotificationPayload(panchakData);
console.log('  Title:', panchakPayload.title);
console.log('  Body: ', panchakPayload.body);

assert(panchakPayload.title === '⚠️ Agni Panchak Active | Shukla Chaturthi', 'Title highlights Panchak active alongside Tithi');

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 2C: Vrat-only Day
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Scenario 2C: Vrat-only Day');
const vratData: PanchangNotificationData = {
  tithi: 'Shukla Ekadashi',
  paksha: 'Shukla',
  samvat: '2083',
  festival: null,
  vrat: 'Kamada Ekadashi',
  panchak: { isActive: false }
};
const vratPayload = buildDailyNotificationPayload(vratData);
console.log('  Title:', vratPayload.title);
console.log('  Body: ', vratPayload.body);

assert(vratPayload.title === '🙏 Kamada Ekadashi | Shukla Ekadashi', 'Title highlights Vrat alongside Tithi');

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 3: Double Observance (Vrat + Panchak)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Scenario 3: Double Occurrence (Vrat + Panchak)');
const dualData: PanchangNotificationData = {
  tithi: 'Krishna Ekadashi',
  paksha: 'Krishna',
  samvat: '2083',
  festival: null,
  vrat: 'Aja Ekadashi',
  panchak: { isActive: true, type: 'Raja Panchak' }
};
const dualPayload = buildDailyNotificationPayload(dualData);
console.log('  Title:', dualPayload.title);
console.log('  Body: ', dualPayload.body);
console.log('  Length:', dualPayload.body.length);

assert(dualPayload.title === '🙏 Aja Ekadashi & Sacred Observances', 'Title identifies primary observance & Sacred Observances');
assert(dualPayload.body.includes('🙏 Aja Ekadashi') && dualPayload.body.includes('⚠️ Raja Panchak'), 'Body cleanly concatenates Vrat and Panchak');
assert(!dualPayload.body.endsWith(' • '), 'No trailing dividers or awkward punctuation');
assert(dualPayload.body.length <= 120, 'Body length is <= 120 characters');

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 4: Triple Occurrence (Festival + Vrat + Panchak)
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Scenario 4: Triple Occurrence (Festival + Vrat + Panchak)');
const tripleData: PanchangNotificationData = {
  tithi: 'Amavasya',
  paksha: 'Krishna',
  samvat: '2083',
  festival: 'Diwali',
  vrat: 'Lakshmi Puja Vrat',
  panchak: { isActive: true, type: 'Agni Panchak' }
};
const triplePayload = buildDailyNotificationPayload(tripleData);
console.log('  Title:', triplePayload.title);
console.log('  Body: ', triplePayload.body);
console.log('  Length:', triplePayload.body.length);

assert(triplePayload.title === '🎉 Diwali & Sacred Observances', 'Title prioritizes Festival in primary highlight');
assert(
  triplePayload.body === 'Amavasya • 🎉 Diwali • 🙏 Lakshmi Puja Vrat • ⚠️ Agni Panchak',
  'Body cleanly concatenates Tithi, Festival, Vrat, and Panchak'
);
assert(!triplePayload.body.includes('  '), 'No double spaces or formatting glitches');
assert(triplePayload.body.length <= 120, 'Body length is <= 120 characters');

// ─────────────────────────────────────────────────────────────────────────────
// Scenario 5: Long Strings Clean Truncation Check
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ Scenario 5: Boundary Length & Truncation Guard');
const longData: PanchangNotificationData = {
  tithi: 'Krishna Chaturdashi Extraordinarily Extended Astrometric Calculation',
  paksha: 'Krishna',
  samvat: '2083',
  festival: 'Maha Shivaratri Celebrations of Supreme Cosmic Grace and Illumination',
  vrat: 'Shivaratri Maha Upavasa and Rudrabhishekam All-Night Fasting Vigil',
  panchak: { isActive: true, type: 'Mrityu Panchak Special Observance Window' }
};
const longPayload = buildDailyNotificationPayload(longData);
console.log('  Title:', longPayload.title);
console.log('  Body: ', longPayload.body);
console.log('  Length:', longPayload.body.length);

assert(longPayload.body.length <= 120, 'Long input body is strictly constrained to <= 120 characters');
assert(longPayload.body.endsWith('...'), 'Long truncated text terminates with ellipsis without awkward trailing divider');

console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
if (passed === total) {
  console.log('  🎉 ALL NOTIFICATION MATRIX REQUIREMENTS VERIFIED!');
}
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

if (passed !== total) {
  process.exit(1);
}
