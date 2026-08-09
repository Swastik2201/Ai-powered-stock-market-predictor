-- ====================================================================
-- SUPABASE POSTGRES MIGRATION: 20260810000001_ipo_screeners.sql
-- Description: DDL for IPO Intelligence Hub and Intraday Breakout Screeners
-- ====================================================================

-- 1. IPO INTELLIGENCE TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.ipos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name TEXT NOT NULL,
    symbol TEXT UNIQUE NOT NULL,
    issue_start_date DATE NOT NULL,
    issue_end_date DATE NOT NULL,
    listing_date DATE,
    price_band_min NUMERIC(12, 2) NOT NULL CHECK (price_band_min >= 0),
    price_band_max NUMERIC(12, 2) NOT NULL CHECK (price_band_max >= price_band_min),
    issue_size_cr NUMERIC(12, 2) NOT NULL CHECK (issue_size_cr > 0),
    lot_size INT NOT NULL CHECK (lot_size > 0),
    status TEXT NOT NULL CHECK (status IN ('upcoming', 'ongoing', 'listed')),
    gmp_amount NUMERIC(12, 2) DEFAULT 0.00 NOT NULL,
    gmp_percent NUMERIC(6, 2) DEFAULT 0.00 NOT NULL,
    qib_subscription NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (qib_subscription >= 0),
    nii_subscription NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (nii_subscription >= 0),
    retail_subscription NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (retail_subscription >= 0),
    total_subscription NUMERIC(10, 2) DEFAULT 0.00 NOT NULL CHECK (total_subscription >= 0),
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. INTRADAY BREAKOUT SIGNALS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.intraday_breakouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    symbol TEXT NOT NULL REFERENCES public.assets(symbol) ON DELETE CASCADE,
    signal_type TEXT NOT NULL CHECK (signal_type IN ('VOLUME_SPIKE', 'PRICE_BREAKOUT', '52W_HIGH_CROSS', 'RSI_OVERSOLD')),
    timeframe VARCHAR(5) DEFAULT '5m' NOT NULL,
    price_at_signal NUMERIC(12, 2) NOT NULL CHECK (price_at_signal >= 0),
    volume_ratio NUMERIC(10, 2) DEFAULT 1.00 NOT NULL,
    change_pct NUMERIC(6, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. AUTOMATED UPDATED_AT TRIGGER FOR IPOS
-- --------------------------------------------------------------------
CREATE TRIGGER set_ipos_updated_at
    BEFORE UPDATE ON public.ipos
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.ipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.intraday_breakouts ENABLE ROW LEVEL SECURITY;

-- Read access for all authenticated & anonymous users
CREATE POLICY "IPOs are viewable by everyone" ON public.ipos
    FOR SELECT USING (true);

CREATE POLICY "Intraday breakouts are viewable by everyone" ON public.intraday_breakouts
    FOR SELECT USING (true);

-- 5. PERFORMANCE INDEXES
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_ipos_status_end_date
    ON public.ipos (status, issue_end_date ASC);

CREATE INDEX IF NOT EXISTS idx_intraday_breakouts_symbol_time
    ON public.intraday_breakouts (symbol, created_at DESC);
