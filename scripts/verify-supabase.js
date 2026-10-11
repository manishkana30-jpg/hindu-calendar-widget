#!/usr/bin/env node
/**
 * Supabase Push Subscriptions Table Verification Tool
 * DailyTithi.com — High-Precision Vedic Panchang PWA
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

console.log('\n' + '='.repeat(72));
console.log('   DAILYTITHI.COM — SUPABASE POSTGRESQL SUBSCRIPTION CHECKER');
console.log('='.repeat(72) + '\n');

// Read environment variables from .env.local
const envLocalPath = path.join(process.cwd(), '.env.local');
const envVars = { ...process.env };

if (fs.existsSync(envLocalPath)) {
  const content = fs.readFileSync(envLocalPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (!envVars[key]) {
        envVars[key] = val;
      }
    }
  });
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL || envVars.SUPABASE_URL;
const publishableKey = envVars.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY;
const activeKey = serviceKey || publishableKey;

if (!supabaseUrl || !activeKey) {
  console.log('ℹ️  STATUS: Supabase credentials are not yet set in .env.local.');
  console.log('   NEXT_PUBLIC_SUPABASE_URL:             ' + (supabaseUrl ? '✓ Present' : '❌ MISSING'));
  console.log('   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: ' + (publishableKey ? '✓ Present' : '❌ MISSING'));
  console.log('   SUPABASE_SERVICE_ROLE_KEY:            ' + (serviceKey ? '✓ Present' : '⚠️ Optional for dev (recommended for crons)\n'));
  console.log('STEPS TO CONFIGURE SUPABASE:');
  console.log('1. Go to https://supabase.com -> Create a new project or select existing.');
  console.log('2. In Supabase Dashboard -> SQL Editor, run the migration script:');
  console.log('   supabase/migrations/20261011_create_push_subscriptions.sql');
  console.log('3. In Supabase Dashboard -> Project Settings -> API, copy keys into .env.local');
  console.log('='.repeat(72) + '\n');
  process.exit(0);
}

if (!serviceKey) {
  console.log('💡 NOTE: Using Publishable key for connection check. For production cron dispatch,');
  console.log('   also set SUPABASE_SERVICE_ROLE_KEY in .env.local to bypass RLS.\n');
}

const supabase = createClient(supabaseUrl, activeKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function testConnection() {
  console.log(`Connecting to Supabase at: ${supabaseUrl}...`);
  try {
    const { data, error, count } = await supabase
      .from('push_subscriptions')
      .select('id', { count: 'exact', head: true });

    if (error) {
      console.error('\n❌ FAILED: Query returned an error:');
      console.error(`   Message: ${error.message}`);
      console.error(`   Details: ${error.details || 'None'}`);
      console.error(`   Hint:    ${error.hint || 'Make sure you ran the SQL migration script in supabase/migrations/'}`);
      process.exit(1);
    }

    console.log('\n✅ SUCCESS: Connected to Supabase PostgreSQL database!');
    console.log(`   Table: public.push_subscriptions is verified and accessible.`);
    console.log(`   Current Active Subscriptions Count: ${count ?? 0}`);
    console.log('='.repeat(72) + '\n');
  } catch (err) {
    console.error('\n❌ FAILED: Network or connection exception:', err.message);
    process.exit(1);
  }
}

testConnection();
