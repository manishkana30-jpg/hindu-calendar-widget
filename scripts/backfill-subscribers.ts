#!/usr/bin/env node
/**
 * One-Time/Idempotent Backfill Script:
 * Copies active/historical push subscribers into visitor_logs table as converted users.
 * 
 * Usage:
 *   npx tsx scripts/backfill-subscribers.ts
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

function loadEnv(): void {
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

async function backfill() {
  console.log('\n===============================================================');
  console.log('  🔄 BACKFILLING HISTORICAL SUBSCRIBERS INTO VISITOR LOGS');
  console.log('===============================================================\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  // 1. Fetch existing push subscriptions
  const { data: subs, error: subsError } = await supabase
    .from('push_subscriptions')
    .select('id, created_at, location_name, user_timezone')
    .order('created_at', { ascending: true });

  if (subsError) {
    console.error('❌ Failed to fetch push_subscriptions:', subsError.message);
    process.exit(1);
  }

  if (!subs || subs.length === 0) {
    console.log('ℹ️  No subscriptions found in push_subscriptions to backfill.');
    return;
  }

  console.log(`Found ${subs.length} total subscribers in push_subscriptions.`);

  let insertedCount = 0;
  let skippedCount = 0;

  for (const sub of subs) {
    // Check if already backfilled with this created_at timestamp
    const { data: existing } = await supabase
      .from('visitor_logs')
      .select('id')
      .eq('created_at', sub.created_at)
      .limit(1);

    if (existing && existing.length > 0) {
      skippedCount++;
      continue;
    }

    const { error: insertErr } = await supabase
      .from('visitor_logs')
      .insert({
        created_at: sub.created_at,
        ip_address: '0.0.0.0',
        country: sub.location_name ? 'IN' : 'UNKNOWN',
        device_agent: `Historical Subscriber (${sub.location_name || 'Generic Device'})`,
        path: '/',
        session_id: crypto.randomUUID(),
        is_subscribed: true
      });

    if (insertErr) {
      console.warn(`⚠️ Warning inserting record for sub ${sub.id}:`, insertErr.message);
    } else {
      insertedCount++;
    }
  }

  console.log(`\n✅ Backfill Summary:`);
  console.log(`   - Newly backfilled: ${insertedCount}`);
  console.log(`   - Already logged/skipped: ${skippedCount}`);
  console.log(`   - Total processed: ${subs.length}\n`);
}

backfill().catch((err) => {
  console.error('Backfill error:', err);
  process.exit(1);
});
