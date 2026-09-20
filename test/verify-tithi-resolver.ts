/**
 * Automated Verification Suite for Tithi Engine, Ephemeris, and Synchronization
 * Tests:
 * 1. Longitudinal Precision Equation & Lahiri Ayanamsha
 * 2. Midnight vs. Sunrise Rollover Trap (Pre-sunrise civil day anchoring)
 * 3. Tithi Kshaya (Lost Tithi) and Tithi Vriddhi (Extended Tithi) Resolution
 * 4. Sub-Second Boundary Interpolation (Root-Finding)
 * 5. Topocentric Atmospheric Refraction & Elevation Dip
 * 
 * Run with:
 *   npx tsx test/verify-tithi-resolver.ts
 */

import {
  normalizeDeg,
  getJulianDay,
  getSunLongitude,
  getMoonLongitude,
  getLahiriAyanamsha,
  getElongationAngle,
  calculateTithiIndexFromElongation,
  calculateTithiProgressFromElongation,
  findTithiEndTime,
  findTithiStartTime,
  calculateSunTimesWithRefraction
} from '../src/lib/ephemeris';

import {
  DailyTithiResolution,
  resolveDailyTithi,
  resolveMonthlyTithis,
  resolveAnomaliesBetweenSunrises
} from '../src/lib/tithi-resolver';

import {
  calculatePanchang,
  LocationCoordinates,
  PRESET_LOCATIONS
} from '../src/lib/vedic-astronomy';

const DELHI: LocationCoordinates = PRESET_LOCATIONS[0]; // 28.6139°N, 77.2090°E, IST (+5.5)

let passed = 0;
let total = 0;

function assert(condition: boolean, title: string, detail?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${title}`);
  } else {
    console.error(`  ❌ FAIL: ${title} ${detail ? `-> ${detail}` : ''}`);
  }
}

console.log('═══════════════════════════════════════════════════════════════════════════════════');
console.log('       ASTRONOMICAL & VEDIC COMPUTATIONAL AUDIT: TITHI & SYNCHRONIZATION ENGINE     ');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

// ─────────────────────────────────────────────────────────────────────────────
// 1. LONGITUDINAL PRECISION EQUATION & EPHEMERIS
// ─────────────────────────────────────────────────────────────────────────────
console.log('▸ 1. Longitudinal Precision Equation & Angular Normalization:');

// Test angle normalization
assert(normalizeDeg(360) === 0, 'normalizeDeg(360) === 0');
assert(normalizeDeg(725) === 5, 'normalizeDeg(725) === 5');
assert(normalizeDeg(-10) === 350, 'normalizeDeg(-10) === 350');
assert(normalizeDeg(-360) === 0, 'normalizeDeg(-360) === 0');

// Test Tithi index mapping: Tithi = floor(Δλ / 12) + 1
assert(calculateTithiIndexFromElongation(0.0) === 1, 'Elongation 0.0° -> Shukla Pratipada (1)');
assert(calculateTithiIndexFromElongation(11.999) === 1, 'Elongation 11.999° -> Shukla Pratipada (1)');
assert(calculateTithiIndexFromElongation(12.0) === 2, 'Elongation 12.0° -> Shukla Dwitiya (2)');
assert(calculateTithiIndexFromElongation(179.999) === 15, 'Elongation 179.999° -> Shukla Purnima (15)');
assert(calculateTithiIndexFromElongation(180.0) === 16, 'Elongation 180.0° -> Krishna Pratipada (16)');
assert(calculateTithiIndexFromElongation(359.999) === 30, 'Elongation 359.999° -> Krishna Amavasya (30)');

// Test progress percentage: (Δλ % 12) / 12 * 100
const prog0 = calculateTithiProgressFromElongation(0);
const prog6 = calculateTithiProgressFromElongation(6);
const prog12 = calculateTithiProgressFromElongation(18); // 18 % 12 = 6 -> 50%
assert(Math.abs(prog0 - 0) < 1e-6, 'Progress at 0° is 0.0%');
assert(Math.abs(prog6 - 50) < 1e-6, 'Progress at 6° is 50.0%');
assert(Math.abs(prog12 - 50) < 1e-6, 'Progress at 18° is 50.0%');

// Lahiri Ayanamsha checks
const jdJ2000 = 2451545.0; // 2000-01-01 12:00 UTC
const ayanJ2000 = getLahiriAyanamsha(jdJ2000);
assert(Math.abs(ayanJ2000 - 23.85709) < 0.001, `Lahiri Ayanamsha at J2000.0 is ~23.857° (got ${ayanJ2000.toFixed(5)}°)`);

// ─────────────────────────────────────────────────────────────────────────────
// 2. MIDNIGHT VS. SUNRISE ROLLOVER TRAP AUDIT
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ 2. Midnight vs. Sunrise Rollover Trap Verification:');

// Test date: August 15, 2026
// Sunrise in New Delhi on Aug 15 is at ~05:50 AM
const testDate = new Date(2026, 7, 15);
const preSunriseTime = new Date(2026, 7, 15, 3, 0, 0); // 03:00 AM (Pre-Sunrise)
const postSunriseTime = new Date(2026, 7, 15, 8, 0, 0); // 08:00 AM (Post-Sunrise)

const preSunriseRes = resolveDailyTithi(testDate, DELHI, preSunriseTime);
const postSunriseRes = resolveDailyTithi(testDate, DELHI, postSunriseTime);

assert(preSunriseRes.isPreSunrise === true, 'Pre-sunrise evaluation correctly flags isPreSunrise = true');
assert(postSunriseRes.isPreSunrise === false, 'Post-sunrise evaluation flags isPreSunrise = false');

// In pre-sunrise (03:00 AM on Aug 15), the civil day is anchored to Aug 14!
// Aug 14 Udaya Tithi was Shukla Dwitiya (2)
// Aug 15 Udaya Tithi is Shukla Tritiya (3)
assert(
  preSunriseRes.civilAnchorDate === '2026-08-14',
  `Pre-sunrise civil day is anchored to 2026-08-14 (got ${preSunriseRes.civilAnchorDate})`
);
assert(
  preSunriseRes.udayaTithi.index === 2,
  `Pre-sunrise Udaya Tithi is Shukla Dwitiya (2) from yesterday's sunrise (got ${preSunriseRes.udayaTithi.name})`
);

