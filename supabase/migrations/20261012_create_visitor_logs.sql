-- ============================================================================
-- Daily Tithi — Visitor Logs & Push Conversion Tracking
-- File: supabase/migrations/20261012_create_visitor_logs.sql
-- ============================================================================
-- Tracks unique visitor sessions, geo-headers, and subscription conversion
-- states securely using Next.js Edge Middleware and internal Service Role calls.
-- ============================================================================

-- 1. Create visitor_logs Table
CREATE TABLE IF NOT EXISTS public.visitor_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address TEXT,
    country VARCHAR(16) DEFAULT 'UNKNOWN',
    device_agent TEXT,
    path TEXT DEFAULT '/',
    session_id VARCHAR(64) NOT NULL,
    is_subscribed BOOLEAN DEFAULT FALSE
);

-- 2. Indexes for High-Speed Querying & Conversion Deduplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_visitor_logs_session_id
    ON public.visitor_logs (session_id);

CREATE INDEX IF NOT EXISTS idx_visitor_logs_created_at
    ON public.visitor_logs (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_visitor_logs_conversion
    ON public.visitor_logs (is_subscribed, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_visitor_logs_country
    ON public.visitor_logs (country);

-- 3. Row Level Security (RLS) - Backend Service Role Access Only
ALTER TABLE public.visitor_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow service role full access to visitor_logs" ON public.visitor_logs;
CREATE POLICY "Allow service role full access to visitor_logs"
    ON public.visitor_logs
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE public.visitor_logs IS 'Unique visitor logs with Cloudflare/Vercel headers and push conversion tracking';
COMMENT COLUMN public.visitor_logs.session_id IS '24-hour unique visitor session UUID from visitor_session cookie';
COMMENT COLUMN public.visitor_logs.is_subscribed IS 'True if the visitor has converted or is a recognized push subscriber';

-- ============================================================================
-- 4. One-Time Backfill Script: Historical Subscribers -> visitor_logs
-- ============================================================================
-- Copies existing sleeping / historical devices from push_subscriptions into visitor_logs
-- Sets is_subscribed = TRUE, mapping creation timestamp with placeholder headers.
INSERT INTO public.visitor_logs (
    created_at,
    ip_address,
    country,
    device_agent,
    path,
    session_id,
    is_subscribed
)
SELECT 
    COALESCE(ps.created_at, NOW()) AS created_at,
    '0.0.0.0' AS ip_address,
    CASE 
        WHEN ps.user_timezone LIKE 'Asia/Kolkata%' THEN 'IN'
        WHEN ps.user_timezone LIKE 'America/%' THEN 'US'
        WHEN ps.user_timezone LIKE 'Europe/%' THEN 'EU'
        ELSE 'UNKNOWN'
    END AS country,
    'Historical/Sleeping Device' AS device_agent,
    '/' AS path,
    -- Generates idempotent session_id based on endpoint_hash or gen_random_uuid()
    COALESCE('hist_' || SUBSTRING(ps.endpoint_hash, 1, 32), gen_random_uuid()::text) AS session_id,
    TRUE AS is_subscribed
FROM public.push_subscriptions ps
ON CONFLICT (session_id) DO NOTHING;
