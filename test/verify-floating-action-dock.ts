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
  console.log('       FLOATING QUICK-ACTION DOCK ARCHITECTURE & ZERO-REGRESSION AUDIT            ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

  // ── TEST 1: FloatingActionDock Component Architecture & Surface Styling ─────
  console.log('▸ 1. Verifying FloatingActionDock Component Architecture:');
  const dockContent = fs.readFileSync('src/components/FloatingActionDock.tsx', 'utf8');

  assert(dockContent.includes('fixed bottom-5'), 'Fixed bottom-5 positioning');
  assert(dockContent.includes('z-40'), 'z-index set to 40 (avoids modal collision)');
  assert(dockContent.includes('bg-slate-900/85'), 'Luxury glassmorphic bg-slate-900/85 surface');
  assert(dockContent.includes('backdrop-blur-xl'), 'Premium backdrop-blur-xl enabled');
  assert(dockContent.includes('border border-white/10'), 'Cosmic border border-white/10 styling');
  assert(dockContent.includes('shadow-[0_8px_32px_rgba(0,0,0,0.5)]'), 'Deep cosmic elevation shadow');
  assert(dockContent.includes('left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0'), 'Mobile-first centering with desktop bottom-right dock pinning');

  // ── TEST 2: The Three Consolidated Actions Presence & Styling ───────────────
  console.log('\n▸ 2. Verifying Three Consolidated Dock Actions:');
  
  // Action A: Share Today's Panchang
  assert(dockContent.includes('bg-emerald-950/70'), 'Share button uses emerald gradient accent');
  assert(dockContent.includes('text-emerald-300'), 'Share button text colored text-emerald-300');
  assert(dockContent.includes('WhatsAppIcon'), 'Share button renders WhatsAppIcon');
  assert(dockContent.includes('Share Tithi'), 'Share button renders "Share Tithi" label on desktop');

  // Action B: Daily Alerts
  assert(dockContent.includes('bg-amber-950/70'), 'Alerts button uses amber/gold accent');
  assert(dockContent.includes('text-amber-300'), 'Alerts button text colored text-amber-300');
  assert(dockContent.includes('Bell'), 'Alerts button renders Bell icon');
  assert(dockContent.includes('Daily Alerts'), 'Alerts button renders "Daily Alerts" label');
  assert(dockContent.includes('animate-ping'), 'Alerts button includes pulse ring for unsubscribed state');

  // Action C: Get App (PWA)
  assert(dockContent.includes('bg-sky-950/70'), 'Get App button uses sky/cyan accent');
  assert(dockContent.includes('text-sky-300'), 'Get App button text colored text-sky-300');
  assert(dockContent.includes('ArrowDownToLine'), 'Get App button renders download icon');
  assert(dockContent.includes('Get App'), 'Get App button renders "Get App" label');
  assert(dockContent.includes('Installed ✓'), 'Get App button gracefully handles installed state');

  // ── TEST 3: Modal & Dialog Hooks Wiring ─────────────────────────────────────
  console.log('\n▸ 3. Verifying Integrated Modal Dialogs:');
  assert(dockContent.includes('<DeviceSetupModal'), 'Dock mounts DeviceSetupModal for alerts & sound guide');
  assert(dockContent.includes('<PWAInstallModal'), 'Dock mounts PWAInstallModal for manual/iOS PWA guide');

  // ── TEST 4: App Layout Wiring & Redundancy Removal ──────────────────────────
  console.log('\n▸ 4. Verifying Root Layout Integration:');
  const layoutContent = fs.readFileSync('app/layout.tsx', 'utf8');
  assert(layoutContent.includes('<FloatingActionDock'), 'app/layout.tsx mounts <FloatingActionDock />');
  assert(!layoutContent.includes('<FloatingInstallShare'), 'app/layout.tsx removed old standalone floating launcher');

  // ── TEST 5: usePwaInstall Hook Architecture ─────────────────────────────────
  console.log('\n▸ 5. Verifying usePwaInstall Hook:');
  const hookContent = fs.readFileSync('src/hooks/usePwaInstall.ts', 'utf8');
  assert(hookContent.includes('beforeinstallprompt'), 'Hooks into beforeinstallprompt event');
  assert(hookContent.includes('appinstalled'), 'Hooks into appinstalled event');
  assert(hookContent.includes('display-mode: standalone'), 'Detects standalone PWA mode');
  assert(hookContent.includes('promptInstall'), 'Exposes promptInstall trigger');

  // ── TEST 6: Strict TypeScript Compliance (Zero any) ─────────────────────────
  console.log('\n▸ 6. Verifying Strict TypeScript Compliance (Zero any):');
  const filesToCheck = [
    'src/components/FloatingActionDock.tsx',
    'src/hooks/usePwaInstall.ts',
    'app/components/PWAInstallModal.tsx',
    'app/components/FloatingInstallShare.tsx'
  ];

  for (const relPath of filesToCheck) {
    const content = fs.readFileSync(relPath, 'utf8');
    const anyMatches = content.match(/:\s*any\b|\bas\s+any\b/g) || [];
    assert(anyMatches.length === 0, `${relPath} contains zero 'any' types (found: ${anyMatches.length})`);
  }

  // ── TEST 7: WhatsApp Payload Exact Assembling Check ─────────────────────────
  console.log('\n▸ 7. Verifying Share Greeting Payload Assembly:');
  const today = new Date(2026, 9, 10, 12, 0, 0);
  const pData = calculatePanchang(today, PRESET_LOCATIONS[0]);
  const shareData = buildShareDataFromPanchang(today, pData);
  const payload = formatPanchangShareText(shareData);

  assert(payload.includes('🌅 Aaj Ka Panchang • Daily Tithi'), 'Payload contains header');
  assert(payload.includes('📅'), 'Payload contains calendar line');
  assert(payload.includes('🪔 Tithi:'), 'Payload contains Tithi line');
  assert(payload.includes('⏳ Tithi Ends:'), 'Payload contains Tithi Ends line');
  assert(payload.includes('🟢 Shubh Window:'), 'Payload contains Shubh Window line');
  assert(payload.includes('🔴 Rahu Kaal:'), 'Payload contains Rahu Kaal line');
  assert(payload.includes('🛡️ Panchak:'), 'Payload contains Panchak line');
  assert(payload.includes('https://dailytithi.com'), 'Payload links back to https://dailytithi.com');

  console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
  console.log('  🎉 FLOATING ACTION DOCK AUDIT 100% SUCCESSFUL!');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
}

runFloatingDockAudit().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
