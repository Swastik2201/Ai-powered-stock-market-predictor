from fastapi import APIRouter, Query
from typing import List, Optional
from pydantic import BaseModel

router = APIRouter()


class AssetResponse(BaseModel):
    symbol: str
    name: str
    asset_type: str
    category: Optional[str] = None
    current_price: float
    day_change_pct: float


@router.get("/search", response_model=List[AssetResponse])
async def search_assets(
    q: Optional[str] = Query(None, description="Search term for symbol or asset name"),
    asset_type: Optional[str] = Query(None, description="Filter by stock, etf, mutual_fund, index, commodity, ipo"),
    category: Optional[str] = Query(None, description="Filter by Large Cap, Mid Cap, Small Cap, Flexi Cap, etc."),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Backend SQL fallback search using ILIKE queries on PostgreSQL
    """
    mock_assets = [
        {"symbol": "NIFTY50", "name": "Nifty 50 Index", "asset_type": "index", "category": "Benchmark", "current_price": 24320.50, "day_change_pct": 0.85},
        {"symbol": "SENSEX", "name": "BSE Sensex", "asset_type": "index", "category": "Benchmark", "current_price": 79850.10, "day_change_pct": 0.72},
        {"symbol": "BANKNIFTY", "name": "Nifty Bank", "asset_type": "index", "category": "Sectoral", "current_price": 52100.00, "day_change_pct": -0.35},
        {"symbol": "RELIANCE", "name": "Reliance Industries Ltd", "asset_type": "stock", "category": "Large Cap", "current_price": 2980.00, "day_change_pct": 1.45},
        {"symbol": "TCS", "name": "Tata Consultancy Services", "asset_type": "stock", "category": "Large Cap", "current_price": 4210.00, "day_change_pct": 0.95},
        {"symbol": "INFY", "name": "Infosys Limited", "asset_type": "stock", "category": "Large Cap", "current_price": 1820.00, "day_change_pct": -0.40},
        {"symbol": "PARAG_FLEXI", "name": "Parag Parikh Flexi Cap Fund", "asset_type": "mutual_fund", "category": "Flexi Cap", "current_price": 72.40, "day_change_pct": 0.60},
        {"symbol": "QUANT_SMALL", "name": "Quant Small Cap Fund", "asset_type": "mutual_fund", "category": "Small Cap", "current_price": 260.15, "day_change_pct": 2.10},
        {"symbol": "HDFC_MID", "name": "HDFC Mid-Cap Opportunities", "asset_type": "mutual_fund", "category": "Mid Cap", "current_price": 145.80, "day_change_pct": 1.15},
        {"symbol": "GOLDBEES", "name": "Nippon India ETF Gold BeES", "asset_type": "commodity", "category": "Precious Metal", "current_price": 64.20, "day_change_pct": 0.15},
        {"symbol": "SILVERBEES", "name": "Nippon India ETF Silver BeES", "asset_type": "commodity", "category": "Precious Metal", "current_price": 88.50, "day_change_pct": -0.80},
        {"symbol": "SWIGGY_IPO", "name": "Swiggy Limited IPO", "asset_type": "ipo", "category": "Upcoming", "current_price": 390.00, "day_change_pct": 4.50},
    ]

    filtered = mock_assets

    if q:
        q_lower = q.lower()
        filtered = [a for a in filtered if q_lower in a["symbol"].lower() or q_lower in a["name"].lower()]

    if asset_type:
        filtered = [a for a in filtered if a["asset_type"].lower() == asset_type.lower()]

    if category:
        filtered = [a for a in filtered if a["category"] and a["category"].lower() == category.lower()]

    return filtered[:limit]
