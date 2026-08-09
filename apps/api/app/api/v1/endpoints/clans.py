from fastapi import APIRouter, HTTPException, status
from app.services.clans import (
    ClanService,
    CreateClanRequest,
    JoinClanRequest,
    ClanLeaderboardResponse,
)

router = APIRouter()


@router.post("/create", status_code=status.HTTP_201_CREATED)
async def create_new_clan(payload: CreateClanRequest):
    """
    Creates a new multiplayer trading league (Clan) and generates a unique 6-character PIN code.
    """
    try:
        res = ClanService.create_clan(payload)
        return res
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create clan league: {str(e)}",
        )


@router.post("/join", status_code=status.HTTP_200_OK)
async def join_clan_with_code(payload: JoinClanRequest):
    """
    Joins an existing clan league using a 6-character room PIN code.
    """
    try:
        res = ClanService.join_clan_by_code(payload)
        return res
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to join clan: {str(e)}",
        )


@router.get("/leaderboard/{clan_id}", response_model=ClanLeaderboardResponse, status_code=status.HTTP_200_OK)
async def get_clan_leaderboard_rankings(clan_id: str):
    """
    Retrieves real-time ROI % leaderboard rankings for all members in a given clan league.
    """
    try:
        leaderboard = ClanService.get_leaderboard(clan_id)
        return leaderboard
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch leaderboard for clan {clan_id}: {str(e)}",
        )
