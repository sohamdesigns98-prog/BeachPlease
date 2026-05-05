from typing import Any

from bson import ObjectId
from fastapi import APIRouter, HTTPException, status

from app.database import get_database

router = APIRouter(prefix="/beaches", tags=["beaches"])


def serialize_beach(beach: dict[str, Any]) -> dict[str, Any]:
    return {
        **beach,
        "id": str(beach["_id"]),
        "_id": str(beach["_id"]),
    }


def require_database():
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MONGODB_URI is not configured",
        )
    return db


@router.get("")
async def list_beaches():
    db = require_database()
    beaches = await db.beaches.find({}).sort("name", 1).to_list(length=None)
    return [serialize_beach(beach) for beach in beaches]


@router.get("/slug/{slug}")
async def get_beach_by_slug(slug: str):
    db = require_database()
    beach = await db.beaches.find_one({"slug": slug})
    if beach is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beach not found",
        )

    return serialize_beach(beach)


@router.get("/{beach_id}")
async def get_beach_by_id(beach_id: str):
    if not ObjectId.is_valid(beach_id):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid beach id",
        )

    db = require_database()
    beach = await db.beaches.find_one({"_id": ObjectId(beach_id)})
    if beach is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beach not found",
        )

    return serialize_beach(beach)
