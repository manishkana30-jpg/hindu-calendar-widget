#!/usr/bin/env node
/**
 * CLI Runner: Send Test Tithi / Daily Panchang Push Notification
 * 
 * Usage:
 *   npm run push:tithi
 *   npx tsx scripts/send-test-tithi.ts
 *   npx tsx scripts/send-test-tithi.ts --url http://localhost:3000
 *   npx tsx scripts/send-test-tithi.ts --prod
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

async function main() {
  console.log('\n' + '═'.repeat(75));
  console.log('       🌅 DAILY TITHI: DISPATCH TEST TITHI PUSH NOTIFICATION');
  console.log('═'.repeat(75) + '\n');

  // Read environment variables from .env.local
  const cronSecret = process.env.CRON_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!cronSecret) {
    console.error('❌ Error: CRON_SECRET is missing in .env.local.');
    process.exit(1);
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Supabase configuration (NEXT_PUBLIC_SUPABASE_URL / key) is missing in .env.local.');
    process.exit(1);
  }

  // Parse custom CLI arguments
  const args = process.argv.slice(2);
  let targetHost = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'https://dailytithi.com';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--url' && args[i + 1]) {
      targetHost = args[++i];
    } else if (arg.startsWith('--url=')) {
      targetHost = arg.slice(6);
    } else if (arg === '--local') {
      targetHost = 'http://localhost:3000';
    } else if (arg === '--prod') {
      targetHost = 'https://dailytithi.com';
    }
  }

  const endpointUrl = `${targetHost.replace(/\/$/, '')}/api/push/daily-trigger`;

  console.log(`▸ Target Endpoint:       ${endpointUrl}`);
  console.log(`▸ Supabase Instance:     ${supabaseUrl}`);
  console.log(`▸ CRON Authorization:    Configured (Secret: ${cronSecret.slice(0, 8)}...)\n`);

  // Query active subscribers count from Supabase
  let dbActiveCount: number | null = null;
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { count, error } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (!error && count !== null) {
      dbActiveCount = count;
      console.log(`👥 Database Active Subscribers: ${dbActiveCount}`);
    }
  } catch (err: unknown) {
    console.warn('ℹ️  Could not fetch initial database count:', err);
  }

  console.log('\n🚀 Sending POST request with {"forceAll": true}...\n');

  try {
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${cronSecret}`,
        'x-cron-secret': cronSecret
      },
      body: JSON.stringify({ forceAll: true })
    });

    if (!response.ok) {
      const errBody = await response.text();
      console.error(`❌ HTTP Error: Server responded with status ${response.status}`);
      console.error(`   Details: ${errBody}\n`);
      process.exit(1);
    }

    const result = await response.json();
    const metrics = result.metrics || {};

    const totalActive = metrics.total ?? dbActiveCount ?? result.total ?? 0;
    const totalSent = metrics.totalSent ?? (metrics.morningSent ?? 0) + (metrics.tithiSent ?? 0);
    const morningSent = metrics.morningSent ?? 0;
    const tithiSent = metrics.tithiSent ?? 0;
    const failed = metrics.failed ?? 0;
    const pruned = metrics.pruned ?? 0;
    const skipped = metrics.skipped ?? 0;

    console.log('─'.repeat(75));
    console.log('                     DISPATCH EXECUTION RESULTS');
    console.log('─'.repeat(75));
    console.log(`  👥 Total Active Subscribers:   ${totalActive}`);
    console.log(`  🚀 Total Push Alerts Sent:     ${totalSent}`);
    console.log(`     ├─ Morning Sunrise Alerts:  ${morningSent}`);
    console.log(`     └─ Tithi Transition Alerts: ${tithiSent}`);
    console.log(`  ❌ Failed Dispatches:         ${failed}`);
    console.log(`  🧹 Auto-Pruned (404/410):     ${pruned}`);
    console.log(`  ⏩ Skipped:                   ${skipped}`);
    console.log(`  🕒 Server Timestamp:          ${result.timestamp || new Date().toISOString()}`);
    console.log('─'.repeat(75) + '\n');

    if (totalSent > 0) {
      console.log(`✨ Success! Dispatched daily Tithi notifications to ${totalSent} device(s).\n`);
    } else if (totalActive === 0) {
      console.log('ℹ️  No active devices registered in database. Open https://dailytithi.com to enable alerts.\n');
    } else {
      console.log('ℹ️  Execution completed with zero alerts sent (check metrics above).\n');
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Request Failed: ${msg}`);
    console.log('\n💡 Tip: Verify server connectivity or pass `--local` to test against http://localhost:3000.\n');
    process.exit(1);
  }
}

main();
