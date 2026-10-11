#!/usr/bin/env node
/**
 * CLI Runner: Visitor Logs & Conversion Analytics Inspector
 * 
 * Usage:
 *   npm run analytics:status
 *   npx tsx scripts/check-visitor-logs.ts
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

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

interface VisitorLogRow {
  id: string;
  created_at: string;
  ip_address: string;
  country: string;
  device_agent: string;
  path: string;
  session_id: string;
  is_subscribed: boolean;
}

function padRight(str: string, length: number): string {
  return str.length > length ? str.slice(0, length - 1) + '…' : str.padEnd(length, ' ');
}

async function main() {
  console.log('\n' + '═'.repeat(95));
  console.log('       📊 DAILY TITHI: VISITOR LOGS & PUSH CONVERSION ANALYTICS');
  console.log('═'.repeat(95) + '\n');

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Supabase configuration or SUPABASE_SERVICE_ROLE_KEY missing in .env.local.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  });

  try {
    const { data, error, count } = await supabase
      .from('visitor_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      if (error.code === 'PGRST205') {
        console.error('❌ Error: Table public.visitor_logs was not found in Supabase schema cache.');
        console.error('💡 Solution: Run the SQL script from supabase/migrations/20261012_create_visitor_logs.sql in Supabase SQL Editor.\n');
      } else {
        console.error('❌ Supabase Query Error:', error.message);
      }
      process.exit(1);
    }

    const rows = (data || []) as VisitorLogRow[];
    const totalVisitors = count ?? rows.length;

    // Count converted
    const { count: convertedCount } = await supabase
      .from('visitor_logs')
      .select('*', { count: 'exact', head: true })
      .eq('is_subscribed', true);

    const converted = convertedCount ?? 0;
    const conversionRate = totalVisitors > 0 ? ((converted / totalVisitors) * 100).toFixed(1) : '0.0';

    console.log(`▸ Total Unique Sessions: ${totalVisitors}`);
    console.log(`▸ Converted / Subscribed: ${converted} (${conversionRate}% conversion rate)\n`);

    if (rows.length === 0) {
      console.log('ℹ️  No visitor logs recorded yet.');
      console.log('💡 Visit https://dailytithi.com to register the first edge visitor log.\n');
      return;
    }

    console.log('─'.repeat(95));
    console.log(
      `${padRight('TIME (UTC)', 20)} | ` +
      `${padRight('COUNTRY', 8)} | ` +
      `${padRight('CONVERTED', 10)} | ` +
      `${padRight('PATH', 15)} | ` +
      `${padRight('SESSION ID', 18)} | ` +
      `${padRight('DEVICE / USER AGENT', 14)}`
    );
    console.log('─'.repeat(95));

    rows.forEach((r) => {
      const timeStr = r.created_at ? new Date(r.created_at).toISOString().replace('T', ' ').slice(0, 19) : 'Unknown';
      const statusStr = r.is_subscribed ? '✅ YES' : '❌ NO';
      console.log(
        `${padRight(timeStr, 20)} | ` +
        `${padRight(r.country || 'UNKNOWN', 8)} | ` +
        `${padRight(statusStr, 10)} | ` +
        `${padRight(r.path || '/', 15)} | ` +
        `${padRight(r.session_id.slice(0, 16) + '…', 18)} | ` +
        `${padRight(r.device_agent.slice(0, 14), 14)}`
      );
    });

    console.log('─'.repeat(95) + '\n');
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Diagnostic error:', msg);
    process.exit(1);
  }
}

main();
