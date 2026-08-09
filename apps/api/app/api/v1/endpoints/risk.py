from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any
from app.services.risk_radar import RiskRadarService

router = APIRouter()


class MetricDetail(BaseModel):
    score: float
    raw_value: str
    benchmark: str


class RiskRadarResponse(BaseModel):
    symbol: str
    overall_score: float
    risk_classification: str
    metrics: Dict[str, MetricDetail]


@router.get("/risk-radar/{symbol}", response_model=RiskRadarResponse, status_code=status.HTTP_200_OK)
async def get_risk_radar(symbol: str):
    """
    Returns 5-axis normalized quantitative risk scores (Valuation, Growth, Financial Health, Momentum, Volatility).
    """
    try:
        data = RiskRadarService.calculate_risk_radar(symbol)
        return RiskRadarResponse(**data)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to calculate risk radar for {symbol}: {str(e)}",
        )
