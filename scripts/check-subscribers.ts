#!/usr/bin/env node
/**
 * CLI Runner: Push Subscribers Inspector & Status Diagnostic Tool
 * 
 * Usage:
 *   npm run push:status
 *   npx tsx scripts/check-subscribers.ts
 */

import fs from 'fs';
import path from 'path';
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

interface PushSubscriptionRow {
  id: string;
  endpoint: string;
  endpoint_hash: string;
  p256dh: string;
  auth: string;
  user_timezone: string | null;
  latitude: number | null;
  longitude: number | null;
  location_name: string | null;
  location_timezone_offset: number | null;
  preferences: {
    dailyNotification?: boolean;
    notificationTime?: string;
    alertOnTithiChange?: boolean;
    autoUpdate?: boolean;
  } | null;
  last_daily_date_notified: string | null;
  last_tithi_index_notified: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Identifies the Push Service Vendor from the subscription endpoint URL.
 */
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
  return 'Web Push (Other)';
}

function padRight(str: string, length: number): string {
  return str.length > length ? str.slice(0, length - 1) + '…' : str.padEnd(length, ' ');
}

async function main() {
  console.log('\n' + '═'.repeat(95));
  console.log('       📡 DAILY TITHI: PUSH SUBSCRIBERS STATUS & DIAGNOSTICS');
  console.log('═'.repeat(95) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Supabase configuration is missing in .env.local.');
    process.exit(1);
  }

  const hasServiceRole = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  console.log(`▸ Supabase Instance:   ${supabaseUrl}`);
  console.log(`▸ Authentication Mode: ${hasServiceRole ? 'Service Role (Full Admin)' : 'Publishable Key (RLS Bypass Policy)'}\n`);

  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });

    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(`❌ Supabase Query Error: ${error.message}\n`);
      process.exit(1);
    }

    const rows = (data || []) as PushSubscriptionRow[];
    const totalCount = rows.length;

    if (totalCount === 0) {
      console.log('─'.repeat(95));
      console.log('                     ACTIVE SUBSCRIBERS TABLE: 0 DEVICES');
      console.log('─'.repeat(95));
      console.log('ℹ️  No active push subscriptions found in database (count: 0).\n');
      console.log('💡 Why is the count 0?');
      console.log('   1. We regenerated VAPID keys; client devices have not yet re-negotiated subscriptions.');
      console.log('   2. Launch the app in your browser (https://dailytithi.com) with notifications enabled.');
      console.log('   3. The app will automatically execute silent auto-resubscription and save your device here.');
      console.log('─'.repeat(95) + '\n');
      return;
    }

    // Format and render ASCII table
    console.log('┌' + '─'.repeat(14) + '┬' + '─'.repeat(26) + '┬' + '─'.repeat(18) + '┬' + '─'.repeat(16) + '┬' + '─'.repeat(17) + '┐');
    console.log(
      '│ ' + padRight('Device ID', 12) +
      ' │ ' + padRight('City & Timezone', 24) +
      ' │ ' + padRight('Coordinates', 16) +
      ' │ ' + padRight('Push Vendor', 14) +
      ' │ ' + padRight('Notified / Added', 15) + ' │'
    );
    console.log('├' + '─'.repeat(14) + '┼' + '─'.repeat(26) + '┼' + '─'.repeat(18) + '┼' + '─'.repeat(16) + '┼' + '─'.repeat(17) + '┤');

    const vendorCounts: Record<string, number> = {};

    rows.forEach((row) => {
      const devId = row.id ? `${row.id.slice(0, 8)}...` : row.endpoint_hash.slice(0, 8);
      const city = row.location_name ? `${row.location_name.split('(')[0].trim()}` : 'Default City';
      const tz = row.user_timezone || 'Asia/Kolkata';
      const cityTz = `${city} (${tz.split('/')[1] || tz})`;

      const lat = row.latitude !== null && row.latitude !== undefined ? row.latitude.toFixed(2) : '—';
      const lng = row.longitude !== null && row.longitude !== undefined ? row.longitude.toFixed(2) : '—';
      const coords = `${lat}, ${lng}`;

      const vendor = detectPushVendor(row.endpoint);
      vendorCounts[vendor] = (vendorCounts[vendor] || 0) + 1;

      const lastDate = row.last_daily_date_notified || 'Never';
      const addedDate = row.created_at ? row.created_at.split('T')[0] : '—';
      const dateInfo = `${lastDate} / ${addedDate.slice(5)}`;

      console.log(
        '│ ' + padRight(devId, 12) +
        ' │ ' + padRight(cityTz, 24) +
        ' │ ' + padRight(coords, 16) +
        ' │ ' + padRight(vendor, 14) +
        ' │ ' + padRight(dateInfo, 15) + ' │'
      );
    });

    console.log('└' + '─'.repeat(14) + '┴' + '─'.repeat(26) + '┴' + '─'.repeat(18) + '┴' + '─'.repeat(16) + '┴' + '─'.repeat(17) + '┘');

    console.log('\n' + '─'.repeat(95));
    console.log('                     SUBSCRIBER METRICS SUMMARY');
    console.log('─'.repeat(95));
    console.log(`  👥 Total Active Subscribers:   ${totalCount}`);
    Object.entries(vendorCounts).forEach(([vendor, count]) => {
      console.log(`     ├─ ${padRight(vendor + ':', 24)} ${count}`);
    });
    console.log(`  🕒 Diagnostic Checked At:      ${new Date().toISOString()}`);
    console.log('─'.repeat(95) + '\n');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Diagnostic Execution Failed: ${msg}\n`);
    process.exit(1);
  }
}

main();