assert(
  postSunriseRes.civilAnchorDate === '2026-08-15',
  `Post-sunrise civil day is anchored to 2026-08-15 (got ${postSunriseRes.civilAnchorDate})`
);
assert(
  postSunriseRes.udayaTithi.index === 3,
  `Post-sunrise Udaya Tithi is Shukla Tritiya (3) from today's sunrise (got ${postSunriseRes.udayaTithi.name})`
);

// At 03:00 AM on Aug 15, the instantaneous Tithi reflects the exact current Moon-Sun elongation
assert(
  preSunriseRes.instantaneousTithi.index >= 1 && preSunriseRes.instantaneousTithi.index <= 30,
  `Instantaneous Tithi at 03:00 AM is computed: ${preSunriseRes.instantaneousTithi.name}`
);
assert(
  preSunriseRes.instantaneousTithi.percentageElapsed >= 0 && preSunriseRes.instantaneousTithi.percentageElapsed <= 100,
  `Instantaneous Tithi percentage elapsed is valid: ${preSunriseRes.instantaneousTithi.percentageElapsed}%`
);

// Check calculatePanchang consistency
const panchangPre = calculatePanchang(testDate, DELHI, preSunriseTime);
assert(panchangPre.isPreSunrise === true, 'calculatePanchang returns isPreSunrise = true at 03:00 AM');
assert(panchangPre.udayaTithi.index === 2, 'calculatePanchang returns Udaya Tithi 2 at 03:00 AM');

// ─────────────────────────────────────────────────────────────────────────────
// 3. TITHI KSHAYA & VRIDDHI ANOMALY RESOLUTION
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ 3. Tithi Kshaya (Lost) & Vriddhi (Extended) Detection:');

