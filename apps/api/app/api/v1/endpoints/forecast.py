# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, status
# pyrefly: ignore [missing-import]
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


@router.get("/{symbol}", response_model=StockForecastResponse, status_code=status.HTTP_200_OK)
async def get_symbol_forecast(symbol: str, days: int = 30):
    """
    Generates Prophet 30-day price corridor forecast & news sentiment risk score.
    """
    try:
        data = ForecasterService.generate_prophet_corridor(symbol=symbol, days=days)
        sentiment = SentimentAnalysisService.score_news_sentiment(symbol=symbol)

        return StockForecastResponse(
            symbol=data["symbol"],
            last_price=data["last_price"],
            forecast_days=data["forecast_days"],
            sentiment_score=sentiment["sentiment_score"],
            sentiment_label=sentiment["sentiment_label"],
            risk_level=sentiment["risk_level"],
            forecast=data["forecast"],
            disclaimer="Forecast generated via Prophet time-series ML models. Not financial advice.",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Forecast generation failed for symbol {symbol}: {str(e)}",
        )
