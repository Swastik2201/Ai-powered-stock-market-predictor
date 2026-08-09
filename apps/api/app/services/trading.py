from typing import Dict, Any, List
from pydantic import BaseModel, Field
from typing import Literal


class TradeExecutionRequest(BaseModel):
    user_id: str = Field(..., example="user-123")
    symbol: str = Field(..., example="RELIANCE")
    trade_type: Literal["BUY", "SELL"] = Field(..., example="BUY")
    quantity: float = Field(..., gt=0, example=1.5)
    execution_price: float = Field(..., gt=0, example=2980.0)


class HoldingItem(BaseModel):
    symbol: str
    quantity: float
    average_buy_price: float
    current_price: float
    market_value: float
    unrealized_pnl: float
    pnl_pct: float


class PortfolioResponse(BaseModel):
    user_id: str
    cash_balance: float
    invested_value: float
    total_portfolio_value: float
    unrealized_pnl: float
    total_roi_pct: float
    holdings: List[HoldingItem]


# Global In-Memory Paper Trading State Store (for local dev & API simulation)
IN_MEMORY_WALLETS: Dict[str, float] = {
    "user-123": 1000.00,
    "default_user": 1000.00,
}

IN_MEMORY_HOLDINGS: Dict[str, Dict[str, Dict[str, float]]] = {
    "user-123": {
        "NIFTYBEES": {"quantity": 2.5, "average_buy_price": 260.00},
        "GOLDBEES": {"quantity": 5.0, "average_buy_price": 62.00},
    }
}

MARKET_PRICES: Dict[str, float] = {
    "NIFTYBEES": 265.40,
    "GOLDBEES": 64.20,
    "PARAG_FLEXI": 72.40,
    "RELIANCE": 2980.00,
    "TCS": 4210.00,
    "INFY": 1820.00,
    "AAPL": 224.50,
}


class PaperTradingService:
    """
    Paper Trading Virtual Ledger & Order Execution Service.
    """

    @staticmethod
    def execute_trade(request: TradeExecutionRequest) -> Dict[str, Any]:
        user_id = request.user_id
        symbol = request.symbol.upper()
        trade_type = request.trade_type.upper()
        qty = round(request.quantity, 4)
        price = round(request.execution_price, 2)

        total_cost = round(qty * price, 2)

        # Initialize wallet if not existing
        if user_id not in IN_MEMORY_WALLETS:
            IN_MEMORY_WALLETS[user_id] = 1000.00

        cash_balance = IN_MEMORY_WALLETS[user_id]
        user_holdings = IN_MEMORY_HOLDINGS.setdefault(user_id, {})

        if trade_type == "BUY":
            if cash_balance < total_cost:
                raise ValueError(f"Insufficient cash balance. Required: ₹{total_cost}, Available: ₹{cash_balance}")

            # Deduct wallet cash balance
            IN_MEMORY_WALLETS[user_id] = round(cash_balance - total_cost, 2)

            # Upsert holding record using Weighted Average Buy Price formula
            if symbol in user_holdings:
                curr_qty = user_holdings[symbol]["quantity"]
                curr_avg = user_holdings[symbol]["average_buy_price"]
                new_qty = curr_qty + qty
                new_avg = round(((curr_qty * curr_avg) + (qty * price)) / new_qty, 2)
                user_holdings[symbol] = {"quantity": new_qty, "average_buy_price": new_avg}
            else:
                user_holdings[symbol] = {"quantity": qty, "average_buy_price": price}

        elif trade_type == "SELL":
            if symbol not in user_holdings or user_holdings[symbol]["quantity"] < qty:
                avail = user_holdings[symbol]["quantity"] if symbol in user_holdings else 0
                raise ValueError(f"Insufficient holding quantity to sell. Available: {avail}, Requested: {qty}")

            # Credit wallet cash balance
            IN_MEMORY_WALLETS[user_id] = round(cash_balance + total_cost, 2)

            curr_qty = user_holdings[symbol]["quantity"]
            if curr_qty == qty:
                del user_holdings[symbol]
            else:
                user_holdings[symbol]["quantity"] = round(curr_qty - qty, 4)

        return {
            "status": "success",
            "user_id": user_id,
            "trade_type": trade_type,
            "symbol": symbol,
            "quantity": qty,
            "execution_price": price,
            "total_amount": total_cost,
            "remaining_cash": IN_MEMORY_WALLETS[user_id],
        }

    @staticmethod
    def get_user_portfolio(user_id: str) -> PortfolioResponse:
        cash_balance = IN_MEMORY_WALLETS.get(user_id, 1000.00)
        user_holdings = IN_MEMORY_HOLDINGS.get(user_id, {})

        holdings_list: List[HoldingItem] = []
        invested_value = 0.0
        current_market_val = 0.0

        for sym, h in user_holdings.items():
            qty = h["quantity"]
            avg_price = h["average_buy_price"]
            curr_price = MARKET_PRICES.get(sym, avg_price)

            item_invested = qty * avg_price
            item_market_val = qty * curr_price
            item_pnl = item_market_val - item_invested
            item_pnl_pct = (item_pnl / item_invested) * 100.0 if item_invested > 0 else 0.0

            invested_value += item_invested
            current_market_val += item_market_val

            holdings_list.append(
                HoldingItem(
                    symbol=sym,
                    quantity=round(qty, 4),
                    average_buy_price=round(avg_price, 2),
                    current_price=round(curr_price, 2),
                    market_value=round(item_market_val, 2),
                    unrealized_pnl=round(item_pnl, 2),
                    pnl_pct=round(item_pnl_pct, 2),
                )
            )

        total_portfolio_value = round(cash_balance + current_market_val, 2)
        total_unrealized_pnl = round(current_market_val - invested_value, 2)
        total_roi_pct = round(((total_portfolio_value - 1000.00) / 1000.00) * 100.0, 2)

        return PortfolioResponse(
            user_id=user_id,
            cash_balance=round(cash_balance, 2),
            invested_value=round(invested_value, 2),
            total_portfolio_value=total_portfolio_value,
            unrealized_pnl=total_unrealized_pnl,
            total_roi_pct=total_roi_pct,
            holdings=holdings_list,
        )
