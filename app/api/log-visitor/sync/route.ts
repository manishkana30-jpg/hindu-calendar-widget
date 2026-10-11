import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/src/lib/supabase/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/log-visitor/sync
 * Lightweight sync endpoint for recognizing returning subscribers on page load.
 * 
 * When the client browser detects `Notification.permission === 'granted'` or an active
 * Web Push subscription, it pings this endpoint so the current 24h visitor_session
 * is marked as converted (`is_subscribed: true`) in Supabase visitor_logs.
 */
export async function POST(req: NextRequest) {
  try {
    let bodySessionId: string | undefined;
    try {
      const body = await req.json();
      bodySessionId = body?.session_id;
    } catch {
      // Body is optional if cookie is sent
    }

    const sessionId = req.cookies.get('visitor_session')?.value || bodySessionId;

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        message: 'No visitor_session cookie or session_id provided.',
      });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Service Unavailable: Supabase admin client not initialized.' },
        { status: 503 }
      );
    }

    const { error: dbError } = await supabase
      .from('visitor_logs')
      .update({ is_subscribed: true })
      .eq('session_id', sessionId);

    if (dbError) {
      console.warn('[Visitor Sync Warning]', dbError.message);
      return NextResponse.json(
        { error: 'Database update failed', details: dbError.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: true,
      session_id: sessionId,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Unknown sync failure';
    console.error('[Visitor Sync Exception]', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: msg },
      { status: 500 }
    );
  }
}
