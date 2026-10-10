import fs from 'fs';
import { 
  formatPanchangShareText, 
  buildShareDataFromPanchang, 
  sharePanchang,
  PanchangShareData 
} from '../src/lib/utils/sharePanchang';
import { calculatePanchang, PRESET_LOCATIONS } from '../src/lib/vedic-astronomy';

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

async function runShareVerification() {
  console.log('═══════════════════════════════════════════════════════════════════════════════════');
  console.log('       WHATSAPP PANCHANG SHARING & DYNAMIC PAYLOAD AUDIT                           ');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');

  // ── TEST 1: Exact Payload Assembly Matching Specification ───────────────────
  console.log('▸ 1. Verifying Formatted Greeting Card Text Payload:');
  const sampleData: PanchangShareData = {
    date: new Date(2026, 9, 10), // 10 Oct 2026
    vara: 'Saturday (शनिवार)',
    tithiName: 'Krishna Pratipada',
    significance: 'Deity: Agni',
    tithiEndTime: '04:32 PM',
    auspiciousWindow: '11:45 AM – 12:33 PM (Abhijit Muhurat)',
    rahuKaalWindow: '09:15 AM – 10:45 AM',
    panchakStatus: 'No Active Panchak (Free)',
    appUrl: 'https://dailytithi.com'
  };

  const output = formatPanchangShareText(sampleData);

  assert(output.includes('🌅 Aaj Ka Panchang • Daily Tithi'), 'Header includes 🌅 Aaj Ka Panchang • Daily Tithi');
  assert(output.includes('📅 Saturday (शनिवार), 10 October 2026'), 'Date line formats {Vara}, {Day} {Month} {Year}');
  assert(output.includes('🪔 Tithi: Krishna Pratipada (Deity: Agni)'), 'Tithi line formats 🪔 Tithi: {TithiName} ({Significance})');
  assert(output.includes('⏳ Tithi Ends: 04:32 PM'), 'Tithi Ends line formats ⏳ Tithi Ends: {TithiEndTime}');
  assert(output.includes('🟢 Shubh Window: 11:45 AM – 12:33 PM (Abhijit Muhurat)'), 'Shubh Window line formats 🟢 Shubh Window: {AuspiciousWindow}');
  assert(output.includes('🔴 Rahu Kaal: 09:15 AM – 10:45 AM'), 'Rahu Kaal line formats 🔴 Rahu Kaal: {RahuKaalWindow}');
  assert(output.includes('🛡️ Panchak: No Active Panchak (Free)'), 'Panchak line formats 🛡️ Panchak: {PanchakStatus}');
  assert(output.includes('real-time muhurat & panchang:'), 'Contains live call-to-action text');
  assert(output.includes('https://dailytithi.com'), 'Contains direct app deep-link https://dailytithi.com');

  // ── TEST 2: Dynamic Astrometric Data Binding ───────────────────────────────
  console.log('\n▸ 2. Verifying Dynamic Ephemeris Binding Across Locations:');
  const testDate = new Date(2026, 9, 10, 12, 0, 0); // Oct 10 2026
  const delhiPanchang = calculatePanchang(testDate, PRESET_LOCATIONS[0]); // New Delhi
  const delhiShare = buildShareDataFromPanchang(testDate, delhiPanchang);

  assert(Boolean(delhiShare.tithiName), `Delhi tithi resolved: ${delhiShare.tithiName}`);
  assert(Boolean(delhiShare.auspiciousWindow), `Delhi auspicious window resolved: ${delhiShare.auspiciousWindow}`);
  assert(Boolean(delhiShare.rahuKaalWindow), `Delhi Rahu Kaal window resolved: ${delhiShare.rahuKaalWindow}`);
  assert(Boolean(delhiShare.panchakStatus), `Delhi Panchak status resolved: ${delhiShare.panchakStatus}`);

  const delhiFormatted = formatPanchangShareText(delhiShare);
  assert(delhiFormatted.includes('🌅 Aaj Ka Panchang • Daily Tithi'), 'Delhi payload has valid header');
  assert(delhiFormatted.includes('https://dailytithi.com'), 'Delhi payload has valid link');

  // ── TEST 3: Multi-Tier Fallback Mechanism (Mocked Runtime) ─────────────────
  console.log('\n▸ 3. Verifying Multi-Tier Fallback Share Handler:');
  
  // 3a. Desktop Fallback -> api.whatsapp.com
  let openedUrl = '';
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      clipboard: {
        writeText: async () => Promise.resolve()
      }
    },
    configurable: true,
    writable: true
  });
  Object.defineProperty(globalThis, 'window', {
    value: {
      open: (url: string) => {
        openedUrl = url;
        return { closed: false };
      }
    },
    configurable: true,
    writable: true
  });

  const desktopResult = await sharePanchang(sampleData);
  assert(desktopResult.method === 'whatsapp', 'Desktop fallback routes to whatsapp method');
  assert(openedUrl.startsWith('https://api.whatsapp.com/send?text='), 'Desktop opens api.whatsapp.com with pre-filled text parameter');
  assert(openedUrl.includes(encodeURIComponent('🌅 Aaj Ka Panchang • Daily Tithi')), 'URL encoded message includes proper greeting card');

  // 3b. Mobile Native Share -> navigator.share
  let sharedPayload: Record<string, unknown> | null = null;
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) Mobile Safari/537.36',
      share: async (payload: Record<string, unknown>) => {
        sharedPayload = payload;
        return Promise.resolve();
      }
    },
    configurable: true,
    writable: true
  });

  const mobileResult = await sharePanchang(sampleData);
  assert(mobileResult.method === 'native', 'Mobile client activates native share sheet');
  assert(sharedPayload !== null, 'navigator.share received share payload');
  assert(typeof ((sharedPayload as unknown) as { text?: string })?.text === 'string', 'Native share received formatted greeting text');

  // 3c. Clipboard Fallback
  let copiedText = '';
  let toastTriggered = '';
  Object.defineProperty(globalThis, 'navigator', {
    value: {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      clipboard: {
        writeText: async (t: string) => {
          copiedText = t;
          return Promise.resolve();
        }
      }
    },
    configurable: true,
    writable: true
  });
  Object.defineProperty(globalThis, 'window', {
    value: {
      open: () => null // Simulate popup blocker
    },
    configurable: true,
    writable: true
  });

  const clipboardResult = await sharePanchang(sampleData, {
    onToast: (msg) => {
      toastTriggered = msg;
    }
  });
  assert(clipboardResult.method === 'clipboard', 'When popup blocked, falls through to clipboard method');
  assert(copiedText.includes('🌅 Aaj Ka Panchang • Daily Tithi'), 'Clipboard received formatted text payload');
  assert(toastTriggered === 'Panchang copied to clipboard!', 'Toast message is exactly "Panchang copied to clipboard!"');

  // ── TEST 4: Zero 'any' Types in Share Components & Utilities ───────────────
  console.log('\n▸ 4. Verifying Strict TypeScript Compliance (Zero any):');
  const targetFiles = [
    'src/lib/utils/sharePanchang.ts',
    'app/components/WhatsAppShareButton.tsx'
  ];

  for (const relPath of targetFiles) {
    const content = fs.readFileSync(relPath, 'utf8');
    const anyMatches = content.match(/:\s*any\b|\bas\s+any\b/g) || [];
    assert(anyMatches.length === 0, `${relPath} contains zero 'any' types (found: ${anyMatches.length})`);
  }

  // ── TEST 5: Verify WhatsApp UI Integration & Card 2 Cleanliness ──
  console.log('\n▸ 5. Verifying WhatsApp UI Integration & Card 2 Cleanliness:');
  const widgetSource = fs.readFileSync('app/components/HinduPanchangWidget.tsx', 'utf8');
  assert(!widgetSource.includes("Share Today's Tithi"), "Card 2 permanently removed 'Share Today\\'s Tithi' tag");
  assert(widgetSource.includes('Share Panchang on WhatsApp'), 'HinduPanchangWidget includes menu WhatsApp action');

  console.log('\n═══════════════════════════════════════════════════════════════════════════════════');
  console.log(`  RESULTS: ${passed}/${total} Assertions Passed`);
  console.log('  🎉 WHATSAPP PANCHANG SHARING SYSTEM FULLY VERIFIED!');
  console.log('═══════════════════════════════════════════════════════════════════════════════════\n');
}

runShareVerification().catch((err) => {
  console.error('Audit run error:', err);
  process.exit(1);
});
