import random
import datetime
import logging
from typing import List, Dict, Any

logger = logging.getLogger("market_data")


class MarketDataService:
    """
    Market Data Aggregation Service connecting Python background workers to
    fetching scripts (yfinance & stock market data streams) and aggregating
    historical price quotes into standard OHLC arrays.
    """

    SUPPORTED_SYMBOLS = {
        "AAPL": {"name": "Apple Inc.", "currency": "USD", "base_price": 224.50},
        "TSLA": {"name": "Tesla Motors Inc.", "currency": "USD", "base_price": 210.20},
        "NVDA": {"name": "NVIDIA Corporation", "currency": "USD", "base_price": 128.80},
        "MSFT": {"name": "Microsoft Corp.", "currency": "USD", "base_price": 445.00},
        "SPY": {"name": "SPDR S&P 500 ETF", "currency": "USD", "base_price": 542.10},
        "RELIANCE.NS": {"name": "Reliance Industries Ltd.", "currency": "INR", "base_price": 2980.00},
        "TCS.NS": {"name": "Tata Consultancy Services", "currency": "INR", "base_price": 4210.00},
        "INFY.NS": {"name": "Infosys Limited", "currency": "INR", "base_price": 1820.00},
    }

    @classmethod
    def fetch_live_quote(cls, symbol: str) -> Dict[str, Any]:
        """
        Fetches current market quote via yfinance with fallback mock generator.
        """
        symbol_clean = symbol.upper().strip()
        quote_data = None

        # 1. Attempt yfinance live fetch
        try:
            import yfinance as yf
            ticker = yf.Ticker(symbol_clean)
            fast_info = getattr(ticker, "fast_info", None)
            if fast_info and hasattr(fast_info, "last_price") and fast_info.last_price is not None:
                last_price = float(fast_info.last_price)
                prev_close = float(getattr(fast_info, "previous_close", last_price))
                day_change = last_price - prev_close
                day_change_pct = (day_change / prev_close * 100) if prev_close else 0.0

                quote_data = {
                    "symbol": symbol_clean,
                    "name": cls.SUPPORTED_SYMBOLS.get(symbol_clean, {}).get("name", symbol_clean),
                    "price": round(last_price, 2),
                    "day_change": round(day_change, 2),
                    "day_change_pct": round(day_change_pct, 2),
                    "day_high": round(float(getattr(fast_info, "day_high", last_price * 1.01)), 2),
                    "day_low": round(float(getattr(fast_info, "day_low", last_price * 0.99)), 2),
                    "volume": int(getattr(fast_info, "last_volume", 1500000)),
                    "currency": cls.SUPPORTED_SYMBOLS.get(symbol_clean, {}).get("currency", "USD"),
                    "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
                }
        except Exception as e:
            logger.debug(f"yfinance fetch failed for {symbol_clean} ({e}). Generating fallback quote.")

        # 2. Resilient Fallback Quote Generator
        if not quote_data:
            base_info = cls.SUPPORTED_SYMBOLS.get(symbol_clean, {"name": symbol_clean, "currency": "USD", "base_price": 150.00})
            base = base_info["base_price"]
            flump = random.uniform(-0.015, 0.02)
            current_price = round(base * (1 + flump), 2)
            prev_close = base
            day_change = round(current_price - prev_close, 2)
            day_change_pct = round((day_change / prev_close) * 100, 2)

            quote_data = {
                "symbol": symbol_clean,
                "name": base_info["name"],
                "price": current_price,
                "day_change": day_change,
                "day_change_pct": day_change_pct,
                "day_high": round(current_price * 1.012, 2),
                "day_low": round(current_price * 0.988, 2),
                "volume": random.randint(500000, 5000000),
                "currency": base_info["currency"],
                "updated_at": datetime.datetime.utcnow().isoformat() + "Z",
            }

        return quote_data

    @classmethod
    def fetch_ohlc_history(cls, symbol: str, timeframe: str = "1M") -> List[Dict[str, Any]]:
        """
        Transforms historical price data into standard Open-High-Low-Close (OHLC) arrays
        for rendering time-series chart components across timeframes (1D, 1W, 1M, 1Y, ALL).
        """
        symbol_clean = symbol.upper().strip()
        timeframe_upper = timeframe.upper()

        # Determine points count & delta days
        points_map = {
            "1D": (24, 1),
            "1W": (7, 7),
            "1M": (30, 30),
            "1Y": (12, 365),
            "ALL": (60, 730),
        }
        points, total_days = points_map.get(timeframe_upper, (30, 30))

        # Attempt yfinance historical dataframe fetch
        try:
            import yfinance as yf
            period_map = {"1D": "1d", "1W": "5d", "1M": "1mo", "1Y": "1y", "ALL": "max"}
            interval_map = {"1D": "15m", "1W": "1h", "1M": "1d", "1Y": "1wk", "ALL": "1mo"}
            
            df = yf.download(
                tickers=symbol_clean,
                period=period_map.get(timeframe_upper, "1mo"),
                interval=interval_map.get(timeframe_upper, "1d"),
                progress=False
            )

            if df is not None and not df.empty:
                candles = []
                for index, row in df.iterrows():
                    # Handle single vs multi-index dataframe columns
                    open_p = float(row["Open"].iloc[0] if hasattr(row["Open"], "iloc") else row["Open"])
                    high_p = float(row["High"].iloc[0] if hasattr(row["High"], "iloc") else row["High"])
                    low_p = float(row["Low"].iloc[0] if hasattr(row["Low"], "iloc") else row["Low"])
                    close_p = float(row["Close"].iloc[0] if hasattr(row["Close"], "iloc") else row["Close"])
                    vol = int(row["Volume"].iloc[0] if hasattr(row["Volume"], "iloc") else row["Volume"])

                    candles.append({
                        "timestamp": index.strftime("%Y-%m-%dT%H:%M:%SZ"),
                        "open": round(open_p, 2),
                        "high": round(high_p, 2),
                        "low": round(low_p, 2),
                        "close": round(close_p, 2),
                        "volume": vol,
                    })
                if candles:
                    return candles
        except Exception as e:
            logger.debug(f"yfinance OHLC download fallback for {symbol_clean} ({e}).")

        # Fallback OHLC Generator
        base_price = cls.SUPPORTED_SYMBOLS.get(symbol_clean, {}).get("base_price", 150.00)
        now = datetime.datetime.utcnow()
        delta = datetime.timedelta(days=total_days / points)

        candles = []
        current_p = base_price * 0.9

        for i in range(points):
            t = now - delta * (points - i)
            op = current_p + random.uniform(-2.0, 2.0)
            cl = op + random.uniform(-3.0, 3.5)
            hi = max(op, cl) + random.uniform(0.5, 2.5)
            lo = min(op, cl) - random.uniform(0.5, 2.0)
            vol = random.randint(100000, 2000000)

            candles.append({
                "timestamp": t.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "open": round(op, 2),
                "high": round(hi, 2),
                "low": round(lo, 2),
                "close": round(cl, 2),
                "volume": vol,
            })
            current_p = cl

        return candles
