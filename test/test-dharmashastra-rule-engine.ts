import assert from 'assert';
import { getMonthVedicCalendar, PRESET_LOCATIONS } from '../src/lib/vedic-astronomy';
import { resolveDharmaShastraRule } from '../src/lib/panchang/dharmaShastraRuleEngine';
import { UI_TRANSLATIONS, SupportedLanguage, TranslationDictionary } from '../src/lib/i18n/translations';

console.log('=== TESTING DHARMA SHASTRA RULE ENGINE ===');

const location = PRESET_LOCATIONS[0]; // New Delhi
const daysNov2026 = getMonthVedicCalendar(2026, 10, location); // Nov 2026 has 30 days

assert.strictEqual(daysNov2026.length, 30, 'November 2026 must have 30 days');

const tEn = (key: keyof TranslationDictionary) => UI_TRANSLATIONS.en[key] || String(key);
const tHi = (key: keyof TranslationDictionary) => UI_TRANSLATIONS.hi[key] || String(key);

// Test default day rule
const day1 = daysNov2026[0];
const ruleDay1En = resolveDharmaShastraRule(day1, 'en', tEn);
const ruleDay1Hi = resolveDharmaShastraRule(day1, 'hi', tHi);

console.log('Day 1 (En):', ruleDay1En.fullRule);
console.log('Day 1 (Hi):', ruleDay1Hi.fullRule);

assert(ruleDay1En.fullRule.includes('Dharma Shastra'), 'En rule includes prefix');
assert(ruleDay1Hi.fullRule.includes('धर्मशास्त्र नियम'), 'Hi rule includes prefix');
assert(!ruleDay1En.fullRule.includes('(') && !ruleDay1En.fullRule.includes(')'), 'No brackets in En rule');
assert(!ruleDay1Hi.fullRule.includes('(') && !ruleDay1Hi.fullRule.includes(')'), 'No brackets in Hi rule');

// Find an Ekadashi in Nov 2026
const ekadashiDay = daysNov2026.find(d => d.udayaTithi.isEkadashi);
if (ekadashiDay) {
  const ekRuleEn = resolveDharmaShastraRule(ekadashiDay, 'en', tEn);
  console.log('Ekadashi Rule (En):', ekRuleEn.fullRule);
  assert(ekRuleEn.fullRule.toLowerCase().includes('ekadashi') || ekRuleEn.fullRule.toLowerCase().includes('vedha'), 'Ekadashi rule mentions vedha or ekadashi');
}

// Find a Pradosh in Nov 2026
const pradoshDay = daysNov2026.find(d => d.udayaTithi.index === 13 || d.udayaTithi.index === 28 || (d.festival && d.festival.toLowerCase().includes('pradosh')));
if (pradoshDay) {
  const pradoshRuleEn = resolveDharmaShastraRule(pradoshDay, 'en', tEn);
  console.log('Pradosh Rule (En):', pradoshRuleEn.fullRule);
  assert(pradoshRuleEn.fullRule.toLowerCase().includes('pradosh'), 'Pradosh rule mentions pradosh');
}

// Check zero brackets across all 30 days in English and Hindi
for (const day of daysNov2026) {
  const rEn = resolveDharmaShastraRule(day, 'en', tEn);
  const rHi = resolveDharmaShastraRule(day, 'hi', tHi);
  assert(!rEn.fullRule.includes('(') && !rEn.fullRule.includes(')'), `Day ${day.dayNumber} has no brackets in En: ${rEn.fullRule}`);
  assert(!rHi.fullRule.includes('(') && !rHi.fullRule.includes(')'), `Day ${day.dayNumber} has no brackets in Hi: ${rHi.fullRule}`);
}

console.log('🎉 ALL DHARMA SHASTRA RULE ENGINE ASSERTIONS PASSED!');
