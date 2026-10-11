#!/usr/bin/env node
/**
 * CLI Runner: 1-Click Test Push Dispatcher to All Active Devices
 * 
 * Usage:
 *   npm run push:test
 *   npm run push:test -- --title "Special Test" --body "Testing device alert"
 *   npx tsx scripts/send-test-push.ts
 */

import fs from 'fs';
import path from 'path';
import webpush from 'web-push';
import { createClient } from '@supabase/supabase-js';

// ── 1. Cleanly Load Environment Variables ─────────────────────────────────────
function loadEnv(): void {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { loadEnvConfig } = require('@next/env');
    loadEnvConfig(process.cwd());
  } catch {}

  const envLocalPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const content = fs.readFileSync(envLocalPath, 'utf8');
    content.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const idx = trimmed.indexOf('=');
        const key = trimmed.slice(0, idx).trim();
        const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    });
  }
}

loadEnv();

// ── 2. Parse CLI Arguments (--title, --body) ──────────────────────────────────
interface ParsedArgs {
  title: string;
  body: string;
}

function cleanArg(val: string): string {
  return val.trim().replace(/^["']|["']$/g, '');
}

function parseCliArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  let title = '🔔 Daily Tithi — Test Push Alert';
  let body = 'This is a high-urgency test notification verifying your active Web Push subscription.';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if ((arg === '--title' || arg === '-t') && args[i + 1]) {
      title = cleanArg(args[++i]);
    } else if (arg.startsWith('--title=')) {
      title = cleanArg(arg.slice('--title='.length));
    } else if ((arg === '--body' || arg === '-b') && args[i + 1]) {
      body = cleanArg(args[++i]);
    } else if (arg.startsWith('--body=')) {
      body = cleanArg(arg.slice('--body='.length));
    }
  }

  return { title, body };
}

interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  endpoint_hash: string;
  p256dh: string;
  auth: string;
  user_timezone: string | null;
  location_name: string | null;
  is_active: boolean;
}

function detectPushVendor(endpoint: string): string {
  const ep = endpoint.toLowerCase();
  if (ep.includes('fcm.googleapis.com') || ep.includes('android.googleapis.com')) {
    return 'Google FCM';
  }
  if (ep.includes('push.apple.com')) {
    return 'Apple APNs';
  }
  if (ep.includes('mozilla.com') || ep.includes('autopush')) {
    return 'Mozilla Autopush';
  }
  if (ep.includes('notify.windows.com')) {
    return 'Microsoft WNS';
  }
  return 'Web Push';
}

function padRight(str: string, length: number): string {
  return str.length > length ? str.slice(0, length - 1) + '…' : str.padEnd(length, ' ');
}

