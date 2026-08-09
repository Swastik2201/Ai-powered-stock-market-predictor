from fastapi import APIRouter, Query
from pydantic import BaseModel
from typing import List, Optional
from app.services.screeners import ScreenerService

router = APIRouter()


class IPOResponse(BaseModel):
    id: str
    company_name: str
    symbol: str
    issue_start_date: str
    issue_end_date: str
    listing_date: Optional[str] = None
    price_band_min: float
    price_band_max: float
    issue_size_cr: float
    lot_size: int
    status: str
    gmp_amount: float
    gmp_percent: float
    qib_subscription: float
    nii_subscription: float
    retail_subscription: float
    total_subscription: float
    demand_score: float
    demand_classification: str
    demand_color_tag: str


class IntradayBreakoutResponse(BaseModel):
    symbol: str
    name: str
    signal_type: str
    timeframe: str = "5m"
    price_at_signal: float
    volume_ratio: float
    change_pct: float
    created_at: str


@router.get("/ipos", response_model=List[IPOResponse])
async def get_ipos(
    status: Optional[str] = Query("ongoing", description="Filter by status: upcoming, ongoing, listed")
):
    """
    Returns IPO list with Grey Market Premium (GMP), Subscription progress, and calculated Demand Scores.
    """
    mock_ipos = [
        {
            "id": "ipo-1",
            "company_name": "Swiggy Limited IPO",
            "symbol": "SWIGGY",
            "issue_start_date": "2026-08-08",
            "issue_end_date": "2026-08-12",
            "listing_date": "2026-08-18",
            "price_band_min": 371.0,
            "price_band_max": 390.0,
            "issue_size_cr": 11370.0,
            "lot_size": 38,
            "status": "ongoing",
            "gmp_amount": 125.0,
            "gmp_percent": 32.05,
            "qib_subscription": 14.5,
            "nii_subscription": 8.2,
            "retail_subscription": 4.1,
            "total_subscription": 9.8,
        },
        {
            "id": "ipo-2",
            "company_name": "Hyundai Motor India",
            "symbol": "HYUNDAI",
            "issue_start_date": "2026-08-10",
            "issue_end_date": "2026-08-14",
            "listing_date": "2026-08-20",
            "price_band_min": 1860.0,
            "price_band_max": 1960.0,
            "issue_size_cr": 27870.0,
            "lot_size": 7,
            "status": "ongoing",
            "gmp_amount": 310.0,
            "gmp_percent": 15.81,
            "qib_subscription": 6.8,
            "nii_subscription": 4.5,
            "retail_subscription": 2.2,
            "total_subscription": 4.5,
        },
        {
            "id": "ipo-3",
            "company_name": "NTPC Green Energy Ltd",
            "symbol": "NTPCGREEN",
            "issue_start_date": "2026-08-22",
            "issue_end_date": "2026-08-26",
            "listing_date": "2026-09-02",
            "price_band_min": 102.0,
            "price_band_max": 108.0,
            "issue_size_cr": 10000.0,
            "lot_size": 138,
            "status": "upcoming",
            "gmp_amount": 28.0,
            "gmp_percent": 25.92,
            "qib_subscription": 0.0,
            "nii_subscription": 0.0,
            "retail_subscription": 0.0,
            "total_subscription": 0.0,
        },
        {
            "id": "ipo-4",
            "company_name": "Ola Electric Mobility",
            "symbol": "OLAELEC",
            "issue_start_date": "2026-07-25",
            "issue_end_date": "2026-07-29",
            "listing_date": "2026-08-02",
            "price_band_min": 72.0,
            "price_band_max": 76.0,
            "issue_size_cr": 6145.0,
            "lot_size": 197,
            "status": "listed",
            "gmp_amount": 18.0,
            "gmp_percent": 23.68,
            "qib_subscription": 19.2,
            "nii_subscription": 5.4,
            "retail_subscription": 4.0,
            "total_subscription": 9.5,
        },
    ]

    filtered = [ipo for ipo in mock_ipos if not status or ipo["status"].lower() == status.lower()]
    results = []

    for item in filtered:
        calc = ScreenerService.calculate_ipo_demand_score(item["total_subscription"], item["gmp_percent"])
        results.append(
            IPOResponse(
                **item,
                demand_score=calc["demand_score"],
                demand_classification=calc["classification"],
                demand_color_tag=calc["color_tag"],
            )
        )

    return results


@router.get("/intraday/breakouts", response_model=List[IntradayBreakoutResponse])
async def get_intraday_breakouts():
    """
    Returns real-time 5-minute volume spikes and price momentum alerts.
    """
    return [
        IntradayBreakoutResponse(
            symbol="RELIANCE",
            name="Reliance Industries Ltd",
            signal_type="VOLUME_SPIKE",
            timeframe="5m",
            price_at_signal=2985.50,
            volume_ratio=4.20,
            change_pct=1.85,
            created_at="2026-08-09T17:45:00Z",
        ),
        IntradayBreakoutResponse(
            symbol="TCS",
            name="Tata Consultancy Services",
            signal_type="PRICE_BREAKOUT",
            timeframe="5m",
            price_at_signal=4215.00,
            volume_ratio=2.80,
            change_pct=2.10,
            created_at="2026-08-09T17:44:00Z",
        ),
        IntradayBreakoutResponse(
            symbol="QUANT_SMALL",
            name="Quant Small Cap Fund",
            signal_type="52W_HIGH_CROSS",
            timeframe="5m",
            price_at_signal=262.10,
            volume_ratio=3.50,
            change_pct=2.45,
            created_at="2026-08-09T17:42:00Z",
        ),
        IntradayBreakoutResponse(
            symbol="INFY",
            name="Infosys Limited",
            signal_type="VOLUME_SPIKE",
            timeframe="5m",
            price_at_signal=1825.00,
            volume_ratio=3.10,
            change_pct=-1.60,
            created_at="2026-08-09T17:40:00Z",
        ),
    ]
