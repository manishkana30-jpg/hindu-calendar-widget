-- ============================================================================
-- Supabase Row Level Security (RLS) Policies for push_subscriptions
-- File: supabase/migrations/20261011_enable_rls_policies.sql
-- ============================================================================
-- Run this in Supabase Dashboard -> SQL Editor if you are using the
-- Publishable / Anon Key without the service_role key.
-- ============================================================================

-- 1. Ensure RLS is enabled
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Allow public insert to push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow public select from push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow public update to push_subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Allow public delete from push_subscriptions" ON public.push_subscriptions;

-- 3. Create permissive policies for push subscriptions
CREATE POLICY "Allow public insert to push_subscriptions" 
    ON public.push_subscriptions FOR INSERT 
    TO anon, authenticated, service_role 
    WITH CHECK (true);

CREATE POLICY "Allow public select from push_subscriptions" 
    ON public.push_subscriptions FOR SELECT 
    TO anon, authenticated, service_role 
    USING (true);

CREATE POLICY "Allow public update to push_subscriptions" 
    ON public.push_subscriptions FOR UPDATE 
    TO anon, authenticated, service_role 
    USING (true) 
    WITH CHECK (true);

CREATE POLICY "Allow public delete from push_subscriptions" 
    ON public.push_subscriptions FOR DELETE 
    TO anon, authenticated, service_role 
    USING (true);
