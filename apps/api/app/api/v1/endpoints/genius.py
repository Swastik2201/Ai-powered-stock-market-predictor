from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from typing import List, Optional, Dict
from app.services.market_genius import MarketGeniusEngine

router = APIRouter()


class ChatMessage(BaseModel):
    role: str # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: Optional[List[ChatMessage]] = None


class ChatResponse(BaseModel):
    answer: str
    sources: List[Dict[str, str]]


@router.post("/chat", response_model=ChatResponse, status_code=status.HTTP_200_OK)
async def chat_with_genius(payload: ChatRequest):
    """
    RAG-powered conversational endpoint querying pgvector store and synthesizing answers via Gemini LLM.
    """
    try:
        history_list = [h.dict() for h in payload.history] if payload.history else []
        res = MarketGeniusEngine.generate_rag_response(payload.message, history=history_list)
        return ChatResponse(answer=res["answer"], sources=res["sources"])
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"MarketGenius processing failed: {str(e)}",
        )
