from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status

from app.auth import get_current_user
from app.database import get_database
from app.models.cluster import (
    MoodClusterCreateRequest,
    MoodClusterUpdateRequest,
)

router = APIRouter(prefix="/clusters", tags=["clusters"])


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


def cluster_object_id(cluster_id: str) -> ObjectId:
    if not ObjectId.is_valid(cluster_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid cluster id",
        )
    return ObjectId(cluster_id)


async def get_owned_cluster_or_404(db, cluster_id: str, user_id: str) -> dict:
    cluster = await db.mood_clusters.find_one(
        {
            "_id": cluster_object_id(cluster_id),
            "user_id": user_id,
        }
    )
    if cluster is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Cluster not found",
        )
    return cluster


@router.post("")
async def create_cluster(
    payload: MoodClusterCreateRequest,
    current_user: dict = Depends(get_current_user),
):
    db = require_database()
    now = datetime.now(timezone.utc)
    document = {
        "user_id": current_user["id"],
        "name": payload.name,
        "description": payload.description,
        "mood_phrase": payload.mood_phrase,
        "beach_slugs": payload.beach_slugs,
        "created_at": now,
        "updated_at": now,
    }

    result = await db.mood_clusters.insert_one(document)
    saved_cluster = await db.mood_clusters.find_one({"_id": result.inserted_id})
    return serialize_for_json(saved_cluster)


@router.get("")
async def list_clusters(current_user: dict = Depends(get_current_user)):
    db = require_database()
    clusters = await db.mood_clusters.find(
        {"user_id": current_user["id"]}
    ).sort("updated_at", -1).to_list(length=None)
    return serialize_for_json(clusters)


@router.get("/{cluster_id}")
async def get_cluster(
    cluster_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = require_database()
    cluster = await get_owned_cluster_or_404(
        db,
        cluster_id,
        current_user["id"],
    )
    return serialize_for_json(cluster)


@router.patch("/{cluster_id}")
async def update_cluster(
    cluster_id: str,
    payload: MoodClusterUpdateRequest,
    current_user: dict = Depends(get_current_user),
):
    db = require_database()
    await get_owned_cluster_or_404(db, cluster_id, current_user["id"])

    update_data = payload.model_dump(exclude_unset=True)
    if not update_data:
        cluster = await get_owned_cluster_or_404(
            db,
            cluster_id,
            current_user["id"],
        )
        return serialize_for_json(cluster)

    update_data["updated_at"] = datetime.now(timezone.utc)
    await db.mood_clusters.update_one(
        {
            "_id": cluster_object_id(cluster_id),
            "user_id": current_user["id"],
        },
        {"$set": update_data},
    )
    updated_cluster = await get_owned_cluster_or_404(
        db,
        cluster_id,
        current_user["id"],
    )
    return serialize_for_json(updated_cluster)


@router.delete("/{cluster_id}")
async def delete_cluster(
    cluster_id: str,
    current_user: dict = Depends(get_current_user),
):
    db = require_database()
    await get_owned_cluster_or_404(db, cluster_id, current_user["id"])
    await db.mood_clusters.delete_one(
        {
            "_id": cluster_object_id(cluster_id),
            "user_id": current_user["id"],
        }
    )
    return {
        "message": "Cluster deleted successfully",
    }
