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
// Nirnayasindhu: Holika Dahan requires Purnima active during Pradosha twilight (2 Mar 2026)
const holikaPanchang = calculatePanchang(new Date(2026, 2, 2, 6, 0, 0), delhi);
assert(holikaPanchang.todayFestival.title.includes('Holika Dahan'), 'Phalguna Purnima is Holika Dahan');
assert(holikaPanchang.todayFestival.icon === '🔥', 'Holika Dahan icon is 🔥');

const holiPanchang = calculatePanchang(new Date(2026, 2, 3, 6, 0, 0), delhi);
assert(holiPanchang.todayFestival.title.includes('Holi'), 'Day after Holika Dahan is Rangwali Holi');
assert(holiPanchang.todayFestival.icon === '🎨', 'Holi icon is 🎨');
assert(holiPanchang.todayFestival.isMajor === true, 'Holi marked as major festival');

// 5. RAM NAVAMI
console.log('\n▸ 5. Verifying Ram Navami (Chaitra Shukla Navami):');
const ramPanchang = calculatePanchang(new Date(2026, 2, 26, 6, 0, 0), delhi);
assert(ramPanchang.todayFestival.title.includes('Ram Navami'), 'Chaitra Shukla Navami is Ram Navami');
assert(ramPanchang.todayFestival.icon === '🏹', 'Ram Navami icon is 🏹');
assert(ramPanchang.todayFestival.isMajor === true, 'Ram Navami marked as major festival');

// 6. GANESH CHATURTHI
console.log('\n▸ 6. Verifying Ganesh Chaturthi (Bhadrapada Shukla Chaturthi):');
// Dharmasindhu: Ganesh Murti Sthapana requires Shukla Chaturthi in Madhyahna (14 Sep 2026)
const ganeshPanchang = calculatePanchang(new Date(2026, 8, 14, 6, 0, 0), delhi);
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

// 11. RADHA ASHTAMI (Bhadrapada Shukla Ashtami in Madhyahna)
console.log('\n▸ 11. Verifying Radha Ashtami (Bhadrapada Shukla Ashtami):');
const radhaPanchang = calculatePanchang(new Date(2026, 8, 19, 6, 0, 0), delhi);
assert(radhaPanchang.todayFestival.title.includes('Radha Ashtami'), 'Bhadrapada Shukla Ashtami is Radha Ashtami');
assert(radhaPanchang.todayFestival.icon === '🪷', 'Radha Ashtami icon is 🪷');
assert(radhaPanchang.todayFestival.isMajor === true, 'Radha Ashtami marked as major festival');
assert(Boolean(radhaPanchang.todayFestival.briefRule?.hindi), 'Radha Ashtami has bilingual Dharmashastra rule');

// 12. AHOI ASHTAMI (Kartika Krishna Ashtami in Sayahna)
console.log('\n▸ 12. Verifying Ahoi Ashtami (Kartika Krishna Ashtami):');
const ahoiPanchang = calculatePanchang(new Date(2026, 10, 1, 6, 0, 0), delhi);
assert(ahoiPanchang.todayFestival.title.includes('Ahoi Ashtami'), 'Kartika Krishna Ashtami is Ahoi Ashtami');
assert(ahoiPanchang.todayFestival.icon === '🌟', 'Ahoi Ashtami icon is 🌟');
assert(ahoiPanchang.todayFestival.isMajor === true, 'Ahoi Ashtami marked as major festival');

// 13. GOPASHTAMI (Kartika Shukla Ashtami)
console.log('\n▸ 13. Verifying Gopashtami (Kartika Shukla Ashtami):');
const gopPanchang = calculatePanchang(new Date(2026, 10, 17, 6, 0, 0), delhi);
assert(gopPanchang.todayFestival.title.includes('Gopashtami'), 'Kartika Shukla Ashtami is Gopashtami');
assert(gopPanchang.todayFestival.icon === '🐄', 'Gopashtami icon is 🐄');
assert(gopPanchang.todayFestival.isMajor === true, 'Gopashtami marked as major festival');

