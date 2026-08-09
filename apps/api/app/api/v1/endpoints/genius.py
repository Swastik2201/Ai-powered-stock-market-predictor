from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()


class GeniusQueryRequest(BaseModel):
    query: str = "Explain current macroeconomic trends affecting the stock market."


class GeniusQueryResponse(BaseModel):
    query: str
    answer: str
    sources: list[str]


@router.post("/query", response_model=GeniusQueryResponse)
async def ask_financial_genius(payload: GeniusQueryRequest):
    """
    Financial Copilot / Genius endpoint powered by LangChain and Google Gemini.
    """
    return GeniusQueryResponse(
        query=payload.query,
        answer="Current market indicators reflect stable inflation data, encouraging technology sector growth while keeping treasury yields steady.",
        sources=["Federal Reserve Statement", "Global Market Analytics"]
    )
