from fastapi import APIRouter, HTTPException, status
from app.services.trading import (
    PaperTradingService,
    TradeExecutionRequest,
    PortfolioResponse,
)

router = APIRouter()


@router.post("/execute", status_code=status.HTTP_200_OK)
async def execute_paper_order(payload: TradeExecutionRequest):
    """
    Executes an atomic BUY or SELL order for paper trading with virtual balance checks and weighted average buy price upserts.
    """
    try:
        res = PaperTradingService.execute_trade(payload)
        return res
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Order execution failed: {str(e)}",
        )


@router.get("/portfolio/{user_id}", response_model=PortfolioResponse, status_code=status.HTTP_200_OK)
async def get_user_paper_portfolio(user_id: str):
    """
    Returns user paper wallet balance, active holdings with calculated P&L, market value, and total % ROI.
    """
    try:
        portfolio = PaperTradingService.get_user_portfolio(user_id)
        return portfolio
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch portfolio for user {user_id}: {str(e)}",
        )
