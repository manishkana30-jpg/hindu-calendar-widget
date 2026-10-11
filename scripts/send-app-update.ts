#!/usr/bin/env node
/**
 * CLI Runner: Send "App Update" Push Notification Broadcast
 * 
 * Usage:
 *   npm run push:update
 *   npm run push:update -- --title "⚡ New Features Live" --body "Check out new Rahu Kaal alerts!"
 *   npx tsx scripts/send-app-update.ts
 *   npx tsx scripts/send-app-update.ts --title "⚡ Diwali Update" --body "Happy Diwali from Daily Tithi!"
 *   npx tsx scripts/send-app-update.ts --http http://localhost:3000
 */

import fs from 'fs';
import path from 'path';

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

// Import the broadcast helper and Supabase client
import { broadcastAppUpdate } from '../src/lib/push/broadcast';
import { createClient } from '@supabase/supabase-js';

// ── 2. Parse CLI Arguments (--title, --body, --url, --http, --prod) ───────────
interface ParsedArgs {
  title: string;
  body: string;
  url: string;
  httpEndpoint?: string;
}

function cleanArg(val: string): string {
  return val.trim().replace(/^["']|["']$/g, '');
}

function parseCliArgs(): ParsedArgs {
  const args = process.argv.slice(2);
  let title = '⚡ New Update Available: Tap to refresh Daily Tithi';
  let body = 'A new update is available with improved Panchang calculations. Tap to refresh!';
  let url = 'https://dailytithi.com/';
  let httpEndpoint: string | undefined = undefined;

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
    } else if (arg === '--url' && args[i + 1]) {
      url = cleanArg(args[++i]);
    } else if (arg.startsWith('--url=')) {
      url = cleanArg(arg.slice('--url='.length));
    } else if (arg === '--http' && args[i + 1]) {
      httpEndpoint = cleanArg(args[++i]);
    } else if (arg.startsWith('--http=')) {
      httpEndpoint = cleanArg(arg.slice('--http='.length));
    } else if (arg === '--prod') {
      httpEndpoint = 'https://dailytithi.com';
    }
  }

  return { title, body, url, httpEndpoint };
}

async function main() {
  console.log('\n' + '═'.repeat(75));
  console.log('       ⚡ DAILY TITHI: APP UPDATE VAPID BROADCAST ENGINE');
  console.log('═'.repeat(75) + '\n');

  const { title, body, url, httpEndpoint } = parseCliArgs();

  // Read environment variables from .env.local
  const cronSecret = process.env.CRON_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!cronSecret) {
    console.warn('⚠️  Warning: CRON_SECRET is missing or empty in .env.local.');
  }

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Supabase configuration (NEXT_PUBLIC_SUPABASE_URL / key) is missing in .env.local.');
    process.exit(1);
  }

  console.log(`▸ Broadcast Title:       "${title}"`);
  console.log(`▸ Broadcast Body:        "${body}"`);
  console.log(`▸ Action Target URL:     ${url}`);
  console.log(`▸ Supabase Instance:     ${supabaseUrl}`);

  // Query active subscriber count in Supabase
  let activeSubCount: number | null = null;
  try {
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
    const { count, error } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (!error && count !== null) {
      activeSubCount = count;
      console.log(`👥 Database Active Subscribers: ${activeSubCount}\n`);
    }
  } catch (err: unknown) {
    console.warn('ℹ️  Could not fetch initial database count:', err);
  }

  console.log('🚀 Dispatching VAPID App Update broadcast to all active subscribers...\n');

  // Option A: Dispatch via HTTP Endpoint if specified
  if (httpEndpoint) {
    const targetUrl = `${httpEndpoint.replace(/\/$/, '')}/api/push/admin-broadcast`;
    console.log(`▸ Dispatching via HTTP Endpoint: ${targetUrl}`);

    try {
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cronSecret || ''}`,
          'x-cron-secret': cronSecret || ''
        },
        body: JSON.stringify({ title, body, url, forceReload: true })
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error(`❌ HTTP Error: Server responded with status ${response.status}`);
        console.error(`   Details: ${errBody}\n`);
        process.exit(1);
      }

      const result = await response.json();
      printResults(result.total ?? activeSubCount ?? 0, result.sent ?? 0, result.failed ?? 0, result.pruned ?? 0, result.timestamp);
      return;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`❌ HTTP Request Failed: ${msg}`);
      process.exit(1);
    }
  }

  // Option B: Dispatch via direct broadcast helper (standalone, no dev server needed!)
  try {
    const result = await broadcastAppUpdate({
      title,
      body,
      url,
      forceReload: true
    });

    if (!result.success && result.error) {
      console.error(`❌ Broadcast Error: ${result.message}`);
      process.exit(1);
    }

    printResults(result.total ?? activeSubCount ?? 0, result.sent, result.failed, result.pruned, result.timestamp);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`❌ Broadcast Execution Failed: ${msg}`);
    process.exit(1);
  }
}

function printResults(total: number, sent: number, failed: number, pruned: number, timestamp?: string): void {
  console.log('─'.repeat(75));
  console.log('                     BROADCAST EXECUTION RESULTS');
  console.log('─'.repeat(75));
  console.log(`  👥 Total Active Subscribers:   ${total}`);
  console.log(`  🚀 Successfully Dispatched:    ${sent}`);
  console.log(`  ❌ Failed Dispatches:         ${failed}`);
  console.log(`  🧹 Auto-Pruned (404/410):     ${pruned}`);
  console.log(`  🏷️  Broadcast Tag:             app-update`);
  console.log(`  🕒 Timestamp:                 ${timestamp || new Date().toISOString()}`);
  console.log('─'.repeat(75) + '\n');

  if (sent > 0) {
    console.log(`✨ Success! Dispatched App Update push notification to ${sent} device(s).\n`);
  } else if (total === 0) {
    console.log('ℹ️  Zero active devices registered in database. Enable notifications in the PWA first.\n');
  } else {
    console.log('ℹ️  Execution completed with zero alerts sent (check metrics above).\n');
  }
}

main();
