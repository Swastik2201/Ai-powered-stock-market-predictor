from typing import Dict, Any


class RiskRadarService:
    """
    Quantitative Financial Risk Radar Engine.
    Normalizes 5 distinct metrics (Valuation, Growth, Financial Health, Momentum, Volatility) onto 0-100 scale.
    """

    ASSET_METRIC_DATABASE: Dict[str, Dict[str, Any]] = {
        "RELIANCE": {
            "pe": 24.2, "ind_pe": 28.5,
            "cagr": 18.5, "cagr_benchmark": 12.0,
            "de_ratio": 0.35, "de_benchmark": 1.0,
            "rsi": 58.4, "rsi_benchmark": 60.0,
            "beta": 0.88, "beta_benchmark": 1.0,
        },
        "TCS": {
            "pe": 29.8, "ind_pe": 32.0,
            "cagr": 14.2, "cagr_benchmark": 10.0,
            "de_ratio": 0.08, "de_benchmark": 1.0,
            "rsi": 62.1, "rsi_benchmark": 60.0,
            "beta": 0.72, "beta_benchmark": 1.0,
        },
        "INFY": {
            "pe": 26.5, "ind_pe": 32.0,
            "cagr": 12.8, "cagr_benchmark": 10.0,
            "de_ratio": 0.12, "de_benchmark": 1.0,
            "rsi": 48.2, "rsi_benchmark": 60.0,
            "beta": 0.85, "beta_benchmark": 1.0,
        },
        "QUANT_SMALL": {
            "pe": 19.5, "ind_pe": 24.0,
            "cagr": 26.5, "cagr_benchmark": 15.0,
            "de_ratio": 0.20, "de_benchmark": 1.0,
            "rsi": 68.4, "rsi_benchmark": 60.0,
            "beta": 1.35, "beta_benchmark": 1.0,
        },
        "PARAG_FLEXI": {
            "pe": 22.0, "ind_pe": 26.0,
            "cagr": 21.2, "cagr_benchmark": 14.0,
            "de_ratio": 0.15, "de_benchmark": 1.0,
            "rsi": 55.0, "rsi_benchmark": 60.0,
            "beta": 0.80, "beta_benchmark": 1.0,
        },
    }

    @staticmethod
    def calculate_risk_radar(symbol: str) -> Dict[str, Any]:
        symbol_clean = symbol.upper()
        raw = RiskRadarService.ASSET_METRIC_DATABASE.get(symbol_clean, {
            "pe": 25.0, "ind_pe": 28.0,
            "cagr": 15.0, "cagr_benchmark": 12.0,
            "de_ratio": 0.30, "de_benchmark": 1.0,
            "rsi": 55.0, "rsi_benchmark": 60.0,
            "beta": 0.95, "beta_benchmark": 1.0,
        })

        # 1. Valuation Score
        val_score = round(min(100.0, max(0.0, 100.0 - ((raw["pe"] / raw["ind_pe"]) * 50.0))), 1)

        # 2. Growth Score
        growth_score = round(min(100.0, max(0.0, raw["cagr"] * 4.0)), 1)

        # 3. Financial Health Score
        health_score = round(min(100.0, max(0.0, 100.0 - (raw["de_ratio"] * 40.0))), 1)

        # 4. Momentum Score
        mom_score = round(min(100.0, max(0.0, 100.0 - abs(raw["rsi"] - 60.0) * 2.5)), 1)

        # 5. Volatility / Stability Score
        vol_score = round(min(100.0, max(0.0, 100.0 - (abs(raw["beta"] - 1.0) * 50.0))), 1)

        # Overall composite average score
        overall = round((val_score + growth_score + health_score + mom_score + vol_score) / 5.0, 1)

        if overall >= 80.0:
            classification = "Low Risk"
        elif overall >= 65.0:
            classification = "Low-to-Moderate Risk"
        elif overall >= 50.0:
            classification = "Moderate Risk"
        else:
            classification = "High Volatility Risk"

        return {
            "symbol": symbol_clean,
            "overall_score": overall,
            "risk_classification": classification,
            "metrics": {
                "valuation": {
                    "score": val_score,
                    "raw_value": f"{raw['pe']} P/E",
                    "benchmark": f"{raw['ind_pe']} Ind P/E",
                },
                "growth": {
                    "score": growth_score,
                    "raw_value": f"{raw['cagr']}% CAGR",
                    "benchmark": f"{raw['cagr_benchmark']}% Avg",
                },
                "financial_health": {
                    "score": health_score,
                    "raw_value": f"{raw['de_ratio']} D/E",
                    "benchmark": "< 1.0 Safe",
                },
                "momentum": {
                    "score": mom_score,
                    "raw_value": f"{raw['rsi']} RSI",
                    "benchmark": "Neutral (60)",
                },
                "volatility": {
                    "score": vol_score,
                    "raw_value": f"{raw['beta']} Beta",
                    "benchmark": "Low Volatility",
                },
            },
        }
