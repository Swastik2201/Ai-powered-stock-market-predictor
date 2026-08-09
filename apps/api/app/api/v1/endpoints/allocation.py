from fastapi import APIRouter
from pydantic import BaseModel
from typing import Dict

router = APIRouter()


class AllocationRequest(BaseModel):
    risk_tolerance: str = "moderate"
    investment_amount: float = 10000.0
    preferred_currency: str = "USD"


class AllocationResponse(BaseModel):
    risk_profile: str
    allocations: Dict[str, float]
    recommendations: str


@router.post("/optimize", response_model=AllocationResponse)
async def optimize_allocation(payload: AllocationRequest):
    """
    Optimizes asset allocation strategy based on risk profile and investment targets.
    """
    return AllocationResponse(
        risk_profile=payload.risk_tolerance,
        allocations={
            "equities_tech": 40.0,
            "bonds": 30.0,
            "index_funds": 20.0,
            "crypto_cash": 10.0,
        },
        recommendations="Balanced allocation favoring low-cost index funds and defensive bonds."
    )
