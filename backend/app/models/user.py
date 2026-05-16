from datetime import datetime
from enum import Enum
from typing import Any, Optional

from pydantic import BaseModel, EmailStr, Field


class Companions(str, Enum):
    solo = "solo"
    partner = "partner"
    friends = "friends"
    family = "family"
    dog = "dog"


class TravelMode(str, Enum):
    walk = "walk"
    public_transport = "public_transport"
    drive = "drive"


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    suburb: str
    postcode: Optional[str] = None
    suburb_lat: Optional[float] = None
    suburb_lng: Optional[float] = None
    companions: Companions
    travel_mode: TravelMode


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class GoogleAuthRequest(BaseModel):
    credential: str = Field(min_length=20)


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    suburb: str
    postcode: Optional[str] = None
    suburb_lat: Optional[float] = None
    suburb_lng: Optional[float] = None
    companions: Companions
    travel_mode: TravelMode
    auth_provider: str = "password"
    role: str = "user"
    profile_complete: bool = True
    created_at: datetime
    updated_at: datetime


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserPublic


def user_document_to_public(user: dict[str, Any]) -> dict[str, Any]:
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "suburb": user["suburb"],
        "postcode": user.get("postcode"),
        "suburb_lat": user.get("suburb_lat"),
        "suburb_lng": user.get("suburb_lng"),
        "companions": user["companions"],
        "travel_mode": user["travel_mode"],
        "auth_provider": user.get("auth_provider", "password"),
        "role": user.get("role", "user"),
        "profile_complete": user.get("profile_complete", bool(user.get("suburb"))),
        "created_at": user["created_at"],
        "updated_at": user["updated_at"],
    }
