import fs from 'fs';
import path from 'path';

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

async function runJsonLdVerification() {
  console.log('═══════════════════════════════════════════════════════════════════════════════════');
  console.log('       SEO JSON-LD STRUCTURED DATA & DEDUPLICATION AUDIT                           ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

  // ── TEST 1: Deduplication Guard ───────────────────────────────────────────
  console.log('▸ 1. Verifying Single Global JSON-LD Script Injection:');
  const appDir = path.resolve('app');
  const findScriptTags = (dir: string): string[] => {
    let results: string[] = [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        results = results.concat(findScriptTags(fullPath));
      } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
        const content = fs.readFileSync(fullPath, 'utf8');
        if (content.includes('type="application/ld+json"')) {
          results.push(path.relative(process.cwd(), fullPath).replace(/\\/g, '/'));
        }
      }
    }
    return results;
  };

  const scriptFiles = findScriptTags(appDir);
  assert(scriptFiles.length === 1, `Exactly one file in app/ renders application/ld+json (found: ${scriptFiles.length})`);
  assert(scriptFiles[0] === 'app/layout.tsx', `Only app/layout.tsx renders global JSON-LD (found: ${scriptFiles[0]})`);

  const pageContent = fs.readFileSync('app/page.tsx', 'utf8');
  assert(!pageContent.includes('application/ld+json'), 'app/page.tsx does not inject duplicate JSON-LD');

  const cityPageContent = fs.readFileSync('app/panchang/[city]/page.tsx', 'utf8');
  assert(!cityPageContent.includes('application/ld+json'), 'app/panchang/[city]/page.tsx does not inject duplicate JSON-LD');

  // ── TEST 2: Schema Compliance & aggregateRating ───────────────────────────
  console.log('\n▸ 2. Verifying SoftwareApplication Schema & aggregateRating:');
  const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
  
  assert(layoutContent.includes("'@type': 'SoftwareApplication'"), "Schema defines '@type': 'SoftwareApplication'");
  assert(layoutContent.includes("'@id': 'https://dailytithi.com/#software'"), "Schema defines '@id': 'https://dailytithi.com/#software'");
  assert(layoutContent.includes("name: 'Daily Tithi'"), "Schema defines name: 'Daily Tithi'");
  assert(layoutContent.includes("url: 'https://dailytithi.com/'"), "Schema defines url: 'https://dailytithi.com/'");
  assert(layoutContent.includes("applicationCategory: 'LifestyleApplication'"), "Schema defines applicationCategory: 'LifestyleApplication'");
  assert(layoutContent.includes("operatingSystem: 'All (Web, Android, iOS, Windows, macOS)'"), 'Schema defines cross-platform operatingSystem');
  assert(layoutContent.includes('browserRequirements:'), 'Schema defines browserRequirements');
  assert(layoutContent.includes("price: '0'"), "Schema defines free offer price: '0'");
  assert(layoutContent.includes("priceCurrency: 'USD'"), "Schema defines priceCurrency: 'USD'");
  assert(layoutContent.includes("'@type': 'AggregateRating'"), "Schema includes '@type': 'AggregateRating'");
  assert(layoutContent.includes("ratingValue: '4.9'"), "aggregateRating specifies ratingValue: '4.9'");
  assert(layoutContent.includes("ratingCount: '128'"), "aggregateRating specifies ratingCount: '128'");
  assert(layoutContent.includes("bestRating: '5'"), "aggregateRating specifies bestRating: '5'");
  assert(layoutContent.includes("worstRating: '1'"), "aggregateRating specifies worstRating: '1'");

  // ── TEST 3: Production Build HTML Single Tag Verification ──────────────────
  console.log('\n▸ 3. Verifying Single JSON-LD Tag in Production Build HTML:');
  const indexHtmlPath = path.resolve('.next/server/app/index.html');
  if (fs.existsSync(indexHtmlPath)) {
    const html = fs.readFileSync(indexHtmlPath, 'utf8');
    const regex = /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    const matches = [...html.matchAll(regex)];
    assert(matches.length === 1, `Production index.html contains exactly 1 JSON-LD script (found: ${matches.length})`);
    
    const parsed = JSON.parse(matches[0][1]);
    const software = parsed['@graph']?.find((item: Record<string, unknown>) => item['@type'] === 'SoftwareApplication');
    assert(!!software, 'Production HTML contains SoftwareApplication in @graph');
    assert(software?.aggregateRating?.ratingValue === '4.9', 'Production HTML contains ratingValue 4.9');
    assert(software?.aggregateRating?.ratingCount === '128', 'Production HTML contains ratingCount 128');
  }

  // ── TEST 4: Zero 'any' Types ──────────────────────────────────────────────
  console.log('\n▸ 4. Verifying Strict TypeScript Compliance (Zero any):');
  const anyMatches = layoutContent.match(/:\s*any\b|\bas\s+any\b/g) || [];
  assert(anyMatches.length === 0, `app/layout.tsx contains zero 'any' types (found: ${anyMatches.length})`);

  console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
  console.log('  🎉 SEO JSON-LD & AGGREGATE RATING FULLY VERIFIED!');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
}

runJsonLdVerification().catch((err) => {
  console.error('Audit run error:', err);
  process.exit(1);
});