async function main() {
  console.log('\n' + '═'.repeat(95));
  console.log('       🎯 DAILY TITHI: 1-CLICK TEST PUSH DISPATCH ENGINE');
  console.log('═'.repeat(95) + '\n');

  const { title, body } = parseCliArgs();

  // Validate VAPID configuration
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || 'mailto:contact@dailytithi.com';

  if (!publicKey || !privateKey) {
    console.error('❌ Error: VAPID credentials (NEXT_PUBLIC_VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY) are missing in .env.local.');
    process.exit(1);
  }

  webpush.setVapidDetails(subject, publicKey.trim(), privateKey.trim());

  // Validate Supabase configuration
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Supabase configuration is missing in .env.local.');
    process.exit(1);
  }

  console.log(`▸ Push Title:          "${title}"`);
  console.log(`▸ Push Body:           "${body}"`);
  console.log(`▸ Urgency Level:       high (RFC 8292)`);
  console.log(`▸ Supabase Instance:   ${supabaseUrl}\n`);

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    // 1. Query active devices
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, endpoint_hash, p256dh, auth, user_timezone, location_name, is_active')
      .eq('is_active', true);

    if (error) {
      console.error(`❌ Supabase Query Error: ${error.message}\n`);
      process.exit(1);
    }

    const rows = (data || []) as PushSubscriptionRow[];
    const totalCount = rows.length;

    if (totalCount === 0) {
      console.log('─'.repeat(95));
      console.log('                     DISPATCH TARGETS: 0 DEVICES');
      console.log('─'.repeat(95));
      console.log('ℹ️  Zero active devices registered in database. No test pushes dispatched.\n');
      console.log('💡 How to register a device:');
      console.log('   1. Open https://dailytithi.com in your browser.');
      console.log('   2. Enable notifications in the PWA settings modal.');
      console.log('   3. Re-run `npm run push:test` to test instant lock-screen delivery.');
      console.log('─'.repeat(95) + '\n');
      return;
    }

    console.log(`🚀 Dispatching high-urgency test notifications to ${totalCount} active device(s)...\n`);

    const pushPayload = JSON.stringify({
      title,
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'test-push',
      renotify: true,
      requireInteraction: true,
      vibrate: [200, 100, 200],
      data: {
        url: 'https://dailytithi.com/',
        tag: 'test-push',
        isTest: true,
        timestamp: Date.now()
      }
    });

    const pushOptions: webpush.RequestOptions = {
      TTL: 86400, // 24 hours retention for sleeping/offline devices
      urgency: 'high', // Wakes sleeping / dozing device radios immediately
      topic: 'test-push'
    };

    console.log('┌' + '─'.repeat(14) + '┬' + '─'.repeat(18) + '┬' + '─'.repeat(22) + '┬' + '─'.repeat(34) + '┐');
    console.log(
      '│ ' + padRight('Device ID', 12) +
      ' │ ' + padRight('Push Vendor', 16) +
      ' │ ' + padRight('City Location', 20) +
      ' │ ' + padRight('Delivery Status', 32) + ' │'
    );
    console.log('├' + '─'.repeat(14) + '┼' + '─'.repeat(18) + '┼' + '─'.repeat(22) + '┼' + '─'.repeat(34) + '┤');

    let successCount = 0;
    let prunedCount = 0;
    let failedCount = 0;

    for (const row of rows) {
      const devId = row.id ? `${row.id.slice(0, 8)}...` : row.endpoint_hash.slice(0, 8);
      const vendor = detectPushVendor(row.endpoint);
      const city = row.location_name ? row.location_name.split('(')[0].trim() : 'Unknown';

      const subscription = {
        endpoint: row.endpoint,
        keys: {
          p256dh: row.p256dh,
          auth: row.auth
        }
      };

      try {
        const response = await webpush.sendNotification(subscription, pushPayload, pushOptions);
        const statusMsg = `✅ HTTP ${response.statusCode || 201} Success`;
        successCount++;

        console.log(
          '│ ' + padRight(devId, 12) +
          ' │ ' + padRight(vendor, 16) +
          ' │ ' + padRight(city, 20) +
          ' │ ' + padRight(statusMsg, 32) + ' │'
        );
      } catch (err: unknown) {
        interface WebPushErr {
          statusCode?: number;
          message?: string;
        }
        const pushErr = err as WebPushErr;
        const statusCode = pushErr.statusCode;

        if (statusCode === 404 || statusCode === 410) {
          // Auto-prune dead/expired subscription
          prunedCount++;
          await supabase
            .from('push_subscriptions')
            .update({ is_active: false })
            .eq('endpoint', row.endpoint);

          const statusMsg = `🧹 HTTP ${statusCode} Expired (Pruned)`;
          console.log(
            '│ ' + padRight(devId, 12) +
            ' │ ' + padRight(vendor, 16) +
            ' │ ' + padRight(city, 20) +
            ' │ ' + padRight(statusMsg, 32) + ' │'
          );
        } else {
          failedCount++;
          const statusMsg = `❌ HTTP ${statusCode || 'Err'} - ${pushErr.message || 'Error'}`;
          console.log(
            '│ ' + padRight(devId, 12) +
            ' │ ' + padRight(vendor, 16) +
            ' │ ' + padRight(city, 20) +
            ' │ ' + padRight(statusMsg, 32) + ' │'
          );
        }
      }
    }

    console.log('└' + '─'.repeat(14) + '┴' + '─'.repeat(18) + '┴' + '─'.repeat(22) + '┴' + '─'.repeat(34) + '┘');

    console.log('\n' + '─'.repeat(95));
    console.log('                     DISPATCH RESULTS SUMMARY');
    console.log('─'.repeat(95));
    console.log(`  👥 Total Active Subscribers:   ${totalCount}`);
    console.log(`  🚀 Successfully Delivered:     ${successCount}`);
    console.log(`  🧹 Auto-Pruned (404/410):     ${prunedCount}`);
    console.log(`  ❌ Failed Dispatches:         ${failedCount}`);
    console.log(`  🕒 Execution Timestamp:       ${new Date().toISOString()}`);
    console.log('─'.repeat(95) + '\n');

    if (successCount > 0) {
      console.log(`✨ Success! Dispatched test push notification to ${successCount} active device(s).\n`);
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Test Dispatch Failed: ${msg}\n`);
    process.exit(1);
  }
}

main();
