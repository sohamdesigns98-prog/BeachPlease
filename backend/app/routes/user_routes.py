from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field, field_validator

from app.auth import get_current_user
from app.database import get_database
from app.models.user import Companions, TravelMode, UserPublic, user_document_to_public
from app.services.suburb_validation import canonical_suburb

router = APIRouter(prefix="/users", tags=["users"])


class UserProfileUpdate(BaseModel):
    suburb: Optional[str] = Field(default=None, min_length=1)
    postcode: Optional[str] = None
    suburb_lat: Optional[float] = None
    suburb_lng: Optional[float] = None
    companions: Optional[Companions] = None
    travel_mode: Optional[TravelMode] = None

    @field_validator("suburb")
    @classmethod
    def validate_suburb(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value

        suburb = value.strip()
        if not suburb:
            raise ValueError("Suburb must be non-empty")

        return suburb


@router.get("/me", response_model=UserPublic)
async def read_current_user(current_user: dict = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=UserPublic)
async def update_current_user(
    payload: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
):
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MONGODB_URI is not configured",
        )

    update_data = payload.model_dump(exclude_unset=True)
    if "suburb" in update_data:
        update_data["suburb"] = canonical_suburb(update_data["suburb"])
        update_data["profile_complete"] = True
    if "companions" in update_data:
        update_data["companions"] = update_data["companions"].value
    if "travel_mode" in update_data:
        update_data["travel_mode"] = update_data["travel_mode"].value

    if not update_data:
        return current_user

    update_data["updated_at"] = datetime.now(timezone.utc)
    user_id = ObjectId(current_user["id"])

    await db.users.update_one(
        {"_id": user_id},
        {"$set": update_data},
    )
    updated_user = await db.users.find_one({"_id": user_id})
    if updated_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return user_document_to_public(updated_user)


@router.delete("/me")
async def delete_current_user(current_user: dict = Depends(get_current_user)):
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MONGODB_URI is not configured",
        )

    user_id = ObjectId(current_user["id"])
    await db.users.delete_one({"_id": user_id})

    collection_names = await db.list_collection_names()
    if "beach_plans" in collection_names:
        await db.beach_plans.delete_many(
            {"user_id": {"$in": [current_user["id"], user_id]}}
        )
    if "mood_clusters" in collection_names:
        await db.mood_clusters.delete_many({"user_id": current_user["id"]})

    return {
        "message": "Account deleted successfully",
    }
