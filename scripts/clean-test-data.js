const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envLocalPath = path.join(process.cwd(), '.env.local');
const env = {};
if (fs.existsSync(envLocalPath)) {
  fs.readFileSync(envLocalPath, 'utf8').split('\n').forEach(line => {
    const idx = line.indexOf('=');
    if (idx > 0 && !line.startsWith('#')) {
      env[line.slice(0, idx).trim()] = line.slice(idx + 1).trim();
    }
  });
}

const supabase = createClient(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
);

async function clean() {
  const { error } = await supabase
    .from('push_subscriptions')
    .delete()
    .like('endpoint', '%agent-device%');

  if (error) {
    console.error('Clean error:', error.message);
  } else {
    console.log('✅ Cleaned up synthetic test subscriptions from Supabase.');
  }

  const { count } = await supabase
    .from('push_subscriptions')
    .select('id', { count: 'exact', head: true });
  console.log(`Current real subscriber count: ${count ?? 0}`);
}

clean();
