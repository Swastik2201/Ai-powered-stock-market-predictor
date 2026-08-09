from fastapi import APIRouter, HTTPException, status
from app.services.allocator import (
    BudgetAllocatorService,
    AllocationRequest,
    AllocationResponse,
)

router = APIRouter()


@router.post("/recommend", response_model=AllocationResponse, status_code=status.HTTP_200_OK)
async def recommend_budget_allocation(payload: AllocationRequest):
    """
    Generates AI Budget Asset Allocation recommendations and computes fractional purchasing units.
    """
    try:
        response = BudgetAllocatorService.generate_budget_allocation(payload)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate allocation recommendation: {str(e)}",
        )