// 14. KALABHAIRAV JAYANTI (Margashirsha Krishna Ashtami in Nishita)
console.log('\n▸ 14. Verifying Kalabhairav Jayanti (Margashirsha Krishna Ashtami):');
const bhairavPanchang = calculatePanchang(new Date(2026, 10, 30, 6, 0, 0), delhi);
assert(bhairavPanchang.todayFestival.title.includes('Kalabhairav Jayanti'), 'Margashirsha Krishna Ashtami is Kalabhairav Jayanti');
assert(bhairavPanchang.todayFestival.icon === '🔱', 'Kalabhairav Jayanti icon is 🔱');
assert(bhairavPanchang.todayFestival.isMajor === true, 'Kalabhairav Jayanti marked as major festival');

// 15. SHEETALA ASHTAMI (Chaitra Krishna Ashtami / Basoda)
console.log('\n▸ 15. Verifying Sheetala Ashtami (Chaitra Krishna Ashtami):');
const sheetalaPanchang = calculatePanchang(new Date(2026, 2, 11, 6, 0, 0), delhi);
assert(sheetalaPanchang.todayFestival.title.includes('Sheetala Ashtami'), 'Chaitra Krishna Ashtami is Sheetala Ashtami');
assert(sheetalaPanchang.todayFestival.icon === '🌸', 'Sheetala Ashtami icon is 🌸');

// 16. BHISHMA ASHTAMI (Magha Shukla Ashtami)
console.log('\n▸ 16. Verifying Bhishma Ashtami (Magha Shukla Ashtami):');
const bhishmaPanchang = calculatePanchang(new Date(2026, 0, 26, 6, 0, 0), delhi);
assert(bhishmaPanchang.todayFestival.title.includes('Bhishma Ashtami'), 'Magha Shukla Ashtami is Bhishma Ashtami');
assert(bhishmaPanchang.todayFestival.icon === '🏹', 'Bhishma Ashtami icon is 🏹');

// 17. MASIK DURGASHTAMI (Monthly Shukla Ashtami)
console.log('\n▸ 17. Verifying Masik Durgashtami (Monthly Shukla Ashtami):');
const masikDurgaPanchang = calculatePanchang(new Date(2026, 3, 24, 6, 0, 0), delhi);
assert(masikDurgaPanchang.todayFestival.title.includes('Masik Durgashtami'), 'Vaishakha Shukla Ashtami is Masik Durgashtami');
assert(masikDurgaPanchang.todayFestival.icon === '🔱', 'Masik Durgashtami icon is 🔱');

// 18. MASIK KALASHTAMI (Monthly Krishna Ashtami)
console.log('\n▸ 18. Verifying Masik Kalashtami (Monthly Krishna Ashtami):');
const masikKalaPanchang = calculatePanchang(new Date(2026, 4, 10, 6, 0, 0), delhi);
assert(masikKalaPanchang.todayFestival.title.includes('Masik Kalashtami'), 'Vaishakha Krishna Ashtami is Masik Kalashtami');
assert(masikKalaPanchang.todayFestival.icon === '🔱', 'Masik Kalashtami icon is 🔱');

// 19. MASIK SHIVARATRI (Monthly Krishna Chaturdashi)
console.log('\n▸ 19. Verifying Masik Shivaratri (Monthly Krishna Chaturdashi):');
const masikShivaPanchang = calculatePanchang(new Date(2026, 6, 13, 6, 0, 0), delhi);
assert(masikShivaPanchang.todayFestival.title.includes('Masik Shivaratri'), 'Ashadha Krishna Chaturdashi is Masik Shivaratri');
assert(masikShivaPanchang.todayFestival.icon === '🔱', 'Masik Shivaratri icon is 🔱');

console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
if (passed === total) {
  console.log('  🎉 ALL FESTIVAL DETERMINATION & DASHBOARD ASSERTIONS PASSED WITH ZERO ERRORS!');
}
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
