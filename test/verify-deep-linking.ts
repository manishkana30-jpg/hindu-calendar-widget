/**
 * Verification Test Suite for Notification Deep-Linking & Warm-Tab Navigation
 * DailyTithi.com — High-Precision Vedic Panchang PWA
 */

import fs from 'fs';
import path from 'path';

let passed = 0;
let total = 0;

function assert(condition: boolean, desc: string, extra?: string) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✓ PASS: ${desc}`);
  } else {
    console.error(`  ✗ FAIL: ${desc} ${extra || ''}`);
    throw new Error(`Failed: ${desc}`);
  }
}

async function runDeepLinkingAudit() {
  console.log('═══════════════════════════════════════════════════════════════════════════════════');
  console.log('       NOTIFICATION DEEP-LINKING & WARM-TAB RESOLUTION AUDIT                      ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

  // ── TEST 1: Service Worker Deep-Link & Warm-Tab Logic (public/sw.js) ─────────
  console.log('▸ 1. Verifying Service Worker Deep-Link & Warm-Tab Resolution:');
  const swCode = fs.readFileSync('public/sw.js', 'utf8');

  assert(swCode.includes("event.action === 'open_muhurat'"), 'sw.js checks open_muhurat action');
  assert(swCode.includes('/?view=muhurat'), 'sw.js maps open_muhurat to /?view=muhurat');
  assert(swCode.includes("viewAction = 'muhurat'"), 'sw.js sets viewAction to muhurat');

  assert(swCode.includes("event.action === 'open_panchang'"), 'sw.js checks open_panchang action');
  assert(swCode.includes('/?view=calendar'), 'sw.js maps open_panchang to /?view=calendar');
  assert(swCode.includes("viewAction = 'calendar'"), 'sw.js sets viewAction to calendar');

  assert(swCode.includes("type: 'NOTIFICATION_NAVIGATE'"), 'sw.js posts NOTIFICATION_NAVIGATE to warm client tabs');
  assert(swCode.includes('client.postMessage'), 'sw.js sends message to active window client');
  assert(swCode.includes('client.navigate(targetUrl)'), 'sw.js navigates warm client to targetUrl');
  assert(swCode.includes('client.focus()'), 'sw.js focuses warm client window');
  assert(swCode.includes('clients.openWindow(targetUrl)'), 'sw.js opens targetUrl on cold start');

  // ── TEST 2: Push Payload Action Alignment (dailySummaryPayload.ts) ───────────
  console.log('\n▸ 2. Verifying Push Payload Action Definitions:');
  const payloadCode = fs.readFileSync('src/lib/push/dailySummaryPayload.ts', 'utf8');

  assert(payloadCode.includes("action: 'open_panchang'"), 'Payload defines open_panchang action');
  assert(payloadCode.includes("title: '📖 Open Full Panchang'"), 'open_panchang title is "📖 Open Full Panchang"');
  assert(payloadCode.includes("action: 'open_muhurat'"), 'Payload defines open_muhurat action');
  assert(payloadCode.includes("title: '⏱️ Muhurat Timings'"), 'open_muhurat title is "⏱️ Muhurat Timings"');

  // ── TEST 3: Client-Side Deep-Link Listener Hook (useNotificationNavigation.ts) ─
  console.log('\n▸ 3. Verifying useNotificationNavigation Hook & Handlers:');
  const hookCode = fs.readFileSync('src/hooks/useNotificationNavigation.ts', 'utf8');

  assert(hookCode.includes("useSearchParams"), 'Hook imports and calls useSearchParams()');
  assert(hookCode.includes("searchParams.get('view')"), 'Hook inspects view search parameter');
  assert(hookCode.includes("viewParam === 'muhurat'"), 'Hook detects view === muhurat');
  assert(hookCode.includes("viewParam === 'calendar'"), 'Hook detects view === calendar');
  assert(hookCode.includes("event.data?.type === 'NOTIFICATION_NAVIGATE'"), 'Hook listens for NOTIFICATION_NAVIGATE from Service Worker');
  assert(hookCode.includes("navigator.serviceWorker.addEventListener('message'"), 'Hook registers message listener on serviceWorker');
  assert(hookCode.includes("scrollIntoView({ behavior: 'smooth'"), 'Hook smoothly scrolls active view into screen');
  assert(hookCode.includes("window.history.replaceState"), 'Hook cleans query parameter when modal closes');

  // ── TEST 4: App Layout Suspense Boundary Mounting (app/layout.tsx) ───────────
  console.log('\n▸ 4. Verifying App Router Suspense Boundary & Component Wiring:');
  const layoutCode = fs.readFileSync('app/layout.tsx', 'utf8');
  const handlerCode = fs.readFileSync('app/components/NotificationNavigationHandler.tsx', 'utf8');

  assert(layoutCode.includes('NotificationNavigationHandler'), 'app/layout.tsx imports NotificationNavigationHandler');
  assert(layoutCode.includes('<Suspense fallback={null}>'), 'layout.tsx wraps client handler in Suspense fallback={null}');
  assert(layoutCode.includes('<NotificationNavigationHandler />'), 'layout.tsx mounts NotificationNavigationHandler');
  assert(handlerCode.includes('useNotificationNavigation()'), 'NotificationNavigationHandler executes useNotificationNavigation');

  // ── TEST 5: Zero 'any' Types Strictness Audit ───────────────────────────────
  console.log('\n▸ 5. Verifying Strict TypeScript Compliance (Zero `any`):');
  const filesToCheck = [
    'src/hooks/useNotificationNavigation.ts',
    'app/components/NotificationNavigationHandler.tsx'
  ];

  for (const relPath of filesToCheck) {
    const content = fs.readFileSync(relPath, 'utf8');
    // Match any usage of ': any' or 'as any'
    const anyMatches = content.match(/:\s*any\b|\bas\s+any\b/g) || [];
    assert(anyMatches.length === 0, `${relPath} contains zero 'any' types (found: ${anyMatches.length})`);
  }

  // ── TEST 6: Immutable Widget & Ephemeris Guard ──────────────────────────────
  console.log('\n▸ 6. Verifying Immutability of Core Ephemeris & Main Widget:');
  const ephemerisContent = fs.readFileSync('src/lib/ephemeris.ts', 'utf8');
  const widgetContent = fs.readFileSync('app/components/HinduPanchangWidget.tsx', 'utf8');
  const crypto = await import('crypto');
  const ephemerisHash = crypto.createHash('sha256').update(ephemerisContent).digest('hex').toUpperCase();
  const widgetHash = crypto.createHash('sha256').update(widgetContent).digest('hex').toUpperCase();

  assert(
    ephemerisHash === 'FD2634FEF955FE7C5817AD37B05BA16214273E0BDA58819F94EBE35654170D79',
    'src/lib/ephemeris.ts is 100% byte-for-byte identical'
  );
  assert(
    widgetHash === '911DBB750B1C4267FC5C69B6E862DC24F43CC6C39484302BE8C5C0FCB995720A',
    'app/components/HinduPanchangWidget.tsx is 100% byte-for-byte identical'
  );

  console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
  console.log('  🎉 NOTIFICATION DEEP-LINKING & WARM-TAB RESOLUTION FULLY VERIFIED!');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
}

runDeepLinkingAudit().catch((err) => {
  console.error('\nAudit Failed:', err);
  process.exit(1);
});
