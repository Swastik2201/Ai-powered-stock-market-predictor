from fastapi import APIRouter, Query, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional
from app.core.config import settings
from app.services.cache_service import cache_service
from app.services.market_data_service import MarketDataService

router = APIRouter()


class QuoteResponse(BaseModel):
    symbol: str
    name: str
    price: float
    day_change: float
    day_change_pct: float
    day_high: float
    day_low: float
    volume: int
    currency: str
    updated_at: str
    cached: bool = False


class OHLCPoint(BaseModel):
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: int


class OHLCResponse(BaseModel):
    symbol: str
    timeframe: str
    candles: List[OHLCPoint]
    cached: bool = False


@router.get("/quote/{symbol}", response_model=QuoteResponse)
async def get_market_quote(symbol: str):
    """
    Returns real-time or cached market quote for the given symbol (e.g., AAPL, RELIANCE.NS).
    Data is cached for 15s to prevent hitting upstream API rate limits.
    """
    clean_symbol = symbol.upper().strip()
    cache_key = f"market:quote:{clean_symbol}"

    # 1. Check Redis / Memory cache
    cached_quote = await cache_service.get_json(cache_key)
    if cached_quote:
        cached_quote["cached"] = True
        return cached_quote

    # 2. Fetch live data on cache miss
    live_quote = MarketDataService.fetch_live_quote(clean_symbol)
    await cache_service.set_json(cache_key, live_quote, ttl=settings.CACHE_TTL_SECONDS)
    live_quote["cached"] = False
    return live_quote


@router.get("/ohlc/{symbol}", response_model=OHLCResponse)
async def get_ohlc_history(
    symbol: str,
    timeframe: Optional[str] = Query("1M", description="Timeframe: 1D, 1W, 1M, 1Y, ALL")
):
    """
    Returns aggregated Open-High-Low-Close (OHLC) candles for chart rendering.
    """
    clean_symbol = symbol.upper().strip()
    clean_tf = timeframe.upper().strip() if timeframe else "1M"
    cache_key = f"market:ohlc:{clean_symbol}:{clean_tf}"

    # Check cache (1 hour TTL for OHLC data)
    cached_ohlc = await cache_service.get_json(cache_key)
    if cached_ohlc:
        return OHLCResponse(
            symbol=clean_symbol,
            timeframe=clean_tf,
            candles=[OHLCPoint(**c) for c in cached_ohlc],
            cached=True
        )

    candles = MarketDataService.fetch_ohlc_history(clean_symbol, clean_tf)
    await cache_service.set_json(cache_key, candles, ttl=3600)
    return OHLCResponse(
        symbol=clean_symbol,
        timeframe=clean_tf,
        candles=[OHLCPoint(**c) for c in candles],
        cached=False
    )


@router.get("/batch-quotes", response_model=List[QuoteResponse])
async def get_batch_market_quotes(
    symbols: str = Query("AAPL,TSLA,NVDA,RELIANCE.NS", description="Comma-separated ticker symbols")
):
    """
    Returns market quotes for multiple tickers in a single batch call.
    """
    symbol_list = [s.strip().upper() for s in symbols.split(",") if s.strip()]
    results = []

    for sym in symbol_list:
        cache_key = f"market:quote:{sym}"
        cached_q = await cache_service.get_json(cache_key)
        if cached_q:
            cached_q["cached"] = True
            results.append(QuoteResponse(**cached_q))
        else:
            live_q = MarketDataService.fetch_live_quote(sym)
            await cache_service.set_json(cache_key, live_q, ttl=settings.CACHE_TTL_SECONDS)
            live_q["cached"] = False
            results.append(QuoteResponse(**live_q))

    return results
