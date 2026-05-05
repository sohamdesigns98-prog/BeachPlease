from datetime import datetime
from enum import Enum
from typing import Any

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
    companions: Companions
    travel_mode: TravelMode


class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)


class UserPublic(BaseModel):
    id: str
    email: EmailStr
    suburb: str
    companions: Companions
    travel_mode: TravelMode
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
        "companions": user["companions"],
        "travel_mode": user["travel_mode"],
        "created_at": user["created_at"],
        "updated_at": user["updated_at"],
    }
