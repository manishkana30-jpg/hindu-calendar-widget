-- ============================================================================
-- Daily Tithi — Production RLS Security Lockdown Migration
-- File: supabase/migrations/20261011_lockdown_rls_push_subscriptions.sql
-- ============================================================================
-- Revokes public/anonymous access to the push_subscriptions table.
-- Ensures only the server-side Next.js backend (using SUPABASE_SERVICE_ROLE_KEY)
-- can read, insert, update, and delete push subscriptions.
-- ============================================================================

-- 1. Ensure Row Level Security is Enabled
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Drop all permissive public/anonymous policies
DROP POLICY IF EXISTS "Allow public insert to push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow public select from push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow public update to push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow public delete from push_subscriptions" ON public.push_subscriptions;

-- 3. Explicitly allow service_role full access (service_role automatically bypasses RLS,
-- but adding an explicit policy documents intent and provides defensive security).
CREATE POLICY "Allow service role full access to push_subscriptions"
    ON public.push_subscriptions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- 4. Verify RLS status
COMMENT ON TABLE public.push_subscriptions IS 'Web Push subscriptions and astrometric preferences (RLS Enabled - Service Role Only)';
