import asyncio

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.database import get_database
from app.routes.rank_routes import (
    fetch_candidate_conditions,
    preselect_candidates,
)
from app.services.beach_selector import rank_candidate_beaches
from app.services.gemini_service import (
    GeminiServiceError,
    generate_beach_plan_with_gemini,
)

router = APIRouter(prefix="/ai", tags=["ai"])

GEMINI_CANDIDATE_LIMIT = 5


class TestPlanRequest(BaseModel):
    mood_phrase: str = Field(min_length=1)


def require_database():
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MONGODB_URI is not configured",
        )
    return db


@router.post("/test-plan")
async def test_plan(
    payload: TestPlanRequest,
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
    ranked_candidates = rank_candidate_beaches(
        payload.mood_phrase,
        current_user,
        candidates,
        conditions_by_slug,
    )[:GEMINI_CANDIDATE_LIMIT]

    try:
        return await generate_beach_plan_with_gemini(
            payload.mood_phrase,
            current_user,
            ranked_candidates,
        )
    except GeminiServiceError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(error),
        ) from error
