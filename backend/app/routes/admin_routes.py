from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.auth import require_admin
from app.database import get_database
from app.models.beach import BeachWriteRequest
from app.models.user import user_document_to_public
from app.routes.beach_routes import serialize_beach
from app.routes.plan_routes import serialize_for_json
from app.services.activity_log import log_activity

router = APIRouter(prefix="/admin", tags=["admin"])


def require_database():
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MONGODB_URI is not configured",
        )
    return db


def object_id_or_400(value: str) -> ObjectId:
    if not ObjectId.is_valid(value):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid id",
        )
    return ObjectId(value)


def serialize_user(user: dict[str, Any]) -> dict[str, Any]:
    public_user = user_document_to_public(user)
    public_user["role"] = user.get("role", public_user.get("role", "user"))
    return public_user


async def aggregate_count_by(db, collection_name: str, field: str, limit: int = 8) -> list[dict[str, Any]]:
    rows = await db[collection_name].aggregate(
        [
            {"$match": {field: {"$nin": [None, ""]}}},
            {"$group": {"_id": f"${field}", "count": {"$sum": 1}}},
            {"$sort": {"count": -1, "_id": 1}},
            {"$limit": limit},
        ]
    ).to_list(length=None)
    return [{"label": str(row["_id"]), "count": row["count"]} for row in rows]


def start_of_today_utc() -> datetime:
    now = datetime.now(timezone.utc)
    return datetime(now.year, now.month, now.day, tzinfo=timezone.utc)


@router.get("/dashboard")
async def get_dashboard(_: dict = Depends(require_admin)):
    db = require_database()
    today = start_of_today_utc()
    recent_activities = await db.user_activities.find({}).sort("created_at", -1).limit(12).to_list(length=None)
    latest_plans = await db.beach_plans.find({}).sort("created_at", -1).limit(5).to_list(length=None)

    counts = {
        "users": await db.users.count_documents({}),
        "beaches": await db.beaches.count_documents({}),
        "clusters": await db.mood_clusters.count_documents({}),
        "plans": await db.beach_plans.count_documents({}),
        "activities": await db.user_activities.count_documents({}),
        "new_users_today": await db.users.count_documents({"created_at": {"$gte": today}}),
        "plans_today": await db.beach_plans.count_documents({"created_at": {"$gte": today}}),
    }
    charts = {
        "beaches_by_region": await aggregate_count_by(db, "beaches", "region"),
        "beaches_by_water_type": await aggregate_count_by(db, "beaches", "water_type"),
        "plans_by_region": await aggregate_count_by(db, "beach_plans", "region"),
        "plans_by_activity": await aggregate_count_by(db, "beach_plans", "activity"),
        "activities_by_action": await aggregate_count_by(db, "user_activities", "action"),
    }
    return serialize_for_json(
        {
            "counts": counts,
            "charts": charts,
            "recent_activities": recent_activities,
            "latest_plans": latest_plans,
        }
    )


@router.get("/activities")
async def list_activities(_: dict = Depends(require_admin)):
    db = require_database()
    activities = await db.user_activities.find({}).sort("created_at", -1).limit(100).to_list(length=None)
    return serialize_for_json(activities)


@router.get("/users")
async def list_users(_: dict = Depends(require_admin)):
    db = require_database()
    users = await db.users.find({}).sort("created_at", -1).to_list(length=None)
    return [serialize_user(user) for user in users]


@router.patch("/users/{user_id}")
async def update_user_role(user_id: str, payload: dict[str, str], current_user: dict = Depends(require_admin)):
    db = require_database()
    role = payload.get("role")
    if role not in {"user", "admin"}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role must be user or admin",
        )

    await db.users.update_one(
        {"_id": object_id_or_400(user_id)},
        {"$set": {"role": role, "updated_at": datetime.now(timezone.utc)}},
    )
    user = await db.users.find_one({"_id": object_id_or_400(user_id)})
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    await log_activity(
        db,
        action="update_role",
        entity_type="user",
        actor=current_user,
        entity_id=user_id,
        label=user.get("email"),
        metadata={"role": role},
    )
    return serialize_user(user)


@router.delete("/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(require_admin)):
    db = require_database()
    object_id = object_id_or_400(user_id)
    user = await db.users.find_one({"_id": object_id})
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await db.users.delete_one({"_id": object_id})
    await db.beach_plans.delete_many({"user_id": str(object_id)})
    await db.mood_clusters.delete_many({"user_id": str(object_id)})
    await log_activity(
        db,
        action="delete",
        entity_type="user",
        actor=current_user,
        entity_id=user_id,
        label=user.get("email"),
    )
    return {"message": "User and related data deleted"}


@router.get("/plans")
async def list_all_plans(_: dict = Depends(require_admin)):
    db = require_database()
    plans = await db.beach_plans.find({}).sort("created_at", -1).to_list(length=None)
    return serialize_for_json(plans)


@router.delete("/plans/{plan_id}")
async def delete_any_plan(plan_id: str, current_user: dict = Depends(require_admin)):
    db = require_database()
    plan = await db.beach_plans.find_one({"_id": object_id_or_400(plan_id)})
    result = await db.beach_plans.delete_one({"_id": object_id_or_400(plan_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    await log_activity(
        db,
        action="delete",
        entity_type="plan",
        actor=current_user,
        entity_id=plan_id,
        label=(plan or {}).get("selected_beach_name"),
    )
    return {"message": "Plan deleted"}


@router.post("/beaches", status_code=status.HTTP_201_CREATED)
async def create_beach(payload: BeachWriteRequest, current_user: dict = Depends(require_admin)):
    db = require_database()
    now = datetime.now(timezone.utc)
    document = {
        **payload.to_document(),
        "created_at": now,
        "updated_at": now,
    }
    try:
        result = await db.beaches.insert_one(document)
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A beach with this slug already exists",
        ) from exc
    beach = await db.beaches.find_one({"_id": result.inserted_id})
    await log_activity(
        db,
        action="create",
        entity_type="beach",
        actor=current_user,
        entity_id=str(result.inserted_id),
        label=payload.name,
        metadata={"region": payload.region, "suburb": payload.suburb},
    )
    return serialize_beach(beach)


@router.patch("/beaches/{beach_id}")
async def update_beach(beach_id: str, payload: BeachWriteRequest, current_user: dict = Depends(require_admin)):
    db = require_database()
    update_data = {
        **payload.to_document(),
        "updated_at": datetime.now(timezone.utc),
    }
    try:
        await db.beaches.update_one(
            {"_id": object_id_or_400(beach_id)},
            {"$set": update_data},
        )
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A beach with this slug already exists",
        ) from exc
    beach = await db.beaches.find_one({"_id": object_id_or_400(beach_id)})
    if beach is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Beach not found")
    await log_activity(
        db,
        action="update",
        entity_type="beach",
        actor=current_user,
        entity_id=beach_id,
        label=payload.name,
        metadata={"region": payload.region, "suburb": payload.suburb},
    )
    return serialize_beach(beach)


@router.delete("/beaches/{beach_id}")
async def delete_beach(beach_id: str, current_user: dict = Depends(require_admin)):
    db = require_database()
    beach = await db.beaches.find_one({"_id": object_id_or_400(beach_id)})
    if beach is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Beach not found")

    await db.beaches.delete_one({"_id": object_id_or_400(beach_id)})
    await db.mood_clusters.update_many({}, {"$pull": {"beach_slugs": beach.get("slug")}})
    await log_activity(
        db,
        action="delete",
        entity_type="beach",
        actor=current_user,
        entity_id=beach_id,
        label=beach.get("name"),
    )
    return {"message": "Beach deleted"}
