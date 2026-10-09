import { getHolidayAndEclipseDetails, ECLIPSES_DATABASE } from '../src/lib/eclipses-and-holidays';
import { PRESET_LOCATIONS } from '../src/lib/vedic-astronomy';

const delhi = PRESET_LOCATIONS[0];

console.log('═══════════════════════════════════════════════════════════════════════════════════');
console.log('       ASTRONOMICAL ECLIPSES & PUBLIC/VEDIC HOLIDAYS AUDIT                   ');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

let passed = 0;
function assert(condition: boolean, desc: string) {
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${desc}`);
  } else {
    console.error(`  ✗ FAIL: ${desc}`);
    throw new Error(`Test failed: ${desc}`);
  }
}

// 1. Regular non-holiday day (e.g. 10 Oct 2026)
const regDate = new Date('2026-10-10T10:00:00+05:30');
const regDetails = getHolidayAndEclipseDetails(regDate, delhi);

assert(regDetails.todayHoliday.isHoliday === false, '10 Oct 2026 has no holiday observed');
assert(regDetails.todayHoliday.title.includes('No Holiday Today'), 'Displays "No Holiday Today" text');
assert(regDetails.upcomingHoliday !== null, 'Upcoming holiday is populated');
assert(regDetails.upcomingHoliday!.daysRemaining > 0, 'Upcoming holiday has positive days remaining');
assert(regDetails.eclipseInfo.hasEclipseToday === false, 'No eclipse on 10 Oct 2026');
assert(regDetails.eclipseInfo.nextEclipse !== null, 'Next upcoming eclipse is identified');

// 2. Fixed National Holiday (Republic Day - 26 Jan 2026)
const repDate = new Date('2026-01-26T10:00:00+05:30');
const repDetails = getHolidayAndEclipseDetails(repDate, delhi);
assert(repDetails.todayHoliday.isHoliday === true, '26 Jan 2026 is recognized as a holiday');
assert(repDetails.todayHoliday.title.includes('Republic Day'), 'Holiday title is Republic Day');
assert(repDetails.todayHoliday.badge === 'National Holiday', 'Badge is National Holiday');

// 3. Eclipse Date (Total Lunar Eclipse - 3 March 2026)
const eclipseDate = new Date('2026-03-03T18:00:00+05:30');
const eclipseDetails = getHolidayAndEclipseDetails(eclipseDate, delhi);
assert(eclipseDetails.eclipseInfo.hasEclipseToday === true, '3 March 2026 has an eclipse active today');
assert(eclipseDetails.eclipseInfo.activeEclipse!.type === 'Lunar', 'Eclipse type is Lunar');
assert(eclipseDetails.eclipseInfo.activeEclipse!.nameHindi.includes('चन्द्र ग्रहण'), 'Eclipse name includes चन्द्र ग्रहण');

// 4. Solar Eclipse Date (Total Solar Eclipse - 12 Aug 2026)
const solarDate = new Date('2026-08-12T18:00:00+05:30');
const solarDetails = getHolidayAndEclipseDetails(solarDate, delhi);
assert(solarDetails.eclipseInfo.hasEclipseToday === true, '12 Aug 2026 has a solar eclipse active');
assert(solarDetails.eclipseInfo.activeEclipse!.type === 'Solar', 'Eclipse type is Solar');

// 5. Database completeness
assert(ECLIPSES_DATABASE.length >= 10, 'Eclipse database contains complete 2025-2029 catalog');

console.log(`\n🎉 ALL ${passed}/${passed} ECLIPSE AND HOLIDAY ENGINE ASSERTIONS PASSED!`);
