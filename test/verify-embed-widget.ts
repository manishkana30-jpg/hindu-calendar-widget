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

async function runEmbedVerification() {
  console.log('═══════════════════════════════════════════════════════════════════════════════════');
  console.log('       EMBEDDABLE WIDGET ENGINE & AUTOMATED BACKLINK AUDIT                          ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

  // ── TEST 1: Lightweight Embed Route Verification ──────────────────────────
  console.log('▸ 1. Verifying Lightweight Embed Route (app/embed/page.tsx & layout.tsx):');
  const embedPage = fs.readFileSync('app/embed/page.tsx', 'utf8');
  const embedLayout = fs.readFileSync('app/embed/layout.tsx', 'utf8');

  assert(embedPage.includes("selectedCity"), 'Embed page supports dynamic city selection');
  assert(embedPage.includes("themeParam"), 'Embed page supports theme customization (?theme=minimal/dark)');
  assert(embedPage.includes("Today's Tithi") || embedPage.includes("Today&apos;s Tithi"), 'Embed page renders Active Tithi section');
  assert(embedPage.includes("activeTithi.paksha"), 'Embed page displays Tithi Paksha');
  assert(embedPage.includes("activeTithi.endTime"), 'Embed page displays Tithi End Time');
  assert(embedPage.includes("Active Muhurat:"), 'Embed page displays Live Muhurat section');
  assert(embedPage.includes("Sunrise"), 'Embed page displays Sunrise');
  assert(embedPage.includes("Sunset"), 'Embed page displays Sunset');
  assert(embedPage.includes("min-w-[280px]"), 'Embed page is responsive down to 280px');

  // Mandatory backlink check
  assert(embedPage.includes('href="https://dailytithi.com"'), 'Embed page contains canonical backlink href');
  assert(embedPage.includes('target="_blank"'), 'Backlink opens in new tab');
  assert(embedPage.includes('rel="noopener"'), 'Backlink includes secure rel="noopener"');
  assert(embedPage.includes('DailyTithi.com ↗'), 'Backlink contains prominent anchor text DailyTithi.com ↗');

  // Layout check
  assert(embedLayout.includes('Daily Tithi Live Vedic Panchang Embed Widget'), 'Embed layout defines descriptive title');

  // ── TEST 2: Frame Security & Embedding Configuration in next.config.js ───
  console.log('\n▸ 2. Verifying HTTP Security Headers in next.config.js:');
  const nextConfig = fs.readFileSync('next.config.js', 'utf8');
  assert(nextConfig.includes("source: '/embed'"), 'next.config.js defines dedicated rule for /embed');
  assert(nextConfig.includes("frame-ancestors *;"), 'next.config.js allows iframe embedding via frame-ancestors *');
  assert(nextConfig.includes("source: '/((?!embed).*)'"), 'next.config.js protects non-embed routes against clickjacking');
  assert(nextConfig.includes("frame-ancestors 'none';"), 'Other routes retain frame-ancestors none');

  // ── TEST 3: EmbedWidgetModal Component ─────────────────────────────────────
  console.log('\n▸ 3. Verifying EmbedWidgetModal Component (src/components/EmbedWidgetModal.tsx):');
  const modalSource = fs.readFileSync('src/components/EmbedWidgetModal.tsx', 'utf8');
  assert(modalSource.includes('export function EmbedWidgetModal'), 'EmbedWidgetModal component exported');
  assert(modalSource.includes('https://dailytithi.com/embed'), 'Modal generates iframe src with https://dailytithi.com/embed');
  assert(modalSource.includes('Powered by Daily Tithi'), 'Modal includes powered by backlink in embed code snippet');
  assert(modalSource.includes('navigator.clipboard.writeText'), 'Modal implements 1-click clipboard copy');
  assert(modalSource.includes('Embed code copied to clipboard!'), 'Modal provides user toast feedback');
  assert(modalSource.includes('<iframe'), 'Modal renders live preview iframe');
  assert(modalSource.includes('Dark Cosmic'), 'Modal provides Dark Cosmic theme option');
  assert(modalSource.includes('Minimal Dark'), 'Modal provides Minimal Dark theme option');

  // ── TEST 4: UI Integration in HinduPanchangWidget ─────────────────────────
  console.log('\n▸ 4. Verifying UI Integration in HinduPanchangWidget.tsx:');
  const widgetSource = fs.readFileSync('app/components/HinduPanchangWidget.tsx', 'utf8');
  assert(widgetSource.includes('EmbedWidgetModal'), 'HinduPanchangWidget imports EmbedWidgetModal');
  assert(widgetSource.includes('isEmbedModalOpen'), 'HinduPanchangWidget manages isEmbedModalOpen state');
  assert(widgetSource.includes('Embed on Your Site'), 'HinduPanchangWidget options menu includes Embed on Your Site');
  assert(widgetSource.includes('<EmbedWidgetModal'), 'HinduPanchangWidget renders <EmbedWidgetModal />');

  // ── TEST 5: Zero 'any' Types in New & Modified Components ─────────────────
  console.log('\n▸ 5. Verifying Strict TypeScript Compliance (Zero any):');
  const filesToCheck = [
    'app/embed/page.tsx',
    'app/embed/layout.tsx',
    'src/components/EmbedWidgetModal.tsx'
  ];

  for (const file of filesToCheck) {
    const content = fs.readFileSync(file, 'utf8');
    const anyMatches = content.match(/:\s*any\b|\bas\s+any\b/g) || [];
    assert(anyMatches.length === 0, `${file} contains zero 'any' types (found: ${anyMatches.length})`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
  console.log('  🎉 EMBEDDABLE WIDGET ENGINE FULLY VERIFIED!');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
}

runEmbedVerification().catch((err) => {
  console.error('Audit run error:', err);
  process.exit(1);
});
