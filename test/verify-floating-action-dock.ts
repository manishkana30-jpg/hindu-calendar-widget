import fs from 'fs';
import { calculatePanchang, PRESET_LOCATIONS } from '../src/lib/vedic-astronomy';
import { buildShareDataFromPanchang, formatPanchangShareText } from '../src/lib/utils/sharePanchang';

let total = 0;
let passed = 0;

function assert(condition: boolean, message: string) {
  total++;
  if (!condition) {
    console.error(`  ❌ FAIL: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passed++;
  console.log(`  ✓ PASS: ${message}`);
}

async function runFloatingDockAudit() {
  console.log('═══════════════════════════════════════════════════════════════════════════════════');
  console.log('       PWA INSTALL & HEADER SHARE RELOCATION ARCHITECTURE AUDIT                    ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

  // ── TEST 1: Floating Dock Removal from Layout ────────────────────────────────
  console.log('▸ 1. Verifying Floating Dock Decommission in Root Layout:');
  const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
  assert(!layoutContent.includes('<FloatingActionDock'), 'app/layout.tsx does NOT mount <FloatingActionDock />');
  assert(!layoutContent.includes('<FloatingInstallShare'), 'app/layout.tsx removed floating launcher');

  // ── TEST 2: Consolidated Header Row Share Button Integration ─────────────────
  console.log('\n▸ 2. Verifying Compact Share Button in Consolidated Header Row:');
  const widgetContent = fs.readFileSync('app/components/HinduPanchangWidget.tsx', 'utf8');
  assert(widgetContent.includes('handleShare'), 'Widget implements handleShare function');
  assert(widgetContent.includes('WhatsAppIcon'), 'Widget renders WhatsAppIcon');
  assert(widgetContent.includes('aria-label="Share on WhatsApp"'), 'Share button has accessible aria-label="Share on WhatsApp"');
  assert(widgetContent.includes('Link copied to clipboard!'), 'Share handler provides clipboard toast fallback');

  // ── TEST 3: usePwaInstall Hook Architecture ─────────────────────────────────
  console.log('\n▸ 3. Verifying usePwaInstall Hook Architecture:');
  const hookContent = fs.readFileSync('src/hooks/usePwaInstall.ts', 'utf8');
  assert(hookContent.includes('beforeinstallprompt'), 'Hooks into beforeinstallprompt event');
  assert(hookContent.includes('appinstalled'), 'Hooks into appinstalled event');
  assert(hookContent.includes('display-mode: standalone'), 'Detects standalone PWA mode');
  assert(hookContent.includes('pwa_installed'), 'Persists and checks localStorage pwa_installed flag');
  assert(hookContent.includes('canInstall'), 'Exposes canInstall boolean');
  assert(hookContent.includes('promptInstall'), 'Exposes promptInstall trigger');

  // ── TEST 4: PWAInstallButton Bulletproof Visibility Guard ───────────────────
  console.log('\n▸ 4. Verifying PWAInstallButton Component:');
  const buttonContent = fs.readFileSync('app/components/PWAInstallButton.tsx', 'utf8');
  assert(buttonContent.includes('!isMounted || !canInstall || isInstalled'), 'Enforces triple-layer visibility check');
  assert(buttonContent.includes('PWAInstallModal'), 'Mounts PWAInstallModal for iOS/manual fallback');

  // ── TEST 5: Strict TypeScript Compliance (Zero any) ─────────────────────────
  console.log('\n▸ 5. Verifying Strict TypeScript Compliance (Zero any):');
  const filesToCheck = [
    'src/hooks/usePwaInstall.ts',
    'app/components/PWAInstallButton.tsx',
    'app/components/PWAInstallModal.tsx'
  ];

  for (const relPath of filesToCheck) {
    const content = fs.readFileSync(relPath, 'utf8');
    const anyMatches = content.match(/:\s*any\b|\bas\s+any\b/g) || [];
    assert(anyMatches.length === 0, `${relPath} contains zero 'any' types (found: ${anyMatches.length})`);
  }

  // ── TEST 6: Share Greeting Payload Assembly Check ────────────────────────────
  console.log('\n▸ 6. Verifying Share Greeting Payload Assembly:');
  const today = new Date(2026, 9, 10, 12, 0, 0);
  const pData = calculatePanchang(today, PRESET_LOCATIONS[0]);
  const shareData = buildShareDataFromPanchang(today, pData);
  const payload = formatPanchangShareText(shareData);

  assert(payload.includes('🌅 Aaj Ka Panchang • Daily Tithi'), 'Payload contains header');
  assert(payload.includes('https://dailytithi.com'), 'Payload links back to https://dailytithi.com');

  console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
  console.log('  🎉 AUDIT 100% SUCCESSFUL!');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
}

runFloatingDockAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
