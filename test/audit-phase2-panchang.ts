/**
 * Phase 2 Audit: Panchang Ephemeris, Tithi Boundaries, Timezones & Reference Comparison
 */

import {
  calculatePanchang,
  LocationCoordinates,
  PRESET_LOCATIONS,
  TITHIS
} from '../src/lib/vedic-astronomy';
import {
  resolveDailyTithi
} from '../src/lib/tithi-resolver';
import {
  findTithiEndTime,
  findTithiStartTime,
  getJulianDay,
  getElongationAngle,
  calculateTithiIndexFromElongation,
  calculateSunTimesWithRefraction
} from '../src/lib/ephemeris';
import { getFestivalForDate } from '../src/lib/festivals';
import { getActivePanchakStatus, generatePanchaksForYear } from '../src/lib/dharmashastra-rules';

console.log('═══════════════════════════════════════════════════════════════════════════════════');
console.log('             PHASE 2 AUDIT: PANCHANG CALCULATION & TIMEZONE ENGINE         ');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

const delhiLoc: LocationCoordinates = {
  name: 'New Delhi',
  country: 'India',
  latitude: 28.6139,
  longitude: 77.2090,
  timezone: 5.5,
  ianaTimezone: 'Asia/Kolkata',
  regionName: 'Delhi'
};

const nyLoc: LocationCoordinates = {
  name: 'New York',
  country: 'USA',
  latitude: 40.7128,
  longitude: -74.0060,
  timezone: -4.0, // EDT
  ianaTimezone: 'America/New_York',
  regionName: 'New York'
};

const kathmanduLoc: LocationCoordinates = {
  name: 'Kathmandu (45-min offset)',
  country: 'Nepal',
  latitude: 27.7172,
  longitude: 85.3240,
  timezone: 5.75, // +5:45
  ianaTimezone: 'Asia/Kathmandu',
  regionName: 'Bagmati'
};

const adelaideLoc: LocationCoordinates = {
  name: 'Adelaide (30-min offset)',
  country: 'Australia',
  latitude: -34.9285,
  longitude: 138.6007,
  timezone: 9.5, // +9:30
  ianaTimezone: 'Australia/Adelaide',
  regionName: 'South Australia'
};

// 1. Audit 10 Dates for Delhi with Ephemeris Tithi Boundary Precision
console.log('▸ 1. Ephemeris Tithi Boundary Audit (10 Selected Sample Dates):');
const sampleDates = [
  '2026-01-14T06:00:00Z', // Makar Sankranti period
  '2026-03-03T06:00:00Z', // Holika Dahan / Purnima
  '2026-04-12T06:00:00Z', // Varuthini Ekadashi
  '2026-05-18T06:00:00Z', // Shukla Pratipada
  '2026-07-03T06:00:00Z', // Ashadha Shukla
  '2026-08-10T06:00:00Z', // Kshaya Day (Aug 10-11)
  '2026-08-25T06:00:00Z', // Vriddhi Day
  '2026-09-28T06:00:00Z', // Current Date
  '2026-10-20T06:00:00Z', // Navratri / Dussehra window
  '2026-11-08T06:00:00Z'  // Diwali window
];

sampleDates.forEach((dStr, idx) => {
  const d = new Date(dStr);
  const res = resolveDailyTithi(d, delhiLoc);
  const p = calculatePanchang(d, delhiLoc);
  const endFormatted = res.udayaTithi.endTime
    ? new Date(res.udayaTithi.endTime).toISOString().substring(11, 16) + ' UTC'
    : 'N/A';
  
  // Verify elongation angle directly at boundary
  let angularDiff = 0;
  if (res.udayaTithi.endTime) {
    const jd = getJulianDay(new Date(res.udayaTithi.endTime));
    const elong = getElongationAngle(jd);
    const expectedDeg = (res.udayaTithi.index % 30) * 12;
    angularDiff = Math.abs(elong - expectedDeg);
    if (angularDiff > 180) angularDiff = Math.abs(angularDiff - 360);
  }

  // Convert angular difference to estimated time difference in minutes (Moon moves ~0.5 deg/hr = ~0.0083 deg/min)
  const timeDiffMin = Number((angularDiff / (12 / (24 * 60))).toFixed(3));

  console.log(
    `  [Date ${String(idx + 1).padStart(2, '0')}: ${dStr.substring(0, 10)}] ` +
    `Udaya: ${res.udayaTithi.name.padEnd(24)} | End: ${endFormatted} | ` +
    `Angular Error: ${angularDiff.toFixed(6)}° (Mismatch: ${timeDiffMin} min)`
  );
});

// 2. Kshaya & Vriddhi Verification
console.log('\n▸ 2. Kshaya & Vriddhi Verification:');
const aug11 = resolveDailyTithi(new Date('2026-08-11T06:00:00Z'), delhiLoc);
console.log(`  Aug 11, 2026 isKshaya: ${aug11.isKshaya}, Skipped Tithi: ${aug11.kshayaTithiDetails?.name || 'None'}`);

const aug25 = resolveDailyTithi(new Date('2026-08-25T06:00:00Z'), delhiLoc);
console.log(`  Aug 25, 2026 isVriddhi: ${aug25.isVriddhi}, Extended Tithi: ${aug25.udayaTithi.name}`);

// 3. Timezone Audits: IST, US Eastern, Kathmandu (+5:45), Adelaide (+9:30)
console.log('\n▸ 3. Multi-Timezone Topocentric Sunrise & Tithi Resolution:');
const testDate = new Date('2026-09-28T06:00:00Z');
[delhiLoc, nyLoc, kathmanduLoc, adelaideLoc].forEach(loc => {
  const p = calculatePanchang(testDate, loc);
  console.log(
    `  ${loc.name.padEnd(30)} | Sunrise: ${p.sunrise} | ` +
    `Udaya Tithi: ${p.tithi.name} | Sunset: ${p.sunset}`
  );
});

// 4. Midnight vs Sunrise Rollover (Ahoratra Rule)
console.log('\n▸ 4. Midnight Rollover vs Sunrise Audit:');
const preSunriseTime = new Date('2026-08-15T03:00:00+05:30'); // 3:00 AM IST
const postSunriseTime = new Date('2026-08-15T09:00:00+05:30'); // 9:00 AM IST

const prePanchang = calculatePanchang(preSunriseTime, delhiLoc, preSunriseTime);
const postPanchang = calculatePanchang(postSunriseTime, delhiLoc, postSunriseTime);

console.log(`  03:00 AM (Pre-sunrise)  | isPreSunrise: ${prePanchang.isPreSunrise} | Civil Udaya Tithi: ${prePanchang.tithi.name} | Instantaneous: ${prePanchang.instantaneousTithi?.name}`);
console.log(`  09:00 AM (Post-sunrise) | isPreSunrise: ${postPanchang.isPreSunrise} | Civil Udaya Tithi: ${postPanchang.tithi.name} | Instantaneous: ${postPanchang.instantaneousTithi?.name}`);

console.log('\n═══════════════════════════════════════════════════════════════════════════════════\n');
