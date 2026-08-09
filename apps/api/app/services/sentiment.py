from typing import Dict, Any, List


class SentimentAnalysisService:
    """
    Financial News Sentiment Scoring & Risk Index Calculation Service.
    """

    @staticmethod
    def analyze_news_sentiment(symbol: str) -> Dict[str, Any]:
        """
        Computes composite news sentiment score (-1.0 to +1.0) and normalizes it to a 0-100 Risk Index.
        Formula: Risk Index = Clamp(50 + (Sentiment Score * 50), 0, 100)
        """
        # Mock financial headlines dictionary for fallback/offline ingestion
        headlines_db: Dict[str, List[Dict[str, Any]]] = {
            "RELIANCE": [
                {"title": "Reliance Q1 Net Profit rises 12% on strong retail and telecom growth", "score": 0.65},
                {"title": "Jio Financial Services expands AI partnership for digital banking", "score": 0.45},
                {"title": "O2C refining margins remain resilient despite global crude volatility", "score": 0.20},
            ],
            "TCS": [
                {"title": "TCS bags $1.2B cloud transformation deal with European banking major", "score": 0.70},
                {"title": "IT sector faces near-term margin pressure due to wage hikes", "score": -0.25},
                {"title": "TCS announces strategic AI research lab expansion in India", "score": 0.50},
            ],
            "INFY": [
                {"title": "Infosys raises full-year revenue guidance following strong deal wins", "score": 0.60},
                {"title": "Attritions drop to multi-quarter low across major IT services firms", "score": 0.35},
            ],
        }

        headlines = headlines_db.get(symbol.upper(), [
            {"title": f"{symbol} demonstrates stable trading volume across major indices", "score": 0.30},
            {"title": f"Analysts maintain positive outlook on {symbol} quarterly performance", "score": 0.40},
        ])

        try:
            from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
            analyzer = SentimentIntensityAnalyzer()
            scores = [analyzer.polarity_scores(h["title"])["compound"] for h in headlines]
            composite_score = float(sum(scores) / max(1, len(scores)))
        except ImportError:
            # Resilient fallback calculator using pre-scored headlines
            scores = [h["score"] for h in headlines]
            composite_score = float(sum(scores) / max(1, len(scores)))

        # Convert composite score (-1.0 to +1.0) to 0-100 scale Risk Index
        risk_index = round(min(100.0, max(0.0, 50.0 + (composite_score * 50.0))), 1)

        if risk_index >= 66.0:
            label = "Bullish"
            risk_level = "Low Volatility Risk"
        elif risk_index >= 36.0:
            label = "Neutral"
            risk_level = "Moderate Risk"
        else:
            label = "Bearish"
            risk_level = "High Volatility Risk"

        return {
            "symbol": symbol.upper(),
            "sentiment_score": risk_index,
            "composite_raw": round(composite_score, 3),
            "sentiment_label": label,
            "risk_level": risk_level,
            "headline_count": len(headlines),
            "top_headline": headlines[0]["title"] if headlines else "",
        }
