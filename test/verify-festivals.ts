/**
 * Test Suite for Dynamic Major Hindu Festivals & Forward Observance Determination
 * Execution:
 *   npx tsx test/verify-festivals.ts
 */

import { PRESET_LOCATIONS, calculatePanchang } from '../src/lib/vedic-astronomy';
import { getFestivalForDate, findUpcomingMajorFestival, getUpcomingFestivalsList } from '../src/lib/festivals';

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
console.log('             DYNAMIC VEDIC FESTIVALS & OBSERVANCE DETERMINATION AUDIT              ');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

// 1. DIWALI (DEEPAVALI)
console.log('▸ 1. Verifying Diwali (Kartika/Ashwina Krishna Amavasya):');
const diwaliPanchang = calculatePanchang(new Date(2026, 10, 8, 6, 0, 0), delhi);
const diwaliFest = diwaliPanchang.todayFestival;
assert(diwaliFest.title.includes('Diwali'), 'Title includes "Diwali"');
assert(diwaliFest.icon === '🪔', 'Icon is 🪔 for Diwali');
assert(diwaliFest.isMajor === true, 'Marked as major festival');
assert(Boolean(diwaliFest.briefRule?.hindi), 'Includes Hindi Dharmashastra determination rule');

// 2. KRISHNA JANMASHTAMI
console.log('\n▸ 2. Verifying Krishna Janmashtami (Bhadrapada/Shravana Krishna Ashtami):');
const janmPanchang = calculatePanchang(new Date(2026, 8, 4, 6, 0, 0), delhi);
const janmFest = janmPanchang.todayFestival;
assert(janmFest.title.includes('Krishna Janmashtami'), 'Title includes "Krishna Janmashtami"');
assert(janmFest.icon === '🦚', 'Icon is 🦚 for Janmashtami');
assert(janmFest.isMajor === true, 'Marked as major festival');

// 3. MAHA SHIVARATRI
console.log('\n▸ 3. Verifying Maha Shivaratri (Phalguna/Magha Krishna Chaturdashi):');
const shivPanchang = calculatePanchang(new Date(2026, 1, 15, 6, 0, 0), delhi);
const shivFest = shivPanchang.todayFestival;
assert(shivFest.title.includes('Maha Shivaratri'), 'Title includes "Maha Shivaratri"');
assert(shivFest.icon === '🔱', 'Icon is 🔱 for Maha Shivaratri');
assert(shivFest.isMajor === true, 'Marked as major festival');

// 4. HOLI & HOLIKA DAHAN
console.log('\n▸ 4. Verifying Holika Dahan & Rangwali Holi (Phalguna Purnima & Chaitra Pratipada):');
const holikaPanchang = calculatePanchang(new Date(2026, 2, 3, 6, 0, 0), delhi);
assert(holikaPanchang.todayFestival.title.includes('Holika Dahan'), 'Phalguna Purnima is Holika Dahan');
assert(holikaPanchang.todayFestival.icon === '🔥', 'Holika Dahan icon is 🔥');

const holiPanchang = calculatePanchang(new Date(2026, 2, 4, 6, 0, 0), delhi);
assert(holiPanchang.todayFestival.title.includes('Holi'), 'Pratipada is Rangwali Holi');
assert(holiPanchang.todayFestival.icon === '🎨', 'Holi icon is 🎨');
assert(holiPanchang.todayFestival.isMajor === true, 'Holi marked as major festival');

// 5. RAM NAVAMI
console.log('\n▸ 5. Verifying Ram Navami (Chaitra Shukla Navami):');
const ramPanchang = calculatePanchang(new Date(2026, 1, 25, 6, 0, 0), delhi);
assert(ramPanchang.todayFestival.title.includes('Ram Navami'), 'Chaitra Shukla Navami is Ram Navami');
assert(ramPanchang.todayFestival.icon === '🏹', 'Ram Navami icon is 🏹');
assert(ramPanchang.todayFestival.isMajor === true, 'Ram Navami marked as major festival');

// 6. GANESH CHATURTHI
console.log('\n▸ 6. Verifying Ganesh Chaturthi (Bhadrapada Shukla Chaturthi):');
const ganeshPanchang = calculatePanchang(new Date(2026, 8, 15, 6, 0, 0), delhi);
assert(ganeshPanchang.todayFestival.title.includes('Ganesh Chaturthi'), 'Shukla Chaturthi is Ganesh Chaturthi');
assert(ganeshPanchang.todayFestival.icon === '🌺', 'Ganesh Chaturthi icon is 🌺');
assert(ganeshPanchang.todayFestival.isMajor === true, 'Ganesh Chaturthi marked as major festival');

// 7. MAKAR SANKRANTI
console.log('\n▸ 7. Verifying Makar Sankranti (Solar Ingress into Makara):');
const sankrantiPanchang = calculatePanchang(new Date(2026, 0, 15, 6, 0, 0), delhi);
assert(sankrantiPanchang.todayFestival.title.includes('Makar Sankranti'), 'Title is Makar Sankranti');
assert(sankrantiPanchang.todayFestival.icon === '🪁', 'Makar Sankranti icon is 🪁');

// 8. NON-FESTIVAL DAY DEFAULT DISPLAY
console.log('\n▸ 8. Verifying Non-Festival Day Default:');
// 2 Sep 2026: Krishna Panchami (regular day)
const regPanchang = calculatePanchang(new Date(2026, 8, 2, 6, 0, 0), delhi);
assert(regPanchang.todayFestival.title === 'Nitya Panchang (नित्य पञ्चाङ्ग)', 'Regular day displays "Nitya Panchang"');
assert(regPanchang.todayFestival.isMajor === false, 'Regular day is not marked as major');

// 9. UPCOMING OBSERVANCE FORWARD SCANNER
console.log('\n▸ 9. Verifying Upcoming Observance Forward Scanner:');
const testDate = new Date(2026, 8, 4, 10, 0, 0); // Today (4 Sep 2026)
const upcoming = findUpcomingMajorFestival(testDate, delhi);
assert(Boolean(upcoming.name), `Upcoming festival identified: "${upcoming.name}"`);
assert(upcoming.daysRemaining > 0, `Days remaining (${upcoming.daysRemaining}) is positive`);
assert(Boolean(upcoming.dateFormatted), `Formatted date present: "${upcoming.dateFormatted}"`);
assert(Boolean(upcoming.icon), `Upcoming icon present: "${upcoming.icon}"`);
assert(upcoming.badge.includes('day') || upcoming.badge === 'Tomorrow', `Badge contains days count: "${upcoming.badge}"`);

// 10. LIST OF UPCOMING FESTIVALS
console.log('\n▸ 10. Verifying List of Upcoming Festivals:');
const upcomingList = getUpcomingFestivalsList(testDate, delhi, 8);
assert(upcomingList.length >= 5, `Retrieved ${upcomingList.length} upcoming festivals (>= 5)`);
assert(upcomingList.some(f => f.name.includes('Ganesh Chaturthi')), 'Includes Ganesh Chaturthi in forward list');
assert(upcomingList.some(f => f.name.includes('Ekadashi')), 'Includes Ekadashis in forward list');

console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
if (passed === total) {
  console.log('  🎉 ALL FESTIVAL DETERMINATION & DASHBOARD ASSERTIONS PASSED WITH ZERO ERRORS!');
}
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