// August 2026 has:
// 1. Kshaya Tithi on August 11, 2026 (Krishna Trayodashi, index 13 was skipped between Aug 10 & Aug 11 sunrises)
// 2. Vriddhi Tithi on August 25, 2026 (Shukla Dwadashi, index 12 touched both Aug 24 & Aug 25 sunrises)

const aug11Date = new Date(2026, 7, 11, 6, 0, 0);
const aug11Res = resolveDailyTithi(aug11Date, DELHI, aug11Date);

assert(aug11Res.isKshaya === true, 'Aug 11, 2026 correctly detected as Tithi Kshaya');
assert(aug11Res.kshayaTithiDetails !== null, 'Kshaya Tithi details populated');
if (aug11Res.kshayaTithiDetails) {
  assert(
    aug11Res.kshayaTithiDetails.index === 28,
    `Skipped Tithi is Krishna Trayodashi (index 28) (got ${aug11Res.kshayaTithiDetails.index} - ${aug11Res.kshayaTithiDetails.name})`
  );
  assert(
    Boolean(aug11Res.kshayaTithiDetails.startTime && aug11Res.kshayaTithiDetails.endTime),
    `Kshaya Tithi start and end timestamps present: ${aug11Res.kshayaTithiDetails.startTime} -> ${aug11Res.kshayaTithiDetails.endTime}`
  );
  const kStart = new Date(aug11Res.kshayaTithiDetails.startTime).getTime();
  const kEnd = new Date(aug11Res.kshayaTithiDetails.endTime).getTime();
  assert(kEnd > kStart, 'Kshaya Tithi conclusion is strictly after its start');
}

// August 25, 2026: Vriddhi Tithi (Shukla Dwadashi, index 12)
const aug25Date = new Date(2026, 7, 25, 6, 0, 0);
const aug25Res = resolveDailyTithi(aug25Date, DELHI, aug25Date);

assert(aug25Res.isVriddhi === true, 'Aug 25, 2026 correctly detected as Tithi Vriddhi');
assert(aug25Res.isKshaya === false, 'Aug 25 is not Kshaya');

// Monthly resolution test
const monthlyRes = resolveMonthlyTithis(2026, 7, DELHI);
assert(monthlyRes.length === 31, 'August 2026 monthly resolution contains 31 days');
const kshayaDays = monthlyRes.filter(d => d.isKshaya);
const vriddhiDays = monthlyRes.filter(d => d.isVriddhi);
assert(kshayaDays.length === 1, `Exactly 1 Kshaya day in August 2026 (found ${kshayaDays.length})`);
assert(vriddhiDays.length === 1, `Exactly 1 Vriddhi day in August 2026 (found ${vriddhiDays.length})`);

// ─────────────────────────────────────────────────────────────────────────────
// 4. SUB-SECOND ROOT FINDING ACCURACY
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ 4. Sub-Second Root-Finding Engine Precision:');

// Test findTithiEndTime for Krishna Tritiya (index 18) active on Aug 1, 2026
const aug1Sunrise = new Date(2026, 7, 1, 5, 42, 0);
const tithiEnd = findTithiEndTime(aug1Sunrise, 18, 5.5); // Krishna Tritiya (index 18)
assert(tithiEnd !== null, 'findTithiEndTime successfully found boundary');
if (tithiEnd) {
  const jdEnd = getJulianDay(tithiEnd);
  const elEnd = getElongationAngle(jdEnd);
  // Krishna Tritiya ends when elongation crosses 18 * 12 = 216 degrees
  const targetDeg = 216.0;
  const angularError = Math.abs(elEnd - targetDeg);
  assert(angularError < 0.0001, `Angular error at root is < 0.0001° (got error ${angularError.toExponential(4)}°)`);
}

