from pydantic import BaseModel, Field
from typing import List, Literal, Dict, Any


class AllocationRequest(BaseModel):
    monthly_budget: float = Field(..., gt=0, example=1000.0)
    risk_appetite: Literal["conservative", "moderate", "aggressive"] = Field(..., example="moderate")


class AllocatedAssetItem(BaseModel):
    category: str
    symbol: str
    asset_name: str
    weight_pct: float
    target_amount: float
    unit_price: float
    units_to_buy: float
    actual_amount: float


class AllocationResponse(BaseModel):
    monthly_budget: float
    risk_appetite: str
    allocations: List[AllocatedAssetItem]
    total_allocated: float
    unallocated_cash: float
    summary_notes: str


# Asset Master Dictionary with default/fallback market prices
ASSET_PRICE_REGISTRY: Dict[str, Dict[str, Any]] = {
    "NIFTYBEES": {"symbol": "NIFTYBEES", "name": "Nippon India ETF Nifty BeES", "price": 265.40},
    "GOLDBEES": {"symbol": "GOLDBEES", "name": "Nippon India ETF Gold BeES", "price": 64.20},
    "PARAG_FLEXI": {"symbol": "PPFCF", "name": "Parag Parikh Flexi Cap Fund", "price": 72.40},
    "NIFTYMID150": {"symbol": "MID150BEES", "name": "Nippon India ETF Nifty Midcap 150", "price": 188.50},
    "QUANT_SMALL": {"symbol": "QSMALL", "name": "Quant Small Cap Direct Fund", "price": 260.15},
    "HDFC_MID": {"symbol": "HDFCMID", "name": "HDFC Mid-Cap Opportunities Fund", "price": 145.80},
    "RELIANCE": {"symbol": "RELIANCE", "name": "Reliance Industries Ltd", "price": 2980.00},
}


# Risk Weighting Matrix Mapping
RISK_WEIGHT_MATRIX: Dict[str, List[Dict[str, Any]]] = {
    "conservative": [
        {"category": "Benchmark Index ETF", "key": "NIFTYBEES", "weight": 0.60},
        {"category": "Digital Gold / Debt", "key": "GOLDBEES", "weight": 0.30},
        {"category": "Flexi-Cap Equity", "key": "PARAG_FLEXI", "weight": 0.10},
    ],
    "moderate": [
        {"category": "Benchmark Index ETF", "key": "NIFTYBEES", "weight": 0.40},
        {"category": "Flexi-Cap Equity", "key": "PARAG_FLEXI", "weight": 0.30},
        {"category": "Mid-Cap ETF", "key": "NIFTYMID150", "weight": 0.20},
        {"category": "Digital Gold", "key": "GOLDBEES", "weight": 0.10},
    ],
    "aggressive": [
        {"category": "Small-Cap Equity", "key": "QUANT_SMALL", "weight": 0.40},
        {"category": "Mid-Cap Equity", "key": "HDFC_MID", "weight": 0.30},
        {"category": "Flexi-Cap Equity", "key": "PARAG_FLEXI", "weight": 0.20},
        {"category": "Growth Equity Stock", "key": "RELIANCE", "weight": 0.10},
    ],
}


class BudgetAllocatorService:
    """
    AI Budget-Driven Asset Allocation and Fractional Unit Calculation Engine.
    """

    @staticmethod
    def generate_budget_allocation(request: AllocationRequest) -> AllocationResponse:
        budget = request.monthly_budget
        risk = request.risk_appetite.lower()

        rules = RISK_WEIGHT_MATRIX.get(risk, RISK_WEIGHT_MATRIX["moderate"])

        allocations: List[AllocatedAssetItem] = []
        total_spent = 0.0

        for rule in rules:
            weight_pct = rule["weight"] * 100.0
            target_amount = round(budget * rule["weight"], 2)

            asset_info = ASSET_PRICE_REGISTRY.get(rule["key"], {
                "symbol": rule["key"],
                "name": rule["category"],
                "price": 100.0,
            })

            unit_price = asset_info["price"]

            # Calculate fractional units to 4 decimal places
            units_to_buy = round(target_amount / unit_price, 4)
            actual_amount = round(units_to_buy * unit_price, 2)

            total_spent += actual_amount

            allocations.append(
                AllocatedAssetItem(
                    category=rule["category"],
                    symbol=asset_info["symbol"],
                    asset_name=asset_info["name"],
                    weight_pct=weight_pct,
                    target_amount=target_amount,
                    unit_price=unit_price,
                    units_to_buy=units_to_buy,
                    actual_amount=actual_amount,
                )
            )

        total_spent = round(total_spent, 2)
        unallocated_cash = round(max(0.0, budget - total_spent), 2)

        summary_notes = (
            f"Successfully allocated ₹{total_spent:,.2f} across {len(allocations)} buckets "
            f"for a {risk.capitalize()} risk profile. Fractional precision: 4 decimal places."
        )

        return AllocationResponse(
            monthly_budget=budget,
            risk_appetite=risk,
            allocations=allocations,
            total_allocated=total_spent,
            unallocated_cash=unallocated_cash,
            summary_notes=summary_notes,
        )
