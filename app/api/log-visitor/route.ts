import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/src/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface LogVisitorPayload {
  session_id: string;
  ip_address?: string;
  country?: string;
  device_agent?: string;
  path?: string;
}

/**
 * POST /api/log-visitor
 * Internal logging endpoint authenticated via x-internal-log-secret header.
 * Inserts unique visitor device sessions into Supabase PostgreSQL.
 */
export async function POST(req: NextRequest) {
  // 1. Internal Security Verification
  const incomingSecret = req.headers.get('x-internal-log-secret');
  const internalSecret = process.env.INTERNAL_LOG_SECRET;

  if (!internalSecret || incomingSecret !== internalSecret) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing internal log secret.' },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as LogVisitorPayload;
    const { session_id, ip_address = '0.0.0.0', country = 'UNKNOWN', device_agent = 'UNKNOWN', path = '/' } = body;

    if (!session_id || typeof session_id !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request: Valid session_id is required.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service Unavailable: Supabase admin client not initialized.' },
        { status: 503 }
      );
    }

    // 2. Insert row into visitor_logs
    // Using ignoreDuplicates: true to ensure an already converted session (is_subscribed: true)
    // is never overwritten back to false.
    const { error: dbError } = await supabase
      .from('visitor_logs')
      .upsert(
        {
          session_id,
          ip_address,
          country,
          device_agent,
          path,
          is_subscribed: false,
        },
        { onConflict: 'session_id', ignoreDuplicates: true }
      );

    if (dbError) {
      console.error('[Visitor Log Error]', dbError.message);
      return NextResponse.json(
        { error: 'Database Error', details: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      session_id,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown logging failure';
    console.error('[Visitor Log Exception]', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: msg },
      { status: 500 }
    );
  }
}
