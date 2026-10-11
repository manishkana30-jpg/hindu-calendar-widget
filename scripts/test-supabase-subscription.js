#!/usr/bin/env node
/**
 * End-to-End Supabase Push Subscription Pipeline Test
 * DailyTithi.com — High-Precision Vedic Panchang PWA
 */

const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
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

const { createClient } = require('@supabase/supabase-js');

async function runTest() {
  console.log('\n' + '='.repeat(72));
  console.log('   STEP 3: TESTING SUPABASE SUBSCRIPTION SYNC PIPELINE');
  console.log('='.repeat(72) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !key) {
    console.error('❌ Supabase credentials missing in .env.local');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  const crypto = require('crypto');
  const testEndpoint = `https://fcm.googleapis.com/fcm/send/test-synthetic-${Date.now()}`;
  const endpointHash = crypto.createHash('sha256').update(testEndpoint).digest('hex');

  const mockPayload = {
    endpoint: testEndpoint,
    endpoint_hash: endpointHash,
    p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcUbVlJx6',
    auth: 'tBHItJI5svbpez7KI4CCXg',
    user_timezone: 'Asia/Kolkata',
    latitude: 28.6139,
    longitude: 77.2090,
    location_name: 'New Delhi (India)',
    location_timezone_offset: 5.5,
    preferences: {
      dailyNotification: true,
      notificationTime: 'sunrise',
      alertOnTithiChange: true,
      autoUpdate: true,
      sound: true,
      vibration: true
    },
    is_active: true,
    last_validated_at: new Date().toISOString()
  };

  // TEST 1: Insert Subscription
  console.log('1. Testing Client Push Subscription Registration (UPSERT)...');
  const { data: insertData, error: insertError } = await supabase
    .from('push_subscriptions')
    .upsert(mockPayload, { onConflict: 'endpoint' })
    .select()
    .single();

  if (insertError) {
    console.error('❌ FAILED to insert subscription:', insertError.message);
    console.log('\n💡 FIX: Run the policies in supabase/migrations/20261011_enable_rls_policies.sql');
    console.log('   OR add SUPABASE_SERVICE_ROLE_KEY to .env.local to bypass RLS.\n');
    process.exitCode = 1;
    return;
  }
  console.log('   ✓ Registered subscription in Supabase PostgreSQL:');
  console.log(`     Endpoint Hash: ${insertData.endpoint_hash.slice(0, 16)}...`);
  console.log(`     Timezone:      ${insertData.user_timezone}`);
  console.log(`     Location:      ${insertData.location_name} (${insertData.latitude}, ${insertData.longitude})`);

  // TEST 2: Query Subscription by Endpoint
  console.log('\n2. Testing Subscription Lookup by Endpoint...');
  const { data: fetchedData, error: fetchError } = await supabase
    .from('push_subscriptions')
    .select('*')
    .eq('endpoint', testEndpoint)
    .single();

  if (fetchError || !fetchedData) {
    console.error('❌ FAILED to retrieve subscription:', fetchError ? fetchError.message : 'Not found');
    process.exit(1);
  }
  console.log('   ✓ Successfully fetched subscription record from Supabase.');

  // TEST 3: Update Preferences / State
  console.log('\n3. Testing Notification Preferences Sync...');
  const updatedPreferences = {
    ...mockPayload.preferences,
    notificationTime: '06:00',
    alertOnTithiChange: false
  };

  const { error: updateError } = await supabase
    .from('push_subscriptions')
    .update({ preferences: updatedPreferences })
    .eq('endpoint', testEndpoint);

  if (updateError) {
    console.error('❌ FAILED to update preferences:', updateError.message);
    process.exit(1);
  }
  console.log('   ✓ Successfully synchronized updated notification preferences.');

  // TEST 4: Delete / Prune Subscription (e.g. on 410 Gone / User Unsubscribe)
  console.log('\n4. Testing Unsubscribe / Stale Token Auto-Pruning (DELETE)...');
  const { error: deleteError } = await supabase
    .from('push_subscriptions')
    .delete()
    .eq('endpoint', testEndpoint);

  if (deleteError) {
    console.error('❌ FAILED to delete subscription:', deleteError.message);
    process.exit(1);
  }
  console.log('   ✓ Successfully deleted subscription record.');

  // Verify deletion
  const { data: deletedCheck } = await supabase
    .from('push_subscriptions')
    .select('id')
    .eq('endpoint', testEndpoint)
    .maybeSingle();

  if (deletedCheck) {
    console.error('❌ Record was not deleted.');
    process.exit(1);
  }
  console.log('   ✓ Verified record deletion (endpoint cleaned from database).');

  console.log('\n' + '='.repeat(72));
  console.log('   ✅ STEP 3 PIPELINE TEST PASSED: ALL DATABASE OPERATIONS VERIFIED');
  console.log('='.repeat(72) + '\n');
}

runTest();
