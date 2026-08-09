-- ====================================================================
-- SUPABASE POSTGRES MIGRATION: 20260810000002_vector_store.sql
-- Description: DDL & Vector Index setup for MarketGenius RAG Engine
-- ====================================================================

-- 1. ENABLE PGVECTOR EXTENSION
-- --------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. MARKET KNOWLEDGE BASE TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.market_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general' NOT NULL,
    symbol TEXT,
    embedding VECTOR(768), -- Sized for Google Gemini text-embedding-004
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. HNSW VECTOR SIMILARITY INDEX
-- --------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_market_knowledge_embedding_hnsw
    ON public.market_knowledge_base
    USING hnsw (embedding vector_cosine_ops);

-- 4. RPC MATCH DOCUMENTS SIMILARITY SEARCH FUNCTION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.match_market_docs (
    query_embedding VECTOR(768),
    match_threshold FLOAT DEFAULT 0.5,
    match_count INT DEFAULT 5
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    content TEXT,
    category TEXT,
    symbol TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        mk.id,
        mk.title,
        mk.content,
        mk.category,
        mk.symbol,
        (1 - (mk.embedding <=> query_embedding))::FLOAT AS similarity
    FROM public.market_knowledge_base mk
    WHERE (1 - (mk.embedding <=> query_embedding)) > match_threshold
    ORDER BY mk.embedding <=> query_embedding ASC
    LIMIT match_count;
END;
$$;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
-- --------------------------------------------------------------------
ALTER TABLE public.market_knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Market knowledge docs are viewable by everyone" ON public.market_knowledge_base
    FOR SELECT USING (true);

-- 6. INITIAL SEED KNOWLEDGE DOCS
-- --------------------------------------------------------------------
INSERT INTO public.market_knowledge_base (title, content, category, symbol)
VALUES
(
    'Nifty Market Drag Analysis',
    'Nifty 50 experienced intraday selling pressure driven by foreign institutional investor (FII) outflows in IT and Banking heavyweights due to elevated US Treasury yields.',
    'market_news',
    'NIFTY50'
),
(
    'Quant Small Cap Fund Profile',
    'Quant Small Cap Fund focuses on high-beta small-cap equities with active momentum switching, delivering 26.5% CAGR over 3 years with higher downside volatility.',
    'mutual_fund_doc',
    'QUANT_SMALL'
),
(
    'Parag Parikh Flexi Cap Profile',
    'Parag Parikh Flexi Cap Fund maintains a value-oriented multi-cap strategy with 15-20% international equity exposure (Alphabet, Meta), providing lower downside drawdowns.',
    'mutual_fund_doc',
    'PARAG_FLEXI'
)
ON CONFLICT DO NOTHING;
