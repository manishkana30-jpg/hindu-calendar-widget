-- ============================================================================
-- Daily Tithi — High-Precision Vedic Panchang PWA
-- Migration: Create Web Push Subscriptions Table
-- File: supabase/migrations/20261011_create_push_subscriptions.sql
-- ============================================================================
-- This table stores browser push subscriptions (VAPID/Web Push RFC 8292)
-- allowing server-side crons to deliver daily morning Panchang and
-- real-time Tithi change alerts even when client devices are asleep.
-- ============================================================================

-- 1. Create push_subscriptions Table
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT NOT NULL UNIQUE,
    endpoint_hash VARCHAR(64) NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    user_timezone VARCHAR(64) DEFAULT 'Asia/Kolkata',
    latitude DOUBLE PRECISION DEFAULT 28.6139,
    longitude DOUBLE PRECISION DEFAULT 77.2090,
    location_name TEXT DEFAULT 'New Delhi (India)',
    location_timezone_offset DOUBLE PRECISION DEFAULT 5.5,
    preferences JSONB DEFAULT '{
        "dailyNotification": true,
        "notificationTime": "sunrise",
        "alertOnTithiChange": true,
        "autoUpdate": true,
        "wifiOnly": false,
        "sound": true,
        "vibration": true
    }'::jsonb,
    last_daily_date_notified VARCHAR(16) DEFAULT NULL,
    last_tithi_index_notified INTEGER DEFAULT NULL,
    last_tithi_notified_at BIGINT DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_validated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Performance Indexes for High-Speed Batch Cron Dispatches
CREATE INDEX IF NOT EXISTS idx_push_subs_active
    ON public.push_subscriptions (is_active)
    WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_push_subs_endpoint_hash
    ON public.push_subscriptions (endpoint_hash);

CREATE INDEX IF NOT EXISTS idx_push_subs_timezone
    ON public.push_subscriptions (user_timezone);

CREATE INDEX IF NOT EXISTS idx_push_subs_daily_active
    ON public.push_subscriptions (is_active, ((preferences->>'dailyNotification')::boolean))
    WHERE is_active = TRUE;

-- 3. Automatic updated_at Timestamp Trigger
CREATE OR REPLACE FUNCTION public.handle_push_subs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_push_subs_updated_at ON public.push_subscriptions;
CREATE TRIGGER trg_push_subs_updated_at
    BEFORE UPDATE ON public.push_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_push_subs_updated_at();

-- 4. Enable Row Level Security (RLS) - Server-Side Service Role Only
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Block public/anon client access; allow backend Next.js operations via service_role
CREATE POLICY "Allow service role full access to push_subscriptions"
    ON public.push_subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

COMMENT ON TABLE public.push_subscriptions IS 'Web Push subscriptions and astrometric notification preferences for Daily Tithi PWA';
COMMENT ON COLUMN public.push_subscriptions.endpoint IS 'Browser push service endpoint URL (FCM, Apple APNs, Mozilla autopush)';
COMMENT ON COLUMN public.push_subscriptions.endpoint_hash IS 'SHA-256 hash of endpoint for fast indexing and lookups';
COMMENT ON COLUMN public.push_subscriptions.p256dh IS 'Client public key curve point for ECDH message encryption';
COMMENT ON COLUMN public.push_subscriptions.auth IS 'Client authentication secret for HKDF key derivation';
COMMENT ON COLUMN public.push_subscriptions.is_active IS 'Set to false if push service returns 404/410 Gone (auto-pruned)';
