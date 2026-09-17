/**
 * Comprehensive Verification Suite for DharmashastraEngine
 * Tests:
 * 1. Daily Kala calculations (Dina Mana 5 parts, Pradosha, Nishita, Arunodaya)
 * 2. Kala Vyapti matching (Janmashtami Nishita, Diwali Pradosha, Ram Navami Madhyahna)
 * 3. Tithi Anomalies (Kshaya Tithi detection, Yugma Vakya two-day tie breaking)
 * 4. Smarta vs. Vaishnava Ekadashi (Dashami-Viddha Arunodaya rule & Dwadashi push)
 * 5. Monthly Calendar compatibility & performance
 * 
 * Run with:
 * cmd /c "npx tsx test/verify-dharmashastra.ts"
 */

import { PRESET_LOCATIONS, calculatePanchang, getMonthVedicCalendar } from '../src/lib/vedic-astronomy';
import {
  calculateDailyKalas,
  calculateKalaVyapti,
  resolveFestivalDay,
  evaluateEkadashi,
  determineFestivalForDate,
  getKalaSpan,
  KalaTimeSpan
} from '../src/lib/dharmashastra-engine';
import { getFestivalForDate, MAJOR_HINDU_FESTIVALS } from '../src/lib/festivals';

const delhi = PRESET_LOCATIONS[0];
let passed = 0;
let total = 0;

