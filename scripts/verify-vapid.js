#!/usr/bin/env node
/**
 * VAPID Verification Utility
 * DailyTithi.com — High-Precision Vedic Panchang PWA
 *
 * Verifies local or environment VAPID keys for mathematical correctness.
 */

const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

console.log('\n--- Checking VAPID Configuration ---');

// Attempt to read from .env.local if present
const envLocalPath = path.join(process.cwd(), '.env.local');
let envKeys = { ...process.env };

if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!envKeys[key]) {
        envKeys[key] = val;
      }
    }
  });
}

const publicKey = envKeys.NEXT_PUBLIC_VAPID_PUBLIC_KEY || envKeys.VAPID_PUBLIC_KEY;
const privateKey = envKeys.VAPID_PRIVATE_KEY;
const subject = envKeys.VAPID_SUBJECT || 'mailto:contact@dailytithi.com';

if (!publicKey || !privateKey) {
  console.error('❌ FAILED: Missing VAPID keys.');
  console.error(`  NEXT_PUBLIC_VAPID_PUBLIC_KEY: ${publicKey ? 'Present' : 'MISSING'}`);
  console.error(`  VAPID_PRIVATE_KEY: ${privateKey ? 'Present' : 'MISSING'}`);
  process.exit(1);
}

try {
  webpush.setVapidDetails(subject, publicKey, privateKey);
  console.log('✅ SUCCESS: VAPID keys are cryptographically valid and ready for Web Push dispatch.');
  console.log(`  Subject: ${subject}`);
  console.log(`  Public Key (Length ${publicKey.length}): ${publicKey.slice(0, 16)}...`);
  console.log(`  Private Key (Length ${privateKey.length}): ${privateKey.slice(0, 6)}...`);
} catch (err) {
  console.error('❌ FAILED: webpush.setVapidDetails rejected the keys:', err.message);
  process.exit(1);
}
