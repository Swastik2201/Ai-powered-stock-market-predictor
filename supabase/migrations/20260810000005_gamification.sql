-- ====================================================================
-- SUPABASE POSTGRES MIGRATION: 20260810000005_gamification.sql
-- Description: Daily Financial Literacy Quiz & Badge Engine Schema
-- ====================================================================

-- 1. SCHEMAS & TABLES SETUP
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    question TEXT NOT NULL,
    options JSONB NOT NULL, -- Array of strings e.g. ["Option A", "Option B", ...]
    correct_option_index INT NOT NULL,
    explanation TEXT NOT NULL,
    topic TEXT DEFAULT 'general' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_quiz_attempts (
    user_id UUID NOT NULL,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    selected_option INT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    reward_claimed NUMERIC(10, 2) DEFAULT 0.00 NOT NULL,
    attempted_date DATE DEFAULT CURRENT_DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, attempted_date)
);

CREATE TABLE IF NOT EXISTS public.badges (
    id TEXT PRIMARY KEY, -- e.g. 'diversification_guru', 'diamond_hands', 'clan_champion'
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT NOT NULL,
    category TEXT DEFAULT 'achievement' NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS public.user_badges (
    user_id UUID NOT NULL,
    badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    PRIMARY KEY (user_id, badge_id)
);


-- 2. DAILY QUIZ SUBMISSION & REWARD PROCEDURE
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.submit_daily_quiz(
    p_user_id UUID,
    p_quiz_id UUID,
    p_selected_option INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_correct_index INT;
    v_explanation TEXT;
    v_is_correct BOOLEAN;
    v_reward NUMERIC(10, 2) := 0.00;
BEGIN
    -- Check if user already attempted a quiz today
    IF EXISTS (SELECT 1 FROM public.user_quiz_attempts WHERE user_id = p_user_id AND attempted_date = CURRENT_DATE) THEN
        RAISE EXCEPTION 'Daily quiz already attempted today. Please return tomorrow!';
    END IF;

    -- Fetch quiz answer key
    SELECT correct_option_index, explanation INTO v_correct_index, v_explanation
    FROM public.quizzes
    WHERE id = p_quiz_id;

    IF v_correct_index IS NULL THEN
        RAISE EXCEPTION 'Quiz question not found.';
    END IF;

    v_is_correct := (p_selected_option = v_correct_index);

    -- Credit +₹50.00 virtual cash reward if correct
    IF v_is_correct THEN
        v_reward := 50.00;

        UPDATE public.wallets
        SET cash_balance = cash_balance + v_reward,
            updated_at = NOW()
        WHERE user_id = p_user_id;

        -- Log reward transaction bonus
        INSERT INTO public.transactions (user_id, symbol, type, quantity, execution_price, timestamp)
        VALUES (p_user_id, 'BONUS', 'QUIZ_REWARD', 1.0, v_reward, NOW());
    END IF;

    -- Record daily attempt
    INSERT INTO public.user_quiz_attempts (user_id, quiz_id, selected_option, is_correct, reward_claimed, attempted_date)
    VALUES (p_user_id, p_quiz_id, p_selected_option, v_is_correct, v_reward, CURRENT_DATE);

    RETURN jsonb_build_object(
        'status', 'success',
        'is_correct', v_is_correct,
        'reward_claimed', v_reward,
        'explanation', v_explanation
    );
END;
$$;


-- 3. SEED BADGES & QUIZ DATA
-- --------------------------------------------------------------------
INSERT INTO public.badges (id, title, description, icon, category)
VALUES
    ('diversification_guru', 'Diversification Guru', 'Hold at least 3 distinct asset classes (e.g. Stocks, Gold, ETFs) simultaneously.', 'PieChart', 'asset_allocation'),
    ('diamond_hands', 'Diamond Hands', 'Hold an asset through a >5% market drawdown for 14+ days without panic selling.', 'Shield', 'trading_discipline'),
    ('clan_champion', 'Clan Champion', 'Finish #1 on a multiplayer clan league leaderboard at tournament end.', 'Trophy', 'social_league')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;

INSERT INTO public.quizzes (id, question, options, correct_option_index, explanation, topic)
VALUES
    ('11111111-1111-1111-1111-111111111111',
     'What does the Rule of 72 calculate in financial compounding?',
     '["The exact tax rate on long-term capital gains", "The approximate number of years needed to double an investment", "The maximum limit for SIP investments per year", "The annual expense ratio of index mutual funds"]'::jsonb,
     1,
     'The Rule of 72 is a quick mental shortcut: divide 72 by your annual interest rate to find the years needed to double your money (e.g. at 12% return, 72 / 12 = 6 years).',
     'compound_interest')
ON CONFLICT (id) DO NOTHING;
