from fastapi import APIRouter
from app.api.v1.endpoints import allocation, forecast, genius, market, risk, search, screeners, trading, clans, gamification

api_router = APIRouter()

api_router.include_router(market.router, prefix="/market", tags=["Market Data & OHLC Engine"])
api_router.include_router(risk.router, prefix="/market", tags=["5-Axis Risk Radar"])
api_router.include_router(trading.router, prefix="/trading", tags=["Paper Trading Virtual Ledger"])
api_router.include_router(clans.router, prefix="/clans", tags=["Multiplayer Clan Leagues"])
api_router.include_router(gamification.router, prefix="/gamification", tags=["Quiz & Badges Gamification"])
api_router.include_router(search.router, prefix="/assets", tags=["Asset Search & Filter"])
api_router.include_router(screeners.router, prefix="/screeners", tags=["IPO & Intraday Screeners"])
api_router.include_router(forecast.router, prefix="/forecast", tags=["Forecast Engine"])
api_router.include_router(allocation.router, prefix="/allocation", tags=["Asset Allocation"])
api_router.include_router(genius.router, prefix="/genius", tags=["Financial Genius AI"])







