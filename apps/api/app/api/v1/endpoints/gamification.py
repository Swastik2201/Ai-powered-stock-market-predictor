from fastapi import APIRouter, HTTPException, status
from app.services.badge_evaluator import (
    BadgeEvaluatorService,
    QuizQuestionResponse,
    SubmitQuizRequest,
    UserBadgesResponse,
)

router = APIRouter()


@router.get("/quiz/daily/{user_id}", response_model=QuizQuestionResponse, status_code=status.HTTP_200_OK)
async def get_daily_financial_quiz(user_id: str):
    """
    Returns today's daily financial literacy mini-quiz question and user attempt status.
    """
    try:
        quiz = BadgeEvaluatorService.get_daily_quiz(user_id)
        return quiz
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch daily quiz: {str(e)}",
        )


@router.post("/quiz/submit", status_code=status.HTTP_200_OK)
async def submit_daily_financial_quiz(payload: SubmitQuizRequest):
    """
    Submits user answer for today's daily quiz. Credits +₹50 paper cash if correct.
    """
    try:
        res = BadgeEvaluatorService.submit_quiz(payload)
        return res
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Quiz submission failed: {str(e)}",
        )


@router.get("/badges/{user_id}", response_model=UserBadgesResponse, status_code=status.HTTP_200_OK)
async def get_user_unlocked_badges(user_id: str):
    """
    Retrieves user unlocked vs locked achievement badges.
    """
    try:
        badges = BadgeEvaluatorService.get_user_badges(user_id)
        return badges
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch badges for user {user_id}: {str(e)}",
        )
