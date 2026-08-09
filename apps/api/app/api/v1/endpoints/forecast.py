# pyrefly: ignore [missing-import]
from fastapi import APIRouter
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import List

router = APIRouter()


class ForecastRequest(BaseModel):
    ticker: str = "AAPL"
    forecast_days: int = 30


class PricePoint(BaseModel):
    date: str
    predicted_price: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    ticker: str
    days: int
    forecast: List[PricePoint]


@router.post("/predict", response_model=ForecastResponse)
async def predict_stock_trend(payload: ForecastRequest):
    """
    Generates time-series stock price predictions using Prophet model.
    """
    # Sample mock forecast data points
    return ForecastResponse(
        ticker=payload.ticker.upper(),
        days=payload.forecast_days,
        forecast=[
            PricePoint(
                date="2026-08-10",
                predicted_price=225.50,
                lower_bound=220.00,
                upper_bound=231.00
            ),
            PricePoint(
                date="2026-08-11",
                predicted_price=227.10,
                lower_bound=221.50,
                upper_bound=232.70
            )
        ]
    )
