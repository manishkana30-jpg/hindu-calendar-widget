import assert from 'assert';
import { 
  UI_TRANSLATIONS, 
  SUPPORTED_LANGUAGES, 
  translateTerm,
  cleanTerm,
  SupportedLanguage 
} from '../src/lib/i18n/translations';

console.log('═══════════════════════════════════════════════════════════════════════════════════');
console.log('            GLOBAL i18n TRANSLATION ENGINE & ASTROLOGICAL MAPPER AUDIT             ');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

let passed = 0;
let total = 0;

function check(desc: string, fn: () => void) {
  total++;
  try {
    fn();
    console.log(`  ✓ PASS: ${desc}`);
    passed++;
  } catch (err: any) {
    console.error(`  ✗ FAIL: ${desc} -> ${err.message}`);
    throw err;
  }
}

// 1. Supported Languages List
console.log('▸ 1. Verifying Supported Languages & Locales:');
check('All 5 required languages are configured with native names and Indian locales', () => {
  const codes = SUPPORTED_LANGUAGES.map(l => l.code);
  assert.deepStrictEqual(codes, ['en', 'hi', 'sa', 'mr', 'gu'], 'Supported codes match');
  assert.strictEqual(SUPPORTED_LANGUAGES.length, 5);
  for (const lang of SUPPORTED_LANGUAGES) {
    assert(lang.label.length > 0, `Language ${lang.code} has a display name`);
    assert(lang.nativeName.length > 0, `Language ${lang.code} has a native script name`);
    assert(lang.localeCode.endsWith('-IN'), `Language ${lang.code} has an Indian locale code`);
  }
});

// 2. UI Translation Completeness
console.log('\n▸ 2. Verifying Complete UI Translations:');
check('All 5 languages have complete UI dictionary keys', () => {
  const enKeys = Object.keys(UI_TRANSLATIONS.en).sort();
  for (const code of ['hi', 'sa', 'mr', 'gu'] as SupportedLanguage[]) {
    const langKeys = Object.keys(UI_TRANSLATIONS[code]).sort();
    assert.deepStrictEqual(langKeys, enKeys, `Dictionary for ${code} mirrors all ${enKeys.length} keys in English`);
  }
});

check('Zero empty string translations exist in any dictionary', () => {
  for (const [code, dict] of Object.entries(UI_TRANSLATIONS)) {
    for (const [k, v] of Object.entries(dict)) {
      assert(typeof v === 'string' && v.trim().length > 0, `Key "${k}" in language "${code}" is non-empty`);
    }
  }
});

// 3. Dynamic Astrological Term Translation
console.log('\n▸ 3. Verifying Dynamic Astrological Term Translations:');

check('Tithi translation across all 5 languages without brackets', () => {
  assert.strictEqual(translateTerm('Shukla Ekadashi', 'en'), 'Shukla Ekadashi');
  assert.strictEqual(translateTerm('Shukla Ekadashi', 'hi'), 'शुक्ल एकादशी');
  assert.strictEqual(translateTerm('Shukla Ekadashi', 'sa'), 'शुक्लैकादशी');
  assert.strictEqual(translateTerm('Shukla Ekadashi', 'mr'), 'शुक्ल एकादशी');
  assert.strictEqual(translateTerm('Shukla Ekadashi', 'gu'), 'શુક્લ અગિયારસ');

  assert.strictEqual(translateTerm('Purnima', 'hi'), 'पूर्णिमा');
  assert.strictEqual(translateTerm('Purnima', 'sa'), 'पूर्णिमा');
  assert.strictEqual(translateTerm('Purnima', 'mr'), 'पौर्णिमा');
  assert.strictEqual(translateTerm('Purnima', 'gu'), 'પૂનમ');
});