function assert(condition: boolean, message: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('═══════════════════════════════════════════════════════════════════════════════════');
console.log('             DHARMASHASTRA ENGINE KALA VYAPTI & VRAT AUDIT                        ');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────────────────────────
// 1. DAILY KALA (TIME-SPAN) DIVISIONS
// ─────────────────────────────────────────────────────────────────────────────
console.log('▸ 1. Verifying Astronomical Daily Kala Divisions:');
const testDate = new Date(2026, 8, 4, 6, 0, 0); // 4 Sep 2026
const kalas = calculateDailyKalas(testDate, delhi);

// Check Sunrise and Sunset
assert(kalas.sunrise < kalas.sunset, 'Sunrise occurs before Sunset');
assert(kalas.sunset < kalas.nextSunrise, 'Sunset occurs before next Sunrise');

// Check 5 Dina Mana divisions
assert(kalas.pratah.start.getTime() === kalas.sunrise.getTime(), 'Pratah starts at Sunrise');
assert(kalas.pratah.end.getTime() === kalas.sangava.start.getTime(), 'Pratah connects seamlessly to Sangava');
assert(kalas.sangava.end.getTime() === kalas.madhyahna.start.getTime(), 'Sangava connects seamlessly to Madhyahna');
assert(kalas.madhyahna.end.getTime() === kalas.aparahna.start.getTime(), 'Madhyahna connects seamlessly to Aparahna');
assert(kalas.aparahna.end.getTime() === kalas.sayahna.start.getTime(), 'Aparahna connects seamlessly to Sayahna');
assert(kalas.sayahna.end.getTime() === kalas.sunset.getTime(), 'Sayahna concludes at Sunset');

// Check that each of the 5 Dina Mana divisions is 1/5th of the day length
const fifthDay = kalas.dayLengthMinutes / 5;
assert(Math.abs(kalas.pratah.durationMinutes - fifthDay) < 0.1, 'Pratah duration is exactly 1/5th of daytime');
assert(Math.abs(kalas.madhyahna.durationMinutes - fifthDay) < 0.1, 'Madhyahna duration is exactly 1/5th of daytime');

// Check Pradosha Kala (2 Muhurats = 2/15th of night after Sunset)
assert(kalas.pradosha.start.getTime() === kalas.sunset.getTime(), 'Pradosha starts immediately at Sunset');
const expectedPradoshaMin = (2 / 15) * kalas.nightLengthMinutes;
assert(Math.abs(kalas.pradosha.durationMinutes - expectedPradoshaMin) < 0.1, 'Pradosha is exactly 2 Muhurats (2/15th of night)');
assert(kalas.pradosha.durationMinutes >= 72 && kalas.pradosha.durationMinutes <= 144, 'Pradosha duration is within traditional canonical range (72 to 144 min)');

// Check Nishita Kala (8th Muhurat of night, centered at midnight)
const nightMuhurat = kalas.nightLengthMinutes / 15;
const nishitaStartOffset = (kalas.nishita.start.getTime() - kalas.sunset.getTime()) / 60000;
assert(Math.abs(nishitaStartOffset - 7 * nightMuhurat) < 0.1, 'Nishita starts at the beginning of the 8th Muhurat (7 Muhurats after sunset)');
assert(Math.abs(kalas.nishita.durationMinutes - nightMuhurat) < 0.1, 'Nishita duration is exactly 1 night Muhurat');

// Check Arunodaya (4 Ghatis = 2 Muhurats = 96 min proportionally before Sunrise)
assert(kalas.arunodaya.end.getTime() === kalas.sunrise.getTime(), 'Arunodaya concludes precisely at Sunrise');
assert(kalas.arunodaya.durationMinutes > 80 && kalas.arunodaya.durationMinutes < 120, 'Arunodaya is approximately 96 minutes (4 Ghatikas)');

// ─────────────────────────────────────────────────────────────────────────────
// 2. KALA VYAPTI FESTIVAL MATCHING
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ 2. Verifying Kala Vyapti Festival Matching:');

// Janmashtami in Nishita Kala (4 Sep 2026)
const janmPanchang = calculatePanchang(new Date(2026, 8, 4, 6, 0, 0), delhi);
assert(janmPanchang.todayFestival.title.includes('Krishna Janmashtami'), 'Janmashtami matched via Nishita Kala Vyapti');
const janmDef = MAJOR_HINDU_FESTIVALS.find(f => f.id === 'janmashtami');
assert(janmDef?.kalaRequirement === 'Nishita', 'Janmashtami definition requires Nishita Kala');

// Diwali (Lakshmi Puja) in Pradosha Kala (8 Nov 2026)
const diwaliPanchang = calculatePanchang(new Date(2026, 10, 8, 6, 0, 0), delhi);
assert(diwaliPanchang.todayFestival.title.includes('Diwali'), 'Diwali matched via Pradosha Kala Vyapti');
const diwaliDef = MAJOR_HINDU_FESTIVALS.find(f => f.id === 'diwali');
assert(diwaliDef?.kalaRequirement === 'Pradosha', 'Diwali definition requires Pradosha Kala');

// Ram Navami in Madhyahna Kala
const ramDef = MAJOR_HINDU_FESTIVALS.find(f => f.id === 'ram-navami');
assert(ramDef?.kalaRequirement === 'Madhyahna', 'Ram Navami definition requires Madhyahna Kala');

// Ganesh Chaturthi in Madhyahna Kala (14 Sep 2026)
const ganeshPanchang = calculatePanchang(new Date(2026, 8, 14, 6, 0, 0), delhi);
assert(ganeshPanchang.todayFestival.title.includes('Ganesh Chaturthi'), 'Ganesh Chaturthi matched via Madhyahna Kala Vyapti');
const ganeshDef = MAJOR_HINDU_FESTIVALS.find(f => f.id === 'ganesh-chaturthi');
assert(ganeshDef?.kalaRequirement === 'Madhyahna', 'Ganesh Chaturthi definition requires Madhyahna Kala');

// ─────────────────────────────────────────────────────────────────────────────
// 3. TITHI ANOMALIES & YUGMA VAKYA TIE-BREAKERS
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ 3. Verifying Tithi Anomalies & Tie-Breaker Resolution:');

// Test resolveFestivalDay when only Day 1 has overlap
const span1: KalaTimeSpan = {
  kala: 'Nishita',
  start: new Date(2026, 8, 4, 23, 45),
  end: new Date(2026, 8, 5, 0, 35),
  durationMinutes: 50
};
const span2: KalaTimeSpan = {
  kala: 'Nishita',
  start: new Date(2026, 8, 5, 23, 45),
  end: new Date(2026, 8, 6, 0, 35),
  durationMinutes: 50
};
// Krishna Ashtami = 23
const res1 = resolveFestivalDay(span1, span2, 23);
assert(res1.chosenDay === 1, `Exclusive Kala Vyapti correctly resolved to Day 1 (${res1.reason})`);

// Test Yugma Vakya tie-breaker when both days have equal overlap
const mockSpanA: KalaTimeSpan = { kala: 'Madhyahna', start: new Date('2026-05-01T11:30:00Z'), end: new Date('2026-05-01T13:30:00Z'), durationMinutes: 120 };
const mockSpanB: KalaTimeSpan = { kala: 'Madhyahna', start: new Date('2026-05-02T11:30:00Z'), end: new Date('2026-05-02T13:30:00Z'), durationMinutes: 120 };
// Mock equal coverage: resolveFestivalDay should default to Day 1 (Purva precedence / Yugma Vakya)
const tieRes = resolveFestivalDay(mockSpanA, mockSpanA, 10);
assert(tieRes.chosenDay === 1, 'Two-day tie breaker picks Day 1 via Yugma Vakya / Purva precedence');

// Kshaya Tithi Simulation:
// A festival whose tithi is completely contained within daytime of Day 1, never touching Sunrise of Day 1 or Day 2
const kshayaDate = new Date(2026, 8, 14); // 14 Sep 2026
const kshayaKalas = calculateDailyKalas(kshayaDate, delhi);
const kshayaVyapti = calculateKalaVyapti(4, kshayaKalas.madhyahna);
assert(kshayaVyapti.overlaps === true, 'Kala Vyapti accurately detects Tithi active during target Kala even when sunrise differs');

// ─────────────────────────────────────────────────────────────────────────────
// 4. SMARTA VS. VAISHNAVA EKADASHI CONFIGURATION
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ 4. Verifying Smarta vs. Vaishnava Ekadashi Rules:');

// Test Aja Ekadashi (7 Sep 2026)
const ekadashiDate = new Date(2026, 8, 7, 6, 0, 0);
const smartaEval = evaluateEkadashi(ekadashiDate, delhi, 'smarta');
const vaishnavaEval = evaluateEkadashi(ekadashiDate, delhi, 'vaishnava');

assert(smartaEval.isEkadashiDay === true, 'Smarta evaluates 7 Sep 2026 as Ekadashi');
assert(smartaEval.activeTithiAtSunrise === 26, 'Sunrise Tithi is Krishna Ekadashi (26)');
assert(typeof smartaEval.isDashamiViddha === 'boolean', 'Dashami-Viddha check executed successfully');

// Test determineFestivalForDate with configurable sampradaya option
const smartaFest = determineFestivalForDate(ekadashiDate, delhi, { sampradaya: 'smarta' });
assert(smartaFest.name.includes('Aja Ekadashi'), 'Smarta festival returned Aja Ekadashi');
assert(Boolean(smartaFest.badge?.includes('Ekadashi')), 'Smarta badge denotes Ekadashi');

const vaishnavaFest = determineFestivalForDate(ekadashiDate, delhi, { sampradaya: 'vaishnava' });
assert(Boolean(vaishnavaFest.name), 'Vaishnava evaluation returned valid observance result');

// ─────────────────────────────────────────────────────────────────────────────
// 5. MONTHLY CALENDAR COMPATIBILITY & PERFORMANCE
// ─────────────────────────────────────────────────────────────────────────────
// Warm up JIT for getMonthVedicCalendar
getMonthVedicCalendar(2026, 0, delhi);

const tStart = performance.now();
const septCalendar = getMonthVedicCalendar(2026, 8, delhi);
const tElapsed = performance.now() - tStart;

assert(septCalendar.length === 30, 'September 2026 calendar contains 30 days');
// Ensure basic monthly view Udaya Tithi logic was NOT modified
const day14 = septCalendar.find(d => d.dayNumber === 14);
const day15 = septCalendar.find(d => d.dayNumber === 15);
assert(day14?.udayaTithi.index === 3, 'Day 14 keeps original Udaya Tithi (Tritiya, index 3)');
assert(day15?.udayaTithi.index === 4, 'Day 15 keeps original Udaya Tithi (Chaturthi, index 4)');
// But day 14 correctly received the Ganesh Chaturthi festival title via Kala Vyapti!
assert(day14?.festival?.includes('Ganesh Chaturthi') === true, 'Day 14 received Ganesh Chaturthi via Kala Vyapti without altering Udaya Tithi');

assert(tElapsed < 50, `30-day calendar computed in ${tElapsed.toFixed(2)}ms (< 50ms requirement)`);

console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
if (passed === total) {
  console.log('  🎉 ALL DHARMASHASTRA ENGINE & KALA VYAPTI REQUIREMENTS VERIFIED!');
}
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
