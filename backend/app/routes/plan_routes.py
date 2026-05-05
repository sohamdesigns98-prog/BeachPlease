import asyncio
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import get_database
from app.models.plan import PlanCreateRequest, PlanNotesUpdateRequest
from app.routes.rank_routes import (
    fetch_candidate_conditions,
    preselect_candidates,
)
from app.services.beach_selector import rank_candidate_beaches
from app.services.gemini_service import (
    GeminiServiceError,
    generate_beach_plan_with_gemini,
    validate_selected_beach,
)

router = APIRouter(prefix="/plans", tags=["plans"])

PLAN_CANDIDATE_LIMIT = 5


def require_database():
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MONGODB_URI is not configured",
        )
    return db


def serialize_for_json(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, list):
        return [serialize_for_json(item) for item in value]
    if isinstance(value, dict):
        return {
            key: serialize_for_json(item)
            for key, item in value.items()
        }

    return value


def find_selected_candidate(plan: dict, candidates: list[dict]) -> dict | None:
    selected = plan.get("selected_beach") or {}
    selected_slug = selected.get("slug")
    selected_name = selected.get("name")

    for candidate in candidates:
        if candidate.get("slug") == selected_slug:
            return candidate
        if candidate.get("name") == selected_name:
            return candidate

    return None


def plan_object_id(plan_id: str) -> ObjectId:
    if not ObjectId.is_valid(plan_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid plan id",
        )

    return ObjectId(plan_id)


async def get_owned_plan_or_404(db, plan_id: str, user_id: str) -> dict:
    plan = await db.beach_plans.find_one(
        {
            "_id": plan_object_id(plan_id),
            "user_id": user_id,
        }
    )
    if plan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Plan not found",
        )

    return plan


async def build_generated_plan_fields(
    mood_phrase: str,
    current_user: dict,
    beaches: list[dict],
) -> dict:
    if not beaches:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="No beaches found. Run the beach seed script first.",
        )

    candidate_pool = preselect_candidates(mood_phrase, current_user, beaches)
    condition_pairs = await asyncio.gather(
        *(fetch_candidate_conditions(beach) for beach in candidate_pool)
    )
    conditions_by_slug = dict(condition_pairs)
    top_candidates = rank_candidate_beaches(
        mood_phrase,
        current_user,
        candidate_pool,
        conditions_by_slug,
    )[:PLAN_CANDIDATE_LIMIT]

    try:
        gemini_plan = await generate_beach_plan_with_gemini(
            mood_phrase,
            current_user,
            top_candidates,
        )
        validate_selected_beach(gemini_plan, top_candidates)
    except GeminiServiceError as error:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(error),
        ) from error

    selected_candidate = find_selected_candidate(gemini_plan, top_candidates)
    if selected_candidate is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Selected beach is not in the top candidate list",
        )

    return {
        "selected_beach_name": selected_candidate["name"],
        "selected_beach_slug": selected_candidate["slug"],
        "image_url": selected_candidate.get("image_url", ""),
        "mood_reading": gemini_plan.get("mood_reading", {}),
        "plan": gemini_plan.get("plan", {}),
        "conditions": selected_candidate.get("conditions", {}),
        "candidate_snapshot": top_candidates,
        "rejected_beaches": gemini_plan.get("rejected_beaches", []),
        "confidence": gemini_plan.get("confidence", 0),
        "recommendation_type": gemini_plan.get(
            "recommendation_type",
            "beach_plan",
        ),
    }


@router.post("")
async def create_plan(
    payload: PlanCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    db = require_database()
    beaches = await db.beaches.find({}).to_list(length=None)
    generated_fields = await build_generated_plan_fields(
        payload.mood_phrase,
        current_user,
        beaches,
    )

    now = datetime.now(timezone.utc)
    document = {
        "user_id": current_user["id"],
        "mood_phrase": payload.mood_phrase,
        **generated_fields,
        "input_context": {
            "selected_mood": payload.selected_mood,
            "companion_context": payload.companion_context,
            "experience_tags": payload.experience_tags,
        },
        "user_notes": "",
        "created_at": now,
        "updated_at": now,
        "replayed_at": None,
    }

    result = await db.beach_plans.insert_one(document)
    saved_plan = await db.beach_plans.find_one({"_id": result.inserted_id})
    return serialize_for_json(saved_plan)


@router.get("")
async def list_plans(current_user: dict = Depends(get_current_user)):
    db = require_database()
    plans = await db.beach_plans.find(
        {"user_id": current_user["id"]}
    ).sort("created_at", -1).to_list(length=None)

    return serialize_for_json(plans)


@router.get("/{plan_id}")
async def get_plan(
    plan_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = require_database()
    plan = await get_owned_plan_or_404(db, plan_id, current_user["id"])
    return serialize_for_json(plan)


@router.patch("/{plan_id}")
async def update_plan_notes(
    plan_id: str,
    payload: PlanNotesUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    db = require_database()
    await get_owned_plan_or_404(db, plan_id, current_user["id"])

    now = datetime.now(timezone.utc)
    await db.beach_plans.update_one(
        {
            "_id": plan_object_id(plan_id),
            "user_id": current_user["id"],
        },
        {
            "$set": {
                "user_notes": payload.user_notes,
                "updated_at": now,
            }
        },
    )
    updated_plan = await get_owned_plan_or_404(db, plan_id, current_user["id"])
    return serialize_for_json(updated_plan)


@router.patch("/{plan_id}/replay")
async def replay_plan(
    plan_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = require_database()
    existing_plan = await get_owned_plan_or_404(db, plan_id, current_user["id"])
    beaches = await db.beaches.find({}).to_list(length=None)
    generated_fields = await build_generated_plan_fields(
        existing_plan["mood_phrase"],
        current_user,
        beaches,
    )

    now = datetime.now(timezone.utc)
    await db.beach_plans.update_one(
        {
            "_id": existing_plan["_id"],
            "user_id": current_user["id"],
        },
        {
            "$set": {
                **generated_fields,
                "updated_at": now,
                "replayed_at": now,
            }
        },
    )
    updated_plan = await get_owned_plan_or_404(db, plan_id, current_user["id"])
    return serialize_for_json(updated_plan)


@router.delete("/{plan_id}")
async def delete_plan(
    plan_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = require_database()
    await get_owned_plan_or_404(db, plan_id, current_user["id"])

    await db.beach_plans.delete_one(
        {
            "_id": plan_object_id(plan_id),
            "user_id": current_user["id"],
        }
    )
    return {
        "message": "Plan deleted successfully",
    }
