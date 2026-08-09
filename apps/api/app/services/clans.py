import random
import string
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field


class CreateClanRequest(BaseModel):
    creator_id: str = Field(..., example="user-123")
    name: str = Field(..., example="Alpha WallStreet Traders")
    duration_days: int = Field(30, ge=1, le=365)
    initial_capital: float = Field(1000.0, gt=0)


class JoinClanRequest(BaseModel):
    user_id: str = Field(..., example="user-456")
    room_code: str = Field(..., example="TRD99X")


class LeaderboardMember(BaseModel):
    rank: int
    user_id: str
    full_name: str
    avatar_url: Optional[str] = None
    portfolio_value: float
    cash_balance: float
    roi_pct: float
    trophy_badge: Optional[str] = None # 'gold', 'silver', 'bronze', or None


class ClanLeaderboardResponse(BaseModel):
    clan_id: str
    clan_name: str
    room_code: str
    total_members: int
    leaderboard: List[LeaderboardMember]


# In-Memory Registry for Clan Leagues
IN_MEMORY_CLANS: Dict[str, Dict[str, Any]] = {
    "clan-1": {
        "id": "clan-1",
        "name": "Alpha WallStreet Traders",
        "code": "TRD99X",
        "creator_id": "user-123",
        "initial_capital": 1000.0,
        "members": ["user-123", "user-456", "user-789"],
    }
}

IN_MEMORY_CLAN_CODES: Dict[str, str] = {
    "TRD99X": "clan-1"
}


class ClanService:
    """
    Multiplayer Clan League Management & Real-Time ROI Leaderboard Service.
    """

    @staticmethod
    def generate_room_code() -> str:
        """Generates a collision-free 6-character uppercase alphanumeric PIN code."""
        chars = string.ascii_uppercase + string.digits
        while True:
            code = "".join(random.choices(chars, k=6))
            if code not in IN_MEMORY_CLAN_CODES:
                return code

    @staticmethod
    def create_clan(request: CreateClanRequest) -> Dict[str, Any]:
        room_code = ClanService.generate_room_code()
        clan_id = f"clan-{len(IN_MEMORY_CLANS) + 1}"

        clan_data = {
            "id": clan_id,
            "name": request.name,
            "code": room_code,
            "creator_id": request.creator_id,
            "initial_capital": request.initial_capital,
            "members": [request.creator_id],
        }

        IN_MEMORY_CLANS[clan_id] = clan_data
        IN_MEMORY_CLAN_CODES[room_code] = clan_id

        return {
            "status": "success",
            "clan_id": clan_id,
            "clan_name": request.name,
            "room_code": room_code,
            "initial_capital": request.initial_capital,
        }

    @staticmethod
    def join_clan_by_code(request: JoinClanRequest) -> Dict[str, Any]:
        code = request.room_code.upper().strip()
        if code not in IN_MEMORY_CLAN_CODES:
            raise ValueError(f"Invalid league invite code: '{code}'")

        clan_id = IN_MEMORY_CLAN_CODES[code]
        clan = IN_MEMORY_CLANS[clan_id]

        if request.user_id not in clan["members"]:
            clan["members"].append(request.user_id)

        return {
            "status": "success",
            "clan_id": clan_id,
            "clan_name": clan["name"],
            "room_code": code,
        }

    @staticmethod
    def get_leaderboard(clan_id: str) -> ClanLeaderboardResponse:
        clan = IN_MEMORY_CLANS.get(clan_id, IN_MEMORY_CLANS["clan-1"])

        mock_members = [
            {"user_id": "user-123", "full_name": "Swastik Sharma", "portfolio": 1420.50, "cash": 240.50},
            {"user_id": "user-456", "full_name": "Rohan Gupta", "portfolio": 1285.00, "cash": 180.00},
            {"user_id": "user-789", "full_name": "Ananya Verma", "portfolio": 1150.20, "cash": 320.00},
            {"user_id": "user-999", "full_name": "Vikram Patel", "portfolio": 980.00, "cash": 50.00},
        ]

        # Calculate ROI % and sort strictly by ROI descending
        ranked_list: List[LeaderboardMember] = []
        for idx, m in enumerate(mock_members):
            roi = round(((m["portfolio"] - clan["initial_capital"]) / clan["initial_capital"]) * 100.0, 2)
            ranked_list.append(
                LeaderboardMember(
                    rank=0,
                    user_id=m["user_id"],
                    full_name=m["full_name"],
                    portfolio_value=m["portfolio"],
                    cash_balance=m["cash"],
                    roi_pct=roi,
                )
            )

        # Sort by ROI % DESC
        ranked_list.sort(key=lambda x: x.roi_pct, reverse=True)

        # Assign ranks and trophy badges (Gold, Silver, Bronze)
        for i, member in enumerate(ranked_list):
            member.rank = i + 1
            if i == 0:
                member.trophy_badge = "gold"
            elif i == 1:
                member.trophy_badge = "silver"
            elif i == 2:
                member.trophy_badge = "bronze"

        return ClanLeaderboardResponse(
            clan_id=clan["id"],
            clan_name=clan["name"],
            room_code=clan["code"],
            total_members=len(ranked_list),
            leaderboard=ranked_list,
        )
