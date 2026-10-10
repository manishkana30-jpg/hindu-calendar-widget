/**
 * Verification Test Suite for Device Setup & Reliable Alert Guide Modal
 * 
 * Audits:
 * 1. Strict TypeScript Compliance (Zero 'any' types in DeviceSetupModal.tsx)
 * 2. 4 Step-by-Step Android Optimization Cards (Battery, Data, Lock Screen, Ringtone)
 * 3. OEM Quick-Switch Guidance (Samsung One UI, Xiaomi HyperOS, OnePlus OxygenOS, Pixel)
 * 4. iOS PWA Home Screen & Lock Screen Checkmarks Requirements
 * 5. Desktop Windows Focus Assist & macOS Notification Center Requirements
 * 6. Storage Dismissal & Checklist State Persistence
 * 7. BackgroundAlertsSetup Integration (Status Banner & Discreet Triggers)
 */

import fs from 'fs';
import assert from 'assert';

console.log('═══════════════════════════════════════════════════════════════════════════════════');
console.log('       DEVICE SETUP & RELIABLE ALERT GUIDE MODAL VERIFICATION AUDIT                ');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

let passedCount = 0;
let totalCount = 0;

function check(label: string, condition: boolean) {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`  ✓ PASS: ${label}`);
  } else {
    console.error(`  ✗ FAIL: ${label}`);
    throw new Error(`Assertion failed: ${label}`);
  }
}

// ── TEST 1: Strict Typing Audit (Zero 'any' Types) ───────────────────────────
console.log('▸ 1. Verifying Strict TypeScript Compliance (Zero `any`):');
const modalCode = fs.readFileSync('src/components/DeviceSetupModal.tsx', 'utf8');
const alertsCode = fs.readFileSync('src/components/BackgroundAlertsSetup.tsx', 'utf8');

const modalAnyMatches = modalCode.match(/:\s*any\b|\bas\s+any\b|<any>/g) || [];
check('DeviceSetupModal.tsx contains zero `any` types', modalAnyMatches.length === 0);

const alertsAnyMatches = alertsCode.match(/:\s*any\b|\bas\s+any\b|<any>/g) || [];
check('BackgroundAlertsSetup.tsx contains zero `any` types', alertsAnyMatches.length === 0);

// ── TEST 2: 4 Core Android Optimization Steps ────────────────────────────────
console.log('\n▸ 2. Verifying 4 Step-by-Step Android Optimization Cards:');
check('Step 1: Disable Battery Restrictions present', modalCode.includes('Disable Battery Restrictions') && modalCode.includes('Unrestricted'));
check('Step 2: Background Data Usage present', modalCode.includes('Background Data Usage') && modalCode.includes('Unrestricted Data Usage'));
check('Step 3: Lock-Screen Content Visibility present', modalCode.includes('Lock-Screen Content Visibility') && modalCode.includes('Show All Content'));
check('Step 4: Sacred Sound & Ringtone present', modalCode.includes('Sacred Alert Sound') && modalCode.includes('Notification Categories / Channels'));

// ── TEST 3: OEM Vendor Quick-Switch Guidance ─────────────────────────────────
console.log('\n▸ 3. Verifying OEM Vendor Menu Guidance:');
check('Samsung One UI guidance included', modalCode.includes('Samsung One UI') && modalCode.includes('Sleeping apps'));
check('Xiaomi MIUI / HyperOS guidance included', modalCode.includes('Xiaomi MIUI / HyperOS') && modalCode.includes('Autostart'));
check('OnePlus / Oppo OxygenOS guidance included', modalCode.includes('OnePlus / Oppo OxygenOS') && modalCode.includes('Allow background activity'));
check('Google Pixel / Stock Android guidance included', modalCode.includes('Google Pixel / Stock Android') && modalCode.includes('App battery usage'));

// ── TEST 4: iOS PWA & Lock-Screen Permissions Guidance ────────────────────────
console.log('\n▸ 4. Verifying iOS PWA & Lock-Screen Requirements:');
check('iOS Install as Home Screen App card present', modalCode.includes('Install as Home Screen App') && modalCode.includes('Add to Home Screen ⊞'));
check('iOS Lock Screen checkmarks guidance present', modalCode.includes('iOS Settings') && modalCode.includes('Notifications') && modalCode.includes('Banners'));
check('iOS Sleep Focus & Scheduled Summary bypass present', modalCode.includes('Bypass Sleep Focus') && modalCode.includes('Allowed Apps'));

// ── TEST 5: Desktop Focus Assist & Notification Center Guidance ───────────────
console.log('\n▸ 5. Verifying Desktop Platform Support:');
check('Windows Focus Assist guidance present', modalCode.includes('Windows Focus Assist') && modalCode.includes('Show notification banners'));
check('macOS Notification Center Alerts style present', modalCode.includes('macOS Alert Style') && modalCode.includes('Alerts'));

// ── TEST 6: Component State, LocalStorage & Test Action ──────────────────────
console.log('\n▸ 6. Verifying Storage Persistence & Interactive Test Dispatcher:');
check('Dismissal state key daily_tithi_device_setup_viewed checked', modalCode.includes('daily_tithi_device_setup_viewed'));
check('Checklist progress key daily_tithi_device_setup_checklist stored', modalCode.includes('daily_tithi_device_setup_checklist'));
check('Send Test Alert to Verify action button present', modalCode.includes('Send Test Alert to Verify'));

// ── TEST 7: BackgroundAlertsSetup Integration ────────────────────────────────
console.log('\n▸ 7. Verifying BackgroundAlertsSetup Component Integration:');
check('BackgroundAlertsSetup imports DeviceSetupModal', alertsCode.includes("import { DeviceSetupModal } from './DeviceSetupModal';"));
check('BackgroundAlertsSetup renders Informational Status Banner', alertsCode.includes('Notifications delivered at High Urgency. If alerts are delayed on locked devices, configure your phone') && alertsCode.includes('battery and lock-screen permissions.'));
check('BackgroundAlertsSetup renders Configure Device Settings button', alertsCode.includes('Configure Device Settings ⚙️'));
check('BackgroundAlertsSetup renders Ensure Lock-Screen Delivery button', alertsCode.includes('⚙️ Ensure Lock-Screen Delivery'));
check('BackgroundAlertsSetup renders Device Reliability Setup button', alertsCode.includes('Device Reliability Setup'));

console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${passedCount}/${totalCount} Assertions Passed`);
console.log('  🎉 ALL DEVICE SETUP MODAL & RELIABILITY CONTRACTS VERIFIED!');
console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
