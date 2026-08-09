-- ====================================================================
-- SUPABASE POSTGRES MIGRATION: 20260810000004_clan_leagues.sql
-- Description: Multiplayer Clan League RPC Procedures & Leaderboard Engine
-- ====================================================================

-- 1. CREATE CLAN STORED PROCEDURE
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.create_clan(
    p_creator_id UUID,
    p_name TEXT,
    p_duration_days INT DEFAULT 30,
    p_initial_capital NUMERIC(12, 2) DEFAULT 1000.00
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_code VARCHAR(6);
    v_clan_id UUID;
BEGIN
    -- Generate unique 6-character room code
    LOOP
        v_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.clans WHERE code = v_code);
    END LOOP;

    -- Insert Clan record
    INSERT INTO public.clans (name, code, creator_id, start_date, end_date, created_at)
    VALUES (
        p_name,
        v_code,
        p_creator_id,
        NOW(),
        NOW() + (p_duration_days || ' days')::INTERVAL,
        NOW()
    )
    RETURNING id INTO v_clan_id;

    -- Automatically add creator as first member
    INSERT INTO public.clan_members (clan_id, user_id, joined_at)
    VALUES (v_clan_id, p_creator_id, NOW());

    RETURN jsonb_build_object(
        'status', 'success',
        'clan_id', v_clan_id,
        'clan_name', p_name,
        'room_code', v_code,
        'initial_capital', p_initial_capital
    );
END;
$$;


-- 2. JOIN CLAN BY ROOM CODE STORED PROCEDURE
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.join_clan_by_code(
    p_user_id UUID,
    p_code TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_clan_id UUID;
    v_clan_name TEXT;
BEGIN
    p_code := UPPER(TRIM(p_code));

    -- Verify room code existence
    SELECT id, name INTO v_clan_id, v_clan_name
    FROM public.clans
    WHERE code = p_code;

    IF v_clan_id IS NULL THEN
        RAISE EXCEPTION 'Invalid league invite code: %', p_code;
    END IF;

    -- Check if user is already a member
    IF EXISTS (SELECT 1 FROM public.clan_members WHERE clan_id = v_clan_id AND user_id = p_user_id) THEN
        RETURN jsonb_build_object(
            'status', 'already_member',
            'clan_id', v_clan_id,
            'clan_name', v_clan_name,
            'room_code', p_code
        );
    END IF;

    -- Add user to clan members
    INSERT INTO public.clan_members (clan_id, user_id, joined_at)
    VALUES (v_clan_id, p_user_id, NOW());

    RETURN jsonb_build_object(
        'status', 'success',
        'clan_id', v_clan_id,
        'clan_name', v_clan_name,
        'room_code', p_code
    );
END;
$$;


-- 3. CLAN LEADERBOARD ROI CALCULATOR PROCEDURE
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_clan_leaderboard(
    p_clan_id UUID
)
RETURNS TABLE (
    rank INT,
    user_id UUID,
    full_name TEXT,
    avatar_url TEXT,
    portfolio_value NUMERIC(12, 2),
    cash_balance NUMERIC(12, 2),
    roi_pct NUMERIC(8, 2),
    joined_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH member_portfolios AS (
        SELECT
            cm.user_id,
            COALESCE(p.full_name, 'Trader #' || SUBSTRING(cm.user_id::TEXT FROM 1 FOR 4)) AS full_name,
            p.avatar_url,
            COALESCE(w.cash_balance, 1000.00) AS cash_balance,
            COALESCE(w.cash_balance, 1000.00) + COALESCE(
                (SELECT SUM(h.quantity * h.average_buy_price) FROM public.holdings h WHERE h.user_id = cm.user_id),
                0.00
            ) AS total_val,
            cm.joined_at
        FROM public.clan_members cm
        LEFT JOIN public.profiles p ON p.id = cm.user_id
        LEFT JOIN public.wallets w ON w.user_id = cm.user_id
        WHERE cm.clan_id = p_clan_id
    )
    SELECT
        (ROW_NUMBER() OVER (ORDER BY ((mp.total_val - 1000.00) / 1000.00) DESC))::INT AS rank,
        mp.user_id,
        mp.full_name,
        mp.avatar_url,
        ROUND(mp.total_val, 2) AS portfolio_value,
        ROUND(mp.cash_balance, 2) AS cash_balance,
        ROUND((((mp.total_val - 1000.00) / 1000.00) * 100.00), 2) AS roi_pct,
        mp.joined_at
    FROM member_portfolios mp
    ORDER BY roi_pct DESC;
END;
$$;
