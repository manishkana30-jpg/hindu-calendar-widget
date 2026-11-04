import {
  formatNormalizedPakshaTithi,
  cleanMasaMonthName,
  formatTithiEndTime
} from '../src/lib/vedic-astronomy';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  } else {
    console.log(`✅ PASSED: ${msg}`);
  }
}

console.log('--- TEST 1: Paksha & Tithi Normalization ([Paksha]- [Tithi]) ---');
// English cases
assert(
  formatNormalizedPakshaTithi('Krishna', 'Krishna Saptami', 'en', 'Saptami') === 'Krishna- Saptami',
  'Krishna + Saptami -> Krishna- Saptami'
);
assert(
  formatNormalizedPakshaTithi('Krishna', 'Krishna Paksha . Krishna Saptami', 'en') === 'Krishna- Saptami',
  'Redundant "Krishna Paksha . Krishna Saptami" -> Krishna- Saptami'
);
assert(
  formatNormalizedPakshaTithi('Shukla', 'Shukla Ekadashi', 'en', 'Ekadashi') === 'Shukla- Ekadashi',
  'Shukla + Ekadashi -> Shukla- Ekadashi'
);
assert(
  formatNormalizedPakshaTithi('Shukla', 'Shukla Pratipada', 'en', 'Pratipada') === 'Shukla- Pratipada',
  'Shukla + Pratipada -> Shukla- Pratipada'
);
assert(
  formatNormalizedPakshaTithi('Shukla', 'Shukla Purnima', 'en', 'Purnima') === 'Shukla- Purnima',
  'Shukla + Purnima -> Shukla- Purnima'
);
assert(
  formatNormalizedPakshaTithi('Krishna', 'Krishna Amavasya', 'en', 'Amavasya') === 'Krishna- Amavasya',
  'Krishna + Amavasya -> Krishna- Amavasya'
);

// Hindi cases
assert(
  formatNormalizedPakshaTithi('Krishna', 'Krishna Saptami', 'hi', 'Saptami') === 'कृष्ण- सप्तमी',
  'Hindi: Krishna + Saptami -> कृष्ण- सप्तमी'
);
assert(
  formatNormalizedPakshaTithi('Krishna', 'कृष्ण पक्ष • कृष्ण सप्तमी', 'hi') === 'कृष्ण- सप्तमी',
  'Hindi: Redundant कृष्ण पक्ष • कृष्ण सप्तमी -> कृष्ण- सप्तमी'
);
assert(
  formatNormalizedPakshaTithi('Shukla', 'Shukla Ekadashi', 'hi', 'Ekadashi') === 'शुक्ल- एकादशी',
  'Hindi: Shukla + Ekadashi -> शुक्ल- एकादशी'
);
assert(
  formatNormalizedPakshaTithi('Shukla', 'Shukla Pratipada', 'hi', 'Pratipada') === 'शुक्ल- प्रतिपदा',
  'Hindi: Shukla + Pratipada -> शुक्ल- प्रतिपदा'
);
assert(
  formatNormalizedPakshaTithi('Shukla', 'Shukla Purnima', 'hi', 'Purnima') === 'शुक्ल- पूर्णिमा',
  'Hindi: Shukla + Purnima -> शुक्ल- पूर्णिमा'
);
assert(
  formatNormalizedPakshaTithi('Krishna', 'Krishna Amavasya', 'hi', 'Amavasya') === 'कृष्ण- अमावस्या',
  'Hindi: Krishna + Amavasya -> कृष्ण- अमावस्या'
);

console.log('\n--- TEST 2: Masa Column Cleanup (No "Masa" Suffix) ---');
assert(cleanMasaMonthName('Kartika', 'en') === 'Kartika', 'Kartika (en) -> Kartika');
assert(cleanMasaMonthName('Kartika Masa', 'en') === 'Kartika', 'Kartika Masa (en) -> Kartika');
assert(cleanMasaMonthName('Kartika (Purnimanta)', 'en') === 'Kartika', 'Kartika (Purnimanta) (en) -> Kartika');
assert(cleanMasaMonthName('Margashirsha Masa', 'en') === 'Margashirsha', 'Margashirsha Masa (en) -> Margashirsha');
assert(cleanMasaMonthName('Chaitra Masa', 'en') === 'Chaitra', 'Chaitra Masa (en) -> Chaitra');
assert(cleanMasaMonthName('Vaisakha Masa', 'en') === 'Vaishakha', 'Vaisakha Masa (en) -> Vaishakha');

assert(cleanMasaMonthName('Kartika', 'hi') === 'कार्तिक', 'Kartika (hi) -> कार्तिक');
assert(cleanMasaMonthName('Kartika Masa', 'hi') === 'कार्तिक', 'Kartika Masa (hi) -> कार्तिक');
assert(cleanMasaMonthName('कार्तिक मास', 'hi') === 'कार्तिक', 'कार्तिक मास (hi) -> कार्तिक');
assert(cleanMasaMonthName('Margashirsha Masa', 'hi') === 'मार्गशीर्ष', 'Margashirsha Masa (hi) -> मार्गशीर्ष');
assert(cleanMasaMonthName('Chaitra Masa', 'hi') === 'चैत्र', 'Chaitra Masa (hi) -> चैत्र');
assert(cleanMasaMonthName('Vaisakha Masa', 'hi') === 'वैशाख', 'Vaisakha Masa (hi) -> वैशाख');

console.log('\n--- TEST 3: Tithi End Time Formatting ---');
assert(formatTithiEndTime('08:42 PM', 'en') === 'upto 08:42 PM', 'English time -> upto 08:42 PM');
assert(formatTithiEndTime('08:42 PM', 'hi') === 'तक 08:42 PM', 'Hindi time -> तक 08:42 PM');
assert(formatTithiEndTime('Full Day', 'en') === 'Full Day', 'Full Day (en) -> Full Day');
assert(formatTithiEndTime('Full Day', 'hi') === 'पूरा दिन', 'Full Day (hi) -> पूरा दिन');

console.log('\n🎉 ALL ALMANAC & PANCHANG REFACTOR TESTS PASSED PERFECTLY!');
