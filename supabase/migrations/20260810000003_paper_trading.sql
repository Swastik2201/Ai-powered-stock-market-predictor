-- ====================================================================
-- SUPABASE POSTGRES MIGRATION: 20260810000003_paper_trading.sql
-- Description: PL/pgSQL Atomic Paper Trading Ledger Stored Procedure
-- ====================================================================

-- 1. ATOMIC PAPER TRADING TRANSACTION FUNCTION
-- --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.execute_paper_trade(
    p_user_id UUID,
    p_symbol TEXT,
    p_trade_type TEXT, -- 'BUY' or 'SELL'
    p_quantity NUMERIC(10, 4),
    p_execution_price NUMERIC(10, 2)
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_total_cost NUMERIC(12, 2);
    v_current_cash NUMERIC(12, 2);
    v_current_holding_qty NUMERIC(10, 4);
    v_wallet_id UUID;
BEGIN
    -- Input sanitization
    p_trade_type := UPPER(TRIM(p_trade_type));
    p_symbol := UPPER(TRIM(p_symbol));

    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'Order quantity must be greater than zero.';
    END IF;

    IF p_execution_price <= 0 THEN
        RAISE EXCEPTION 'Execution price must be greater than zero.';
    END IF;

    v_total_cost := ROUND(p_quantity * p_execution_price, 2);

    -- Fetch and lock user wallet balance (Atomic Row Locking)
    SELECT id, cash_balance INTO v_wallet_id, v_current_cash
    FROM public.wallets
    WHERE user_id = p_user_id
    FOR UPDATE;

    IF v_wallet_id IS NULL THEN
        -- Auto-provision wallet if missing
        INSERT INTO public.wallets (user_id, cash_balance)
        VALUES (p_user_id, 1000.00)
        RETURNING id, cash_balance INTO v_wallet_id, v_current_cash;
    END IF;

    -- ----------------------------------------------------
    -- BUY ORDER LOGIC
    -- ----------------------------------------------------
    IF p_trade_type = 'BUY' THEN
        -- 1. Check sufficiency of funds
        IF v_current_cash < v_total_cost THEN
            RAISE EXCEPTION 'Insufficient cash balance. Required: %, Available: %', v_total_cost, v_current_cash;
        END IF;

        -- 2. Deduct cash balance from wallet
        UPDATE public.wallets
        SET cash_balance = cash_balance - v_total_cost,
            updated_at = NOW()
        WHERE id = v_wallet_id;

        -- 3. Upsert Holdings using Weighted Average Buy Price formula
        INSERT INTO public.holdings (user_id, symbol, quantity, average_buy_price, updated_at)
        VALUES (p_user_id, p_symbol, p_quantity, p_execution_price, NOW())
        ON CONFLICT (user_id, symbol)
        DO UPDATE SET
            average_buy_price = ((holdings.quantity * holdings.average_buy_price) + (EXCLUDED.quantity * EXCLUDED.average_buy_price)) / (holdings.quantity + EXCLUDED.quantity),
            quantity = holdings.quantity + EXCLUDED.quantity,
            updated_at = NOW();

    -- ----------------------------------------------------
    -- SELL ORDER LOGIC
    -- ----------------------------------------------------
    ELSIF p_trade_type = 'SELL' THEN
        SELECT quantity INTO v_current_holding_qty
        FROM public.holdings
        WHERE user_id = p_user_id AND symbol = p_symbol;

        IF v_current_holding_qty IS NULL OR v_current_holding_qty < p_quantity THEN
            RAISE EXCEPTION 'Insufficient holding quantity to sell. Holding: %, Requested: %', COALESCE(v_current_holding_qty, 0), p_quantity;
        END IF;

        -- 1. Credit balance back to wallet
        UPDATE public.wallets
        SET cash_balance = cash_balance + v_total_cost,
            updated_at = NOW()
        WHERE id = v_wallet_id;

        -- 2. Update or remove holding record
        IF v_current_holding_qty = p_quantity THEN
            DELETE FROM public.holdings WHERE user_id = p_user_id AND symbol = p_symbol;
        ELSE
            UPDATE public.holdings
            SET quantity = quantity - p_quantity,
                updated_at = NOW()
            WHERE user_id = p_user_id AND symbol = p_symbol;
        END IF;

    ELSE
        RAISE EXCEPTION 'Invalid trade_type. Must be BUY or SELL.';
    END IF;

    -- 4. Record transaction history log
    INSERT INTO public.transactions (user_id, symbol, type, quantity, execution_price, timestamp)
    VALUES (p_user_id, p_symbol, p_trade_type, p_quantity, p_execution_price, NOW());

    RETURN jsonb_build_object(
        'status', 'success',
        'trade_type', p_trade_type,
        'symbol', p_symbol,
        'quantity', p_quantity,
        'execution_price', p_execution_price,
        'total_amount', v_total_cost
    );
END;
$$;
