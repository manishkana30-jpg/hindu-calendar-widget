import assert from 'assert';
import { getCityCode } from '../src/lib/cities';

console.log('Testing City Code Resolution:');
const tests = [
  { input: 'Ghaziabad', expected: 'GHZ' },
  { input: 'Ghaziabad (GPS)', expected: 'GHZ' },
  { input: 'Ghaziabad, Uttar Pradesh', expected: 'GHZ' },
  { input: 'New York', expected: 'NYK' },
  { input: 'New York (United States)', expected: 'NYK' },
  { input: 'New Delhi', expected: 'DEL' },
  { input: 'Mumbai', expected: 'BOM' },
  { input: 'Bengaluru', expected: 'BLR' },
  { input: 'Varanasi', expected: 'VNS' },
  { input: 'London', expected: 'LON' },
  { input: 'Tokyo', expected: 'TKY' }
];

for (const t of tests) {
  const code = getCityCode(t.input);
  console.log(`  ✓ ${t.input.padEnd(25)} -> [${code}]`);
  assert.strictEqual(code, t.expected);
}

console.log('\n🎉 ALL CITY CODES VERIFIED ACCORDING TO USER SPECIFICATION!');
