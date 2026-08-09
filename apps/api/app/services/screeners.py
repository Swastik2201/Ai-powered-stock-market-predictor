import pandas as pd
import numpy as np
from typing import Dict, Any, List


class ScreenerService:
    """
    Screener calculation engine for IPO Demand Scoring and 5-minute Intraday
    Momentum & Volume Spike Breakout scanning using Pandas.
    """

    @staticmethod
    def calculate_ipo_demand_score(total_subscription: float, gmp_percent: float) -> Dict[str, Any]:
        """
        Calculates IPO Demand Strength Score (0 - 100) combining Total Subscription Multiplier
        and Grey Market Premium (GMP) percentage.

        Formula: Demand Score = min(100, (Total Sub * 2) + (GMP % * 1.5))
        """
        raw_score = (total_subscription * 2.0) + (gmp_percent * 1.5)
        demand_score = round(min(100.0, max(0.0, raw_score)), 1)

        if demand_score >= 70.0:
            classification = "High Demand"
            color_tag = "profit"
        elif demand_score >= 40.0:
            classification = "Moderate"
            color_tag = "gold"
        else:
            classification = "Weak"
            color_tag = "loss"

        return {
            "demand_score": demand_score,
            "classification": classification,
            "color_tag": color_tag,
        }

    @staticmethod
    def calculate_intraday_signals(raw_candles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Resamples candle data using Pandas to detect 5-minute Intraday Breakouts:
        - Volume Spike: volume > 3 * (20-period Moving Average Volume)
        - Price Breakout: 5-minute price change > +1.5% or < -1.5%
        """
        if not raw_candles or len(raw_candles) < 5:
            return []

        df = pd.DataFrame(raw_candles)
        if "volume" not in df.columns or "close" not in df.columns:
            return []

        df["volume"] = pd.to_numeric(df["volume"], errors="coerce").fillna(0)
        df["close"] = pd.to_numeric(df["close"], errors="coerce").fillna(0)
        df["open"] = pd.to_numeric(df.get("open", df["close"]), errors="coerce").fillna(0)

        # 20-period Moving Average Volume
        df["vol_ma20"] = df["volume"].rolling(window=20, min_periods=1).mean()
        df["volume_ratio"] = np.where(df["vol_ma20"] > 0, df["volume"] / df["vol_ma20"], 1.0)

        # Price percentage change per 5m candle
        df["change_pct"] = np.where(
            df["open"] > 0,
            ((df["close"] - df["open"]) / df["open"]) * 100.0,
            0.0
        )

        signals = []
        latest = df.iloc[-1]

        # 1. Volume Spike Detection (> 3.0x 20-period avg volume)
        if latest["volume_ratio"] >= 3.0:
            signals.append({
                "signal_type": "VOLUME_SPIKE",
                "label": f"⚡ Volume Spike ({latest['volume_ratio']:.1f}x)",
                "volume_ratio": round(float(latest["volume_ratio"]), 2),
                "price_at_signal": round(float(latest["close"]), 2),
                "change_pct": round(float(latest["change_pct"]), 2),
            })

        # 2. Price Breakout Detection (> +1.5% or < -1.5%)
        if abs(latest["change_pct"]) >= 1.5:
            direction = "Breakout" if latest["change_pct"] > 0 else "Breakdown"
            signals.append({
                "signal_type": "PRICE_BREAKOUT",
                "label": f"🚀 Price {direction} ({latest['change_pct']:+.1f}%)",
                "volume_ratio": round(float(latest["volume_ratio"]), 2),
                "price_at_signal": round(float(latest["close"]), 2),
                "change_pct": round(float(latest["change_pct"]), 2),
            })

        return signals
