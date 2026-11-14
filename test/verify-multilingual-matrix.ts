import fs from 'fs';
import path from 'path';
import { TOP_CITIES, REGIONAL_CITY_NAMES, getLocalizedCityName } from '../src/lib/constants/cities';

let total = 0;
let passed = 0;

function assert(condition: boolean, message: string) {
  total++;
  if (!condition) {
    console.error(`  ✗ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passed++;
  console.log(`  ✓ PASS: ${message}`);
}

export async function runMultilingualMatrixVerification() {
  console.log('═══════════════════════════════════════════════════════════════════════════════════');
  console.log('   MULTI-LINGUAL PROGRAMMATIC MATRIX & HREFLANG BIDIRECTIONAL AUDIT                ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

  // ── TEST 1: Regional City Registry & Localized Names ──────────────────────────
  console.log('▸ 1. Verifying Regional City Registry (Hindi, Marathi, Gujarati):');
  const citySlugs = Object.keys(TOP_CITIES);
  assert(citySlugs.length >= 60, `Registry contains 60+ cities (actual: ${citySlugs.length})`);

  // Verify sample cities have valid Marathi and Gujarati names
  const delhi = TOP_CITIES['new-delhi'];
  assert(getLocalizedCityName(delhi, 'en') === 'New Delhi', 'English name for New Delhi is correct');
  assert(getLocalizedCityName(delhi, 'hi') === 'नई दिल्ली', 'Hindi name for New Delhi is correct');
  assert(getLocalizedCityName(delhi, 'mr') === 'नवी दिल्ली', 'Marathi name for New Delhi is correct');
  assert(getLocalizedCityName(delhi, 'gu') === 'નવી દિલ્હી', 'Gujarati name for New Delhi is correct');

  const varanasi = TOP_CITIES['varanasi'];
  assert(getLocalizedCityName(varanasi, 'hi') === 'वाराणसी', 'Hindi name for Varanasi is correct');
  assert(getLocalizedCityName(varanasi, 'mr') === 'वाराणसी', 'Marathi name for Varanasi is correct');
  assert(getLocalizedCityName(varanasi, 'gu') === 'વારાણસી', 'Gujarati name for Varanasi is correct');

  const mumbai = TOP_CITIES['mumbai'];
  assert(getLocalizedCityName(mumbai, 'hi') === 'मुंबई', 'Hindi name for Mumbai is correct');
  assert(getLocalizedCityName(mumbai, 'mr') === 'मुंबई', 'Marathi name for Mumbai is correct');
  assert(getLocalizedCityName(mumbai, 'gu') === 'મુંબઈ', 'Gujarati name for Mumbai is correct');

  // ── TEST 2: Bidirectional hreflang on English Route ───────────────────────────
  console.log('\n▸ 2. Verifying Bidirectional hreflang on English Route (/panchang/[city]):');
  const enPagePath = path.resolve('app/panchang/[city]/page.tsx');
  assert(fs.existsSync(enPagePath), 'app/panchang/[city]/page.tsx exists');
  const enContent = fs.readFileSync(enPagePath, 'utf8');

  assert(enContent.includes("'en-IN':"), "English page defines hreflang 'en-IN'");
  assert(enContent.includes("'hi-IN':"), "English page defines hreflang 'hi-IN'");
  assert(enContent.includes("'mr-IN':"), "English page defines hreflang 'mr-IN'");
  assert(enContent.includes("'gu-IN':"), "English page defines hreflang 'gu-IN'");
  assert(enContent.includes("'x-default':"), "English page defines hreflang 'x-default'");

  // ── TEST 3: Multi-Lingual Programmatic City Route ─────────────────────────────
  console.log('\n▸ 3. Verifying Regional Route (/[lang]/panchang/[city]/page.tsx):');
  const regPagePath = path.resolve('app/[lang]/panchang/[city]/page.tsx');
  assert(fs.existsSync(regPagePath), 'app/[lang]/panchang/[city]/page.tsx exists');
  const regContent = fs.readFileSync(regPagePath, 'utf8');

  assert(regContent.includes("VALID_LANGS: SupportedLanguage[] = ['hi', 'mr', 'gu']"), "Route supports ['hi', 'mr', 'gu']");
  assert(regContent.includes('export const revalidate = 3600;'), 'Regional route has 1-hour ISR revalidation');
  assert(regContent.includes('export const dynamicParams = true;'), 'Regional route allows dynamicParams');
  assert(regContent.includes('generateStaticParams'), 'Regional route exports generateStaticParams');
  assert(regContent.includes("'en-IN':"), "Regional page defines hreflang 'en-IN'");
  assert(regContent.includes("'hi-IN':"), "Regional page defines hreflang 'hi-IN'");
  assert(regContent.includes("'mr-IN':"), "Regional page defines hreflang 'mr-IN'");
  assert(regContent.includes("'gu-IN':"), "Regional page defines hreflang 'gu-IN'");
  assert(regContent.includes("'x-default':"), "Regional page defines hreflang 'x-default'");
  assert(regContent.includes('<LanguageProvider'), 'Regional page wraps content with LanguageProvider');
  assert(regContent.includes('initialLanguage={lang as SupportedLanguage}'), 'Regional page passes initialLanguage to HinduPanchangWidget');

  // ── TEST 4: Sitemap Indexing for Regional Matrix ──────────────────────────────
  console.log('\n▸ 4. Verifying Sitemap Regional URLs (app/sitemap.ts):');
  const sitemapPath = path.resolve('app/sitemap.ts');
  const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

  assert(sitemapContent.includes("['hi', 'mr', 'gu'].flatMap"), "app/sitemap.ts iterates over ['hi', 'mr', 'gu']");
  assert(sitemapContent.includes('regionalCityUrls'), 'app/sitemap.ts defines regionalCityUrls');
  assert(sitemapContent.includes('${baseUrl}/${lang}/panchang/${slug}'), 'app/sitemap.ts constructs regional city URLs');

  // ── TEST 5: Interactive City Search Modal ─────────────────────────────────────
  console.log('\n▸ 5. Verifying City Search Modal (app/components/CitySearchModal.tsx):');
  const modalPath = path.resolve('app/components/CitySearchModal.tsx');
  assert(fs.existsSync(modalPath), 'app/components/CitySearchModal.tsx exists');
  const modalContent = fs.readFileSync(modalPath, 'utf8');

  assert(modalContent.includes('export function CitySearchModal'), 'Exports CitySearchModal component');
  assert(modalContent.includes('POPULAR_SLUGS'), 'Includes POPULAR_SLUGS quick-picks');
  assert(modalContent.includes('matchMr'), 'Filters by Marathi name');
  assert(modalContent.includes('matchGu'), 'Filters by Gujarati name');
  assert(modalContent.includes('getCityLink'), 'Computes language-aware city links');

  // Check integration into Navbars
  const homeContent = fs.readFileSync('app/page.tsx', 'utf8');
  assert(homeContent.includes('<CitySearchModal />'), 'CitySearchModal is embedded in app/page.tsx navbar');
  assert(enContent.includes('<CitySearchModal />'), 'CitySearchModal is embedded in app/panchang/[city]/page.tsx navbar');
  assert(regContent.includes('<CitySearchModal />'), 'CitySearchModal is embedded in app/[lang]/panchang/[city]/page.tsx navbar');

  console.log(`\n===================================================================`);
  console.log(`  ALL ${passed}/${total} MULTI-LINGUAL MATRIX & CITY SEARCH TESTS PASSED!`);
  console.log(`===================================================================\n`);
}

runMultilingualMatrixVerification().catch((err) => {
  console.error(err);
  process.exit(1);
});