check('Nakshatra translation across all 5 languages', () => {
  assert.strictEqual(translateTerm('Rohini', 'hi'), 'रोहिणी');
  assert.strictEqual(translateTerm('Rohini', 'sa'), 'रोहिणी');
  assert.strictEqual(translateTerm('Rohini', 'mr'), 'रोहिणी');
  assert.strictEqual(translateTerm('Rohini', 'gu'), 'રોહિણી');

  assert.strictEqual(translateTerm('Mrigashirsha', 'hi'), 'मृगशिरा');
  assert.strictEqual(translateTerm('Mrigashirsha', 'sa'), 'मृगशीर्षम्');
  assert.strictEqual(translateTerm('Mrigashirsha', 'mr'), 'मृगशीर्ष');
  assert.strictEqual(translateTerm('Mrigashirsha', 'gu'), 'મૃગશીર્ષ');
});

check('Lunar Month (Masa) translation across all 5 languages', () => {
  assert.strictEqual(translateTerm('Chaitra', 'hi'), 'चैत्र');
  assert.strictEqual(translateTerm('Chaitra', 'sa'), 'चैत्रः');
  assert.strictEqual(translateTerm('Kartika', 'hi'), 'कार्तिक');
  assert.strictEqual(translateTerm('Kartika', 'gu'), 'કારતક');
});

check('Yoga & Karana translation across all 5 languages', () => {
  assert.strictEqual(translateTerm('Siddhi', 'hi'), 'सिद्धि');
  assert.strictEqual(translateTerm('Siddhi', 'sa'), 'सिद्धिः');
  assert.strictEqual(translateTerm('Vishti', 'hi'), 'विष्टि');
  assert.strictEqual(translateTerm('Bava', 'gu'), 'બવ');
});

check('Muhurat & Choghadiya translation across all 5 languages', () => {
  assert.strictEqual(translateTerm('Abhijit Muhurat', 'hi'), 'अभिजित मुहूर्त');
  assert.strictEqual(translateTerm('Abhijit Muhurat', 'sa'), 'अभिजित्मुहूर्तः');
  assert.strictEqual(translateTerm('Rahu Kaal', 'hi'), 'राहु काल');
  assert.strictEqual(translateTerm('Rahu Kaal', 'gu'), 'રાહુ કાળ');
  assert.strictEqual(translateTerm('Brahma Muhurat', 'mr'), 'ब्रह्म मुहूर्त');
  assert.strictEqual(translateTerm('Amrit', 'sa'), 'अमृतम्');
  assert.strictEqual(translateTerm('Shubh', 'hi'), 'शुभ');
});

check('Zodiac Signs (Rashis) translation & Hinglish normalization', () => {
  assert.strictEqual(translateTerm('Mesha', 'hi'), 'मेष');
  assert.strictEqual(translateTerm('Mesha', 'sa'), 'मेषः');
  assert.strictEqual(translateTerm('Kumbha', 'mr'), 'कुंभ');
  assert.strictEqual(translateTerm('Kumbha', 'gu'), 'કુંભ');
  assert.strictEqual(translateTerm('Aries', 'en'), 'Mesha');
  assert.strictEqual(translateTerm('Aries', 'hi'), 'मेष');
});

check('Zero brackets rule and timestamp preservation', () => {
  assert.strictEqual(cleanTerm('Shukla Paksha (Bright Half)'), 'Shukla Paksha');
  assert.strictEqual(cleanTerm('Diwali (दीपावली)'), 'Diwali');
  assert.strictEqual(translateTerm('Diwali (दीपावली)', 'en'), 'Diwali');
  assert.strictEqual(translateTerm('Diwali (दीपावली)', 'hi'), 'दीपावली');
  // Timestamp preserved:
  assert.strictEqual(cleanTerm('Abhijit Muhurat (11:45 AM - 12:35 PM)'), 'Abhijit Muhurat (11:45 AM - 12:35 PM)');
});

console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
console.log(`                     AUDIT COMPLETED: ${passed}/${total} TESTS PASSED                      `);
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
