import { calculateMonthlyMuhurat, mergeIntervals, subtractInterval } from '../src/lib/panchang/monthlyMuhuratEngine';
import { PRESET_LOCATIONS } from '../src/lib/vedic-astronomy';

console.log('=== TESTING MONTHLY SHUBH KARYA MUHURAT ENGINE ===');

const location = PRESET_LOCATIONS[0]; // New Delhi
const year = 2026;
const month = 11; // November 2026

console.log(`Calculating for ${location.name}, ${month}/${year}...`);
const items = calculateMonthlyMuhurat(year, month, location);

console.log(`Total days returned: ${items.length} (Expected: 30)`);
if (items.length !== 30) {
  throw new Error(`Expected 30 days for November 2026, got ${items.length}`);
}

// Check intervals math
const intervals = [
  { start: 540, end: 660 }, // 09:00 - 11:00
  { start: 600, end: 720 }, // 10:00 - 12:00
];
const merged = mergeIntervals(intervals);
console.log('Merged intervals:', merged);
if (merged.length !== 1 || merged[0].start !== 540 || merged[0].end !== 720) {
  throw new Error('Merge intervals failed');
}

// Subtract interval
const avoid = { start: 630, end: 690 }; // 10:30 - 11:30
const subtracted = subtractInterval(merged, avoid);
console.log('Subtracted intervals:', subtracted);
if (subtracted.length !== 2) {
  throw new Error('Subtract interval failed to split into 2');
}

// Count auspicious days
const auspiciousDays = items.filter(i => i.isAuspiciousDay);
console.log(`Auspicious days in Nov 2026: ${auspiciousDays.length} / 30`);

const propertyDays = items.filter(i => i.auspiciousActivities.some(a => a.category === 'property'));
const vehicleDays = items.filter(i => i.auspiciousActivities.some(a => a.category === 'vehicle'));
const grihaPraveshDays = items.filter(i => i.auspiciousActivities.some(a => a.category === 'griha_pravesh'));

console.log(`Property Purchase days: ${propertyDays.length}`);
console.log(`Vehicle Purchase days: ${vehicleDays.length}`);
console.log(`Griha Pravesh days: ${grihaPraveshDays.length}`);

// Sample day check
const sample = items[4]; // 5th Nov 2026
console.log('\nSample Day Check (5 Nov 2026):', {
  date: sample.dateKey,
  weekday: sample.weekdayShort,
  tithi: sample.tithiName,
  nakshatra: sample.nakshatraName,
  isAuspicious: sample.isAuspiciousDay,
  activities: sample.auspiciousActivities.map(a => a.name),
  specialYogas: sample.specialYogas,
  bestWindows: sample.bestTimeWindowsString,
  rahuKaal: sample.rahuKaalString
});

console.log('\n🎉 ALL MONTHLY MUHURAT ENGINE ASSERTIONS PASSED!');

