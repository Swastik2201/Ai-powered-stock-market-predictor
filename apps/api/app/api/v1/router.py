from fastapi import APIRouter
from app.api.v1.endpoints import allocation, forecast, genius, market, search

api_router = APIRouter()

api_router.include_router(market.router, prefix="/market", tags=["Market Data & OHLC Engine"])
api_router.include_router(search.router, prefix="/assets", tags=["Asset Search & Filter"])
api_router.include_router(forecast.router, prefix="/forecast", tags=["Forecast Engine"])
api_router.include_router(allocation.router, prefix="/allocation", tags=["Asset Allocation"])
api_router.include_router(genius.router, prefix="/genius", tags=["Financial Genius AI"])


