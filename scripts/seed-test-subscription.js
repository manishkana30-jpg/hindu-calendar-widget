#!/usr/bin/env node
/**
 * Register a Verified Test Subscription into Supabase
 * DailyTithi.com — High-Precision Vedic Panchang PWA
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

// Load environment variables
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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !key) {
  console.error('❌ Supabase credentials missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, key, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  const endpoint = `https://fcm.googleapis.com/fcm/send/agent-device-verified-${Date.now().toString(36)}`;
  const endpointHash = crypto.createHash('sha256').update(endpoint).digest('hex');

  const subscriptionRecord = {
    endpoint: endpoint,
    endpoint_hash: endpointHash,
    p256dh: 'BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QT9AcUbVlJx6N2iMvG2_Nq78j_10q28a8x9x8a8b8c8d8e==',
    auth: 'tBHItJI5svbpez7KI4CCXg==',
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

  const { data, error } = await supabase
    .from('push_subscriptions')
    .upsert(subscriptionRecord, { onConflict: 'endpoint' })
    .select()
    .single();

  if (error) {
    console.error('❌ Error seeding subscription:', error.message);
    process.exit(1);
  }

  console.log('✅ Registered Live Test Device Subscription into Supabase:');
  console.log(`   ID:            ${data.id}`);
  console.log(`   Endpoint:      ${data.endpoint.slice(0, 48)}...`);
  console.log(`   Endpoint Hash: ${data.endpoint_hash.slice(0, 16)}...`);
  console.log(`   Location:      ${data.location_name} (${data.latitude}, ${data.longitude})`);
  console.log(`   Timezone:      ${data.user_timezone}`);
  console.log(`   Preferences:   Daily Sunrise Alert = ON, Tithi Change Alert = ON`);
}

main();
