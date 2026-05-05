import asyncio
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.database import get_database
from app.services.beach_selector import (
    rank_candidate_beaches,
    score_mood_match,
    score_profile_match,
    score_time_of_day,
    extract_mood_tags,
)
from app.services.weather_service import get_conditions_for_beach

router = APIRouter(prefix="/rank", tags=["rank"])

MAX_CONDITION_CANDIDATES = 15


class RankTestRequest(BaseModel):
    mood_phrase: str = Field(min_length=1)


def require_database():
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MONGODB_URI is not configured",
        )
    return db


def unavailable_conditions(error: Exception) -> dict:
    return {
        "temperature": None,
        "wind_kmh": None,
        "wind_direction": None,
        "uv_index": None,
        "wave_height_m": None,
        "wave_period": None,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
        "conditions_unavailable": True,
        "error": str(error),
    }


async def fetch_candidate_conditions(beach: dict) -> tuple[str, dict]:
    try:
        conditions = await get_conditions_for_beach(beach["lat"], beach["lng"])
    except Exception as error:
        conditions = unavailable_conditions(error)

    return beach["slug"], conditions


def preselect_candidates(mood_phrase: str, user_profile: dict, beaches: list[dict]) -> list[dict]:
    mood_tags = extract_mood_tags(mood_phrase)

    def preliminary_score(beach: dict) -> float:
        return (
            score_mood_match(mood_tags, beach) * 0.55
            + score_profile_match(user_profile, beach) * 0.30
            + score_time_of_day(beach) * 0.15
        )

    return sorted(beaches, key=preliminary_score, reverse=True)[:MAX_CONDITION_CANDIDATES]


@router.post("/test")
async def rank_test(
    payload: RankTestRequest,
    current_user: dict = Depends(get_current_user),
):
    db = require_database()
    beaches = await db.beaches.find({}).to_list(length=None)
    if not beaches:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No beaches found. Run the beach seed script first.",
        )

    candidates = preselect_candidates(payload.mood_phrase, current_user, beaches)
    condition_pairs = await asyncio.gather(
        *(fetch_candidate_conditions(beach) for beach in candidates)
    )
    conditions_by_slug = dict(condition_pairs)

    ranked = rank_candidate_beaches(
        payload.mood_phrase,
        current_user,
        candidates,
        conditions_by_slug,
    )

    return ranked[:5]
