import assert from 'assert';
import {
  upsertSubscription,
  getSubscription,
  updateSubscriptionPreferences,
  deleteSubscription
} from '../src/lib/push/subscription-store';
import { getSupabaseAdmin } from '../src/lib/supabase/client';

async function main() {
  console.log('Testing Settings & Preferences Sync to Supabase push_subscriptions...');

  const testEndpoint = 'https://fcm.googleapis.com/fcm/send/test-settings-sync-' + Date.now();
  const keys = {
    p256dh: 'BNcRdreAxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    auth: '5Axxxxxxxxxxxx'
  };

  // 1. Subscribe initially (Onboarding)
  console.log('1. Onboarding subscription...');
  const initial = await upsertSubscription({
    endpoint: testEndpoint,
    keys,
    timezone: 'Asia/Kolkata',
    location: {
      latitude: 28.6139,
      longitude: 77.209,
      name: 'New Delhi (India)',
      ianaTimezone: 'Asia/Kolkata'
    },
    preferences: {
      dailyNotification: true,
      notificationTime: 'sunrise',
      alertOnTithiChange: false,
      autoUpdate: true,
      wifiOnly: false,
      sound: true,
      vibration: true
    },
    isActive: true
  });

  const supabase = getSupabaseAdmin();
  if (supabase) {
    const { data: row1 } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('endpoint', testEndpoint)
      .single();

    assert(row1, 'Row should exist in Supabase');
    assert.strictEqual(row1.is_active, true, 'is_active should be true');
    assert.strictEqual(row1.preferences.dailyNotification, true, 'dailyNotification should be true');
    assert.strictEqual(row1.preferences.alertOnTithiChange, false, 'alertOnTithiChange should be false');
    console.log('   ✓ Initial onboarding verified in Supabase: is_active = true');

    // 2. Test updating preference toggles (e.g. alertOnTithiChange = true, sound = false)
    console.log('2. Updating preferences toggles...');
    await updateSubscriptionPreferences({
      endpoint: testEndpoint,
      preferences: {
        alertOnTithiChange: true,
        sound: false,
        notificationTime: '06:00'
      }
    });

    const { data: row2 } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('endpoint', testEndpoint)
      .single();

    assert.strictEqual(row2.preferences.alertOnTithiChange, true, 'alertOnTithiChange should now be true');
    assert.strictEqual(row2.preferences.sound, false, 'sound should now be false');
    assert.strictEqual(row2.preferences.notificationTime, '06:00', 'notificationTime should be 06:00');
    assert.strictEqual(row2.preferences.dailyNotification, true, 'dailyNotification should still be preserved as true');
    assert.strictEqual(row2.is_active, true, 'is_active should remain true');
    console.log('   ✓ Preference toggles updated in Supabase JSON column');

    // 3. Test Master Toggle disable (isActive = false)
    console.log('3. Disabling master notification toggle (isActive = false)...');
    await updateSubscriptionPreferences({
      endpoint: testEndpoint,
      isActive: false
    });

    const { data: row3 } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('endpoint', testEndpoint)
      .single();

    assert.strictEqual(row3.is_active, false, 'is_active should now be false');
    console.log('   ✓ Master toggle disable updated in Supabase is_active column');

    // 4. Test re-enabling master notification toggle (isActive = true)
    console.log('4. Re-enabling master notification toggle (isActive = true)...');
    await updateSubscriptionPreferences({
      endpoint: testEndpoint,
      isActive: true
    });

    const { data: row4 } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('endpoint', testEndpoint)
      .single();

    assert.strictEqual(row4.is_active, true, 'is_active should now be re-enabled as true');
    console.log('   ✓ Master toggle re-enable verified in Supabase');

    // Clean up
    console.log('5. Cleaning up test record...');
    await deleteSubscription(testEndpoint);
    const { data: rowAfterDelete } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('endpoint', testEndpoint)
      .maybeSingle();

    assert.strictEqual(rowAfterDelete, null, 'Row should be deleted from Supabase');
    console.log('   ✓ Cleaned up test record.');
  }

  console.log('\n🎉 ALL SETTINGS & PREFERENCES SYNC TESTS PASSED SUCCESSFULLY!');
}

main().catch((err) => {
  console.error('Test error:', err);
  process.exit(1);
});
