-- ====================================================================
-- SUPABASE POSTGRES MIGRATION: 20260810000000_init_schema.sql
-- Description: Core Schema DDL, Triggers, RLS Policies, and Performance Indexes
-- ====================================================================

-- 1. EXTENSIONS & PRAGMA SETUP
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 2. BASE TABLES & CONSTRAINTS
-- --------------------------------------------------------------------

-- User Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    risk_appetite TEXT DEFAULT 'moderate' CHECK (risk_appetite IN ('conservative', 'moderate', 'aggressive')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Virtual Trading Wallets
CREATE TABLE IF NOT EXISTS public.wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    cash_balance NUMERIC(12, 2) DEFAULT 1000.00 NOT NULL CHECK (cash_balance >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Tradable Assets Catalog
CREATE TABLE IF NOT EXISTS public.assets (
    symbol TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('stock', 'etf', 'mutual_fund', 'index', 'commodity', 'ipo')),
    category TEXT,
    current_price NUMERIC(12, 2) DEFAULT 0.00 NOT NULL CHECK (current_price >= 0),
    day_change_pct NUMERIC(6, 2) DEFAULT 0.00 NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trade Execution Transactions
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL REFERENCES public.assets(symbol) ON DELETE RESTRICT,
    type TEXT NOT NULL CHECK (type IN ('BUY', 'SELL')),
    quantity NUMERIC(10, 4) NOT NULL CHECK (quantity > 0),
    execution_price NUMERIC(12, 2) NOT NULL CHECK (execution_price >= 0),
    timestamp TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Portfolio Holdings
CREATE TABLE IF NOT EXISTS public.holdings (
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL REFERENCES public.assets(symbol) ON DELETE RESTRICT,
    quantity NUMERIC(10, 4) DEFAULT 0.0000 NOT NULL CHECK (quantity >= 0),
    average_buy_price NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (average_buy_price >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, symbol)
);

-- Trading Clans / Leagues
CREATE TABLE IF NOT EXISTS public.clans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code VARCHAR(6) UNIQUE NOT NULL,
    creator_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    start_date TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    end_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Clan Memberships
CREATE TABLE IF NOT EXISTS public.clan_members (
    clan_id UUID NOT NULL REFERENCES public.clans(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (clan_id, user_id)
);

-- Gamification Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    questions JSONB DEFAULT '[]'::jsonb NOT NULL,
    reward_amount NUMERIC(10, 2) DEFAULT 50.00 NOT NULL CHECK (reward_amount >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- User Quiz Attempts & Virtual Rewards
CREATE TABLE IF NOT EXISTS public.user_quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    score INT NOT NULL CHECK (score >= 0),
    completed BOOLEAN DEFAULT false NOT NULL,
    reward_credited NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (reward_credited >= 0),
    completed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE (user_id, quiz_id)
);


-- 3. AUTOMATED FUNCTIONS & TRIGGERS
-- --------------------------------------------------------------------

-- Generic Updated-At Timestamp Trigger Function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply Updated-At Triggers
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_wallets_updated_at
    BEFORE UPDATE ON public.wallets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_assets_updated_at
    BEFORE UPDATE ON public.assets
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER set_holdings_updated_at
    BEFORE UPDATE ON public.holdings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- Auto-Create Profile & Wallet on Auth Sign-Up Trigger Function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create public profile
    INSERT INTO public.profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );

    -- Create default paper trading wallet ($1000.00 / ₹1000.00 initial balance)
    INSERT INTO public.wallets (user_id, cash_balance)
    VALUES (NEW.id, 1000.00);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users INSERT
CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clan_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quiz_attempts ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Public profiles are readable by everyone" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Wallets Policies
CREATE POLICY "Users can view own wallet" ON public.wallets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own wallet" ON public.wallets
    FOR UPDATE USING (auth.uid() = user_id);

-- Assets Policies (Public Read, Admin Write via service_role)
CREATE POLICY "Assets are viewable by everyone" ON public.assets
    FOR SELECT USING (true);

-- Transactions Policies
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Holdings Policies
CREATE POLICY "Users can view own holdings" ON public.holdings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own holdings" ON public.holdings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own holdings" ON public.holdings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own holdings" ON public.holdings
    FOR DELETE USING (auth.uid() = user_id);

-- Clans Policies
CREATE POLICY "Users can view clans they belong to or created" ON public.clans
    FOR SELECT USING (
        auth.uid() = creator_id OR
        EXISTS (
            SELECT 1 FROM public.clan_members cm
            WHERE cm.clan_id = public.clans.id AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Authenticated users can create clans" ON public.clans
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their clans" ON public.clans
    FOR UPDATE USING (auth.uid() = creator_id);

-- Clan Members Policies
CREATE POLICY "Clan members can view membership list" ON public.clan_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.clan_members cm
            WHERE cm.clan_id = public.clan_members.clan_id AND cm.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can join a clan" ON public.clan_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave a clan" ON public.clan_members
    FOR DELETE USING (auth.uid() = user_id);

-- Quizzes & Attempts Policies
CREATE POLICY "Quizzes are viewable by authenticated users" ON public.quizzes
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can view own quiz attempts" ON public.user_quiz_attempts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can record own quiz attempts" ON public.user_quiz_attempts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz attempts" ON public.user_quiz_attempts
    FOR UPDATE USING (auth.uid() = user_id);


-- 5. PERFORMANCE INDEXES
-- --------------------------------------------------------------------

-- Transactions lookup optimization (User transaction history sorted by timestamp)
CREATE INDEX IF NOT EXISTS idx_transactions_user_timestamp
    ON public.transactions (user_id, timestamp DESC);

-- Clan membership fast lookups
CREATE INDEX IF NOT EXISTS idx_clan_members_user_id
    ON public.clan_members (user_id);

CREATE INDEX IF NOT EXISTS idx_clan_members_clan_id
    ON public.clan_members (clan_id);

-- Trigram GIN index on assets for instant fuzzy autocompletion
CREATE INDEX IF NOT EXISTS idx_assets_trgm_search
    ON public.assets USING gin (symbol gin_trgm_ops, name gin_trgm_ops);
