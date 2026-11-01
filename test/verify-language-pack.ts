import assert from 'assert';
import { TRANSLATIONS, getUserPreferredLanguage, setUserPreferredLanguage, toggleUserPreferredLanguage, getLocalizedShastraRule } from '../src/lib/user-language';

console.log('═══════════════════════════════════════════════════════════════════════════════════');
console.log('             LANGUAGE PACK & MANUAL PREFERENCE OVERRIDE AUDIT                      ');
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

// 1. Structure Audit
console.log('▸ 1. Verifying Language Pack Dictionary Integrity:');
check('Both "en" and "hi" language packs exist', () => {
  assert(Boolean(TRANSLATIONS.en), 'English pack exists');
  assert(Boolean(TRANSLATIONS.hi), 'Hindi pack exists');
});

check('All keys in English pack are mirrored in Hindi pack', () => {
  const enKeys = Object.keys(TRANSLATIONS.en).sort();
  const hiKeys = Object.keys(TRANSLATIONS.hi).sort();
  assert.deepStrictEqual(enKeys, hiKeys, 'English and Hindi dictionaries have 100% identical key sets');
});

check('No empty string values in translations', () => {
  for (const [k, v] of Object.entries(TRANSLATIONS.en)) {
    assert(typeof v === 'string' && v.trim().length > 0, `English key "${k}" is non-empty`);
  }
  for (const [k, v] of Object.entries(TRANSLATIONS.hi)) {
    assert(typeof v === 'string' && v.trim().length > 0, `Hindi key "${k}" is non-empty`);
  }
});

// 2. Simulated Browser Environment for Storage & Override
console.log('\n▸ 2. Verifying Manual Preference Override Mechanism:');

// Mock localStorage and window
const storageMock: Record<string, any> = {};
(global as any).localStorage = {
  getItem: (key: string) => storageMock[key] || null,
  setItem: (key: string, val: string) => { storageMock[key] = val; },
  removeItem: (key: string) => { delete storageMock[key]; }
};
(global as any).window = {
  dispatchEvent: () => true,
  addEventListener: () => {},
  removeEventListener: () => {}
};
(global as any).CustomEvent = class {
  type: string;
  detail: any;
  constructor(type: string, params: any) {
    this.type = type;
    this.detail = params?.detail;
  }
};

check('Default fallback returns "en" when unconfigured', () => {
  delete storageMock['preferred_language'];
  delete storageMock['manual_language_override'];
  assert(getUserPreferredLanguage() === 'en', 'Default language is English');
});

check('Manual selection of Hindi sets preferred_language and manual override flag', () => {
  setUserPreferredLanguage('hi');
  assert(storageMock['preferred_language'] === 'hi', 'preferred_language saved as "hi"');
  assert(storageMock['manual_language_override'] === 'true', 'manual_language_override flag set to "true"');
  assert(getUserPreferredLanguage() === 'hi', 'getUserPreferredLanguage returns "hi"');
});

check('Toggle language switches between Hindi and English', () => {
  const next1 = toggleUserPreferredLanguage();
  assert(next1 === 'en', 'Toggled to English');
  assert(storageMock['preferred_language'] === 'en', 'Storage reflects English');

  const next2 = toggleUserPreferredLanguage();
  assert(next2 === 'hi', 'Toggled back to Hindi');
  assert(storageMock['preferred_language'] === 'hi', 'Storage reflects Hindi');
});

check('getLocalizedShastraRule returns only selected language rule', () => {
  const sampleRule = {
    hindi: 'धर्मसिन्धु: एकादशी व्रत में अन्न त्याग आवश्यक है।',
    english: 'Dharmasindhu: Fasting from grains on Ekadashi is mandatory.'
  };

  const hiResult = getLocalizedShastraRule(sampleRule, 'hi');
  assert(hiResult === sampleRule.hindi, 'Returns exact Hindi rule');

  const enResult = getLocalizedShastraRule(sampleRule, 'en');
  assert(enResult === sampleRule.english, 'Returns exact English rule');
});

console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
console.log('  🎉 LANGUAGE PACK & MANUAL OVERRIDE FULLY VALIDATED!');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
