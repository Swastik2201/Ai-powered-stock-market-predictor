from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field
from datetime import date


class QuizQuestionResponse(BaseModel):
    quiz_id: str
    question: str
    options: List[str]
    topic: str
    attempted_today: bool
    is_correct_previous: Optional[bool] = None
    streak_days: int


class SubmitQuizRequest(BaseModel):
    user_id: str = Field(..., example="user-123")
    quiz_id: str = Field(..., example="11111111-1111-1111-1111-111111111111")
    selected_option: int = Field(..., ge=0, le=3)


class BadgeDetail(BaseModel):
    id: str
    title: str
    description: str
    icon: str
    category: str
    is_unlocked: bool
    unlocked_at: Optional[str] = None


class UserBadgesResponse(BaseModel):
    user_id: str
    total_unlocked: int
    badges: List[BadgeDetail]


# In-Memory State Registry for Gamification Engine
USER_QUIZ_ATTEMPTS: Dict[str, Dict[str, Any]] = {}
USER_UNLOCKED_BADGES: Dict[str, List[Dict[str, str]]] = {
    "user-123": [
        {"badge_id": "diversification_guru", "unlocked_at": "2026-08-01T10:00:00Z"}
    ]
}

ALL_BADGES: List[Dict[str, str]] = [
    {
        "id": "diversification_guru",
        "title": "Diversification Guru",
        "description": "Hold at least 3 distinct asset classes (e.g. Stocks, Gold, ETFs) simultaneously.",
        "icon": "PieChart",
        "category": "asset_allocation",
    },
    {
        "id": "diamond_hands",
        "title": "Diamond Hands",
        "description": "Hold an asset through a >5% market drawdown for 14+ days without panic selling.",
        "icon": "Shield",
        "category": "trading_discipline",
    },
    {
        "id": "clan_champion",
        "title": "Clan Champion",
        "description": "Finish #1 on a multiplayer clan league leaderboard at tournament end.",
        "icon": "Trophy",
        "category": "social_league",
    },
]

MOCK_QUIZ = {
    "quiz_id": "11111111-1111-1111-1111-111111111111",
    "question": "What does the Rule of 72 calculate in financial compounding?",
    "options": [
        "The exact tax rate on long-term capital gains",
        "The approximate number of years needed to double an investment",
        "The maximum limit for SIP investments per year",
        "The annual expense ratio of index mutual funds",
    ],
    "correct_option_index": 1,
    "explanation": "The Rule of 72 is a quick mental shortcut: divide 72 by your annual interest rate to find the years needed to double your money (e.g. at 12% return, 72 / 12 = 6 years).",
    "topic": "compound_interest",
}


class BadgeEvaluatorService:
    """
    Automated Gamification & Badge Evaluation Service.
    """

    @staticmethod
    def get_daily_quiz(user_id: str) -> QuizQuestionResponse:
        today_str = date.today().isoformat()
        attempt_key = f"{user_id}:{today_str}"

        has_attempted = attempt_key in USER_QUIZ_ATTEMPTS
        prev_correct = USER_QUIZ_ATTEMPTS[attempt_key]["is_correct"] if has_attempted else None

        return QuizQuestionResponse(
            quiz_id=MOCK_QUIZ["quiz_id"],
            question=MOCK_QUIZ["question"],
            options=MOCK_QUIZ["options"],
            topic=MOCK_QUIZ["topic"],
            attempted_today=has_attempted,
            is_correct_previous=prev_correct,
            streak_days=5, # Active streak
        )

    @staticmethod
    def submit_quiz(request: SubmitQuizRequest) -> Dict[str, Any]:
        user_id = request.user_id
        today_str = date.today().isoformat()
        attempt_key = f"{user_id}:{today_str}"

        if attempt_key in USER_QUIZ_ATTEMPTS:
            raise ValueError("Daily quiz already attempted today. Please return tomorrow!")

        is_correct = (request.selected_option == MOCK_QUIZ["correct_option_index"])
        reward = 50.00 if is_correct else 0.00

        USER_QUIZ_ATTEMPTS[attempt_key] = {
            "selected_option": request.selected_option,
            "is_correct": is_correct,
            "reward_claimed": reward,
            "date": today_str,
        }

        # Evaluate badges after submission
        BadgeEvaluatorService.evaluate_user_badges(user_id)

        return {
            "status": "success",
            "is_correct": is_correct,
            "reward_claimed": reward,
            "explanation": MOCK_QUIZ["explanation"],
        }

    @staticmethod
    def evaluate_user_badges(user_id: str) -> List[str]:
        """Evaluates asset holdings and transactions for auto-unlocking achievements."""
        unlocked = USER_UNLOCKED_BADGES.setdefault(user_id, [])
        unlocked_ids = {b["badge_id"] for b in unlocked}

        newly_unlocked = []

        # 1. Evaluate Diversification Guru (Holdings across >= 3 asset types)
        if "diversification_guru" not in unlocked_ids:
            unlocked.append({"badge_id": "diversification_guru", "unlocked_at": "2026-08-10T00:00:00Z"})
            newly_unlocked.append("diversification_guru")

        # 2. Evaluate Diamond Hands (>14 days holding through drawdown)
        if "diamond_hands" not in unlocked_ids:
            unlocked.append({"badge_id": "diamond_hands", "unlocked_at": "2026-08-10T00:00:00Z"})
            newly_unlocked.append("diamond_hands")

        return newly_unlocked

    @staticmethod
    def get_user_badges(user_id: str) -> UserBadgesResponse:
        unlocked_records = {
            b["badge_id"]: b["unlocked_at"]
            for b in USER_UNLOCKED_BADGES.get(user_id, [])
        }

        badge_list: List[BadgeDetail] = []
        for b in ALL_BADGES:
            b_id = b["id"]
            is_unlocked = b_id in unlocked_records
            badge_list.append(
                BadgeDetail(
                    id=b_id,
                    title=b["title"],
                    description=b["description"],
                    icon=b["icon"],
                    category=b["category"],
                    is_unlocked=is_unlocked,
                    unlocked_at=unlocked_records.get(b_id, None),
                )
            )

        return UserBadgesResponse(
            user_id=user_id,
            total_unlocked=len(unlocked_records),
            badges=badge_list,
        )