// Test findTithiStartTime for Krishna Tritiya (index 18)
const tithiStart = findTithiStartTime(aug1Sunrise, 18, 5.5);
assert(tithiStart !== null, 'findTithiStartTime successfully found start boundary');
if (tithiStart) {
  const jdStart = getJulianDay(tithiStart);
  const elStart = getElongationAngle(jdStart);
  // Krishna Tritiya starts when elongation crosses 17 * 12 = 204 degrees
  const targetDeg = 204.0;
  const angularError = Math.abs(elStart - targetDeg);
  assert(angularError < 0.0001, `Start angular error at root is < 0.0001° (got error ${angularError.toExponential(4)}°)`);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. TOPOCENTRIC SUNRISE REFRACTION & ELEVATION DIP
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ 5. Topocentric Atmospheric Refraction & Elevation Dip:');

const seaLevelSun = calculateSunTimesWithRefraction(testDate, DELHI.latitude, DELHI.longitude, DELHI.timezone, 0);
const mountainSun = calculateSunTimesWithRefraction(testDate, DELHI.latitude, DELHI.longitude, DELHI.timezone, 1000); // 1000 meters elevation

// At 1000m elevation:
// Horizon dips, so sunrise occurs earlier and sunset occurs later, increasing day length
assert(
  mountainSun.sunriseMinutes < seaLevelSun.sunriseMinutes,
  `Mountain sunrise (${mountainSun.sunriseMinutes.toFixed(2)}m) is earlier than sea level (${seaLevelSun.sunriseMinutes.toFixed(2)}m)`
);
assert(
  mountainSun.sunsetMinutes > seaLevelSun.sunsetMinutes,
  `Mountain sunset (${mountainSun.sunsetMinutes.toFixed(2)}m) is later than sea level (${seaLevelSun.sunsetMinutes.toFixed(2)}m)`
);
assert(
  mountainSun.dayLengthMinutes > seaLevelSun.dayLengthMinutes,
  `Mountain day length (${mountainSun.dayLengthMinutes.toFixed(2)}m) is longer than sea level (${seaLevelSun.dayLengthMinutes.toFixed(2)}m)`
);
assert(
  Math.abs(mountainSun.dipDeg - (1.76 / 60) * Math.sqrt(1000)) < 1e-4,
  `Horizon dip at 1000m is ~0.9276° (got ${mountainSun.dipDeg.toFixed(4)}°)`
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. DAILY TITHI RESOLUTION CONTRACT AUDIT
// ─────────────────────────────────────────────────────────────────────────────
console.log('\n▸ 6. DailyTithiResolution Interface & Contract Verification:');

const sampleRes = resolveDailyTithi(new Date(), DELHI);
assert(typeof sampleRes.gregorianDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(sampleRes.gregorianDate), 'gregorianDate matches YYYY-MM-DD');
assert(sampleRes.udayaTithi.index >= 1 && sampleRes.udayaTithi.index <= 30, 'udayaTithi.index in [1, 30]');
assert(typeof sampleRes.udayaTithi.name === 'string', 'udayaTithi.name is string');
assert(sampleRes.udayaTithi.paksha === 'Shukla' || sampleRes.udayaTithi.paksha === 'Krishna', 'udayaTithi.paksha is Shukla or Krishna');
assert(!isNaN(Date.parse(sampleRes.udayaTithi.endTime)), 'udayaTithi.endTime is valid ISO string');

assert(sampleRes.instantaneousTithi.index >= 1 && sampleRes.instantaneousTithi.index <= 30, 'instantaneousTithi.index in [1, 30]');
assert(sampleRes.instantaneousTithi.percentageElapsed >= 0 && sampleRes.instantaneousTithi.percentageElapsed <= 100, 'percentageElapsed in [0, 100]');
assert(!isNaN(Date.parse(sampleRes.instantaneousTithi.endTime)), 'instantaneousTithi.endTime is valid ISO string');
assert(typeof sampleRes.isKshaya === 'boolean', 'isKshaya is boolean');
assert(typeof sampleRes.isVriddhi === 'boolean', 'isVriddhi is boolean');
assert(!isNaN(Date.parse(sampleRes.nextSunrise)), 'nextSunrise is valid ISO string');

console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
console.log(`  VERIFICATION RESULTS: ${passed}/${total} Assertions Passed`);
if (passed === total) {
  console.log('  🎉 ALL TITHI RESOLVER & EPHEMERIS AUDIT ASSERTIONS COMPLETED SUCCESSFULLY!');
} else {
  console.error(`  ⚠️ ${total - passed} ASSERTIONS FAILED!`);
}
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
