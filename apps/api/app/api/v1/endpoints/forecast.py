from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List
from app.services.forecaster import ForecasterService
from app.services.sentiment import SentimentAnalysisService

router = APIRouter()


class ForecastPoint(BaseModel):
    date: str
    yhat_lower: float
    yhat: float
    yhat_upper: float


class StockForecastResponse(BaseModel):
    symbol: str
    last_price: float
    forecast_days: int
    sentiment_score: float
    sentiment_label: str
    risk_level: str
    forecast: List[ForecastPoint]
    disclaimer: str


@router.get("/forecast/{symbol}", response_model=StockForecastResponse, status_code=status.HTTP_200_OK)
async def get_stock_forecast(symbol: str):
    """
    Returns 30-day Prophet/Holt-Winters ML time-series forecast corridor along with news sentiment risk index.
    """
    try:
        forecast_res = ForecasterService.generate_stock_forecast(symbol, days=30)
        sentiment_res = SentimentAnalysisService.analyze_news_sentiment(symbol)

        return StockForecastResponse(
            symbol=forecast_res["symbol"],
            last_price=forecast_res["last_price"],
            forecast_days=forecast_res["forecast_days"],
            sentiment_score=sentiment_res["sentiment_score"],
            sentiment_label=sentiment_res["sentiment_label"],
            risk_level=sentiment_res["risk_level"],
            forecast=[ForecastPoint(**p) for p in forecast_res["forecast"]],
            disclaimer="Educational probabilistic projection only. Not financial investment advice.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate predictive forecast for {symbol}: {str(e)}",
        )
