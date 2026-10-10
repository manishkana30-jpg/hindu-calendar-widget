#!/usr/bin/env node
/**
 * Automated VAPID Key Generator & Environment Configurator
 * DailyTithi.com — High-Precision Vedic Panchang PWA
 *
 * Generates RFC 8292 compliant Web Push VAPID keys and writes/appends
 * them to .env.local if not already present.
 */

import fs from 'node:fs';
import path from 'node:path';
import webpush from 'web-push';

const envLocalPath = path.join(process.cwd(), '.env.local');
const isForce = process.argv.includes('--force');

console.log('\n' + '='.repeat(72));
console.log('   DAILYTITHI.COM — VAPID WEB PUSH AUTOMATED KEY GENERATOR');
console.log('='.repeat(72) + '\n');

let envContent = '';
let existingKeys = {};

if (fs.existsSync(envLocalPath)) {
  envContent = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      existingKeys[key] = val;
    }
  }
}

const hasPublic = Boolean(existingKeys.NEXT_PUBLIC_VAPID_PUBLIC_KEY || existingKeys.VAPID_PUBLIC_KEY);
const hasPrivate = Boolean(existingKeys.VAPID_PRIVATE_KEY);
const hasSubject = Boolean(existingKeys.VAPID_SUBJECT);

if (hasPublic && hasPrivate && !isForce) {
  const activePublic = existingKeys.NEXT_PUBLIC_VAPID_PUBLIC_KEY || existingKeys.VAPID_PUBLIC_KEY;
  const activePrivate = existingKeys.VAPID_PRIVATE_KEY;
  const activeSubject = existingKeys.VAPID_SUBJECT || 'mailto:contact@dailytithi.com';

  console.log('✓ VAPID credentials already present in .env.local:');
  console.log(`  NEXT_PUBLIC_VAPID_PUBLIC_KEY: ${activePublic.slice(0, 16)}...`);
  console.log(`  VAPID_PRIVATE_KEY:            ${activePrivate.slice(0, 6)}...`);
  console.log(`  VAPID_SUBJECT:                ${activeSubject}\n`);

  try {
    webpush.setVapidDetails(activeSubject, activePublic, activePrivate);
    console.log('✓ Validation: Active keys are cryptographically valid.');
    console.log('  (Pass --force if you wish to overwrite and regenerate keys.)\n');
    console.log('='.repeat(72) + '\n');
    process.exit(0);
  } catch (err) {
    console.warn('⚠️ Existing keys failed cryptographic check. Regenerating valid key pair...\n');
  }
}

// Generate new RFC 8292 VAPID Keys
const newKeys = webpush.generateVAPIDKeys();
const subject = existingKeys.VAPID_SUBJECT || 'mailto:contact@dailytithi.com';

console.log('Generating cryptographically secure VAPID key pair...');
console.log(`  Public Key:  ${newKeys.publicKey}`);
console.log(`  Private Key: ${newKeys.privateKey}`);
console.log(`  Subject:     ${subject}\n`);

if (fs.existsSync(envLocalPath) && !isForce) {
  // Append missing keys to existing file
  const toAppend = [];
  if (!existingKeys.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    toAppend.push(`NEXT_PUBLIC_VAPID_PUBLIC_KEY="${newKeys.publicKey}"`);
  }
  if (!existingKeys.VAPID_PRIVATE_KEY) {
    toAppend.push(`VAPID_PRIVATE_KEY="${newKeys.privateKey}"`);
  }
  if (!existingKeys.VAPID_SUBJECT) {
    toAppend.push(`VAPID_SUBJECT="${subject}"`);
  }

  if (toAppend.length > 0) {
    const updatedContent = envContent.trimEnd() + '\n\n# Web Push VAPID Credentials (Generated)\n' + toAppend.join('\n') + '\n';
    fs.writeFileSync(envLocalPath, updatedContent, 'utf8');
    console.log(`✓ Appended missing keys to ${envLocalPath}`);
  }
} else {
  // If force or file doesn't exist, update or write
  if (fs.existsSync(envLocalPath) && isForce) {
    // Replace keys in existing content
    let updated = envContent;
    if (updated.includes('NEXT_PUBLIC_VAPID_PUBLIC_KEY=')) {
      updated = updated.replace(/NEXT_PUBLIC_VAPID_PUBLIC_KEY=.*/g, `NEXT_PUBLIC_VAPID_PUBLIC_KEY="${newKeys.publicKey}"`);
    } else {
      updated += `\nNEXT_PUBLIC_VAPID_PUBLIC_KEY="${newKeys.publicKey}"`;
    }

    if (updated.includes('VAPID_PRIVATE_KEY=')) {
      updated = updated.replace(/VAPID_PRIVATE_KEY=.*/g, `VAPID_PRIVATE_KEY="${newKeys.privateKey}"`);
    } else {
      updated += `\nVAPID_PRIVATE_KEY="${newKeys.privateKey}"`;
    }

    if (!updated.includes('VAPID_SUBJECT=')) {
      updated += `\nVAPID_SUBJECT="${subject}"`;
    }

    fs.writeFileSync(envLocalPath, updated, 'utf8');
    console.log(`✓ Force-regenerated and replaced keys in ${envLocalPath}`);
  } else {
    // Create new .env.local
    const initialContent = [
      '# Local Development Environment Variables',
      'NEXT_PUBLIC_APP_URL="https://dailytithi.com"',
      `NEXT_PUBLIC_VAPID_PUBLIC_KEY="${newKeys.publicKey}"`,
      `VAPID_PRIVATE_KEY="${newKeys.privateKey}"`,
      `VAPID_SUBJECT="${subject}"`,
      'CRON_SECRET=""',
      ''
    ].join('\n');
    fs.writeFileSync(envLocalPath, initialContent, 'utf8');
    console.log(`✓ Created new ${envLocalPath} with generated VAPID keys.`);
  }
}

console.log('='.repeat(72));
console.log('VAPID setup complete. Keys ready for browser subscriptions & server dispatch.');
console.log('='.repeat(72) + '\n');
