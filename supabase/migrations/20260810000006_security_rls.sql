-- ====================================================================
-- SUPABASE POSTGRES MIGRATION: 20260810000006_security_rls.sql
-- Description: Production Row Level Security (RLS) & Security Hardening
-- ====================================================================

-- 1. ENABLE ROW LEVEL SECURITY ACROSS ALL SENSITIVE TABLES
-- --------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- 2. CREATE STRICT PER-USER DATA ISOLATION POLICIES
-- --------------------------------------------------------------------
DROP POLICY IF EXISTS "Users access own profile" ON public.profiles;
CREATE POLICY "Users access own profile"
    ON public.profiles FOR ALL
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users access own wallet" ON public.wallets;
CREATE POLICY "Users access own wallet"
    ON public.wallets FOR ALL
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own trades" ON public.transactions;
CREATE POLICY "Users access own trades"
    ON public.transactions FOR ALL
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own holdings" ON public.holdings;
CREATE POLICY "Users access own holdings"
    ON public.holdings FOR ALL
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own quiz attempts" ON public.user_quiz_attempts;
CREATE POLICY "Users access own quiz attempts"
    ON public.user_quiz_attempts FOR ALL
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users access own badges" ON public.user_badges;
CREATE POLICY "Users access own badges"
    ON public.user_badges FOR ALL
    USING (auth.uid() = user_id);
