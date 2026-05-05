from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.config import settings
from app.auth import create_access_token, hash_password, verify_password
from app.database import get_database
from app.models.user import AuthResponse, UserLogin, UserRegister, user_document_to_public

router = APIRouter(prefix="/auth", tags=["auth"])


def require_database():
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MONGODB_URI is not configured",
        )
    return db


def require_jwt_secret():
    if not settings.jwt_secret:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="JWT_SECRET is not configured",
        )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    db = require_database()
    require_jwt_secret()
    now = datetime.now(timezone.utc)

    user_document = {
        "email": payload.email.lower(),
        "password_hash": hash_password(payload.password),
        "suburb": payload.suburb,
        "companions": payload.companions.value,
        "travel_mode": payload.travel_mode.value,
        "created_at": now,
        "updated_at": now,
    }

    try:
        result = await db.users.insert_one(user_document)
    except DuplicateKeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="A user with this email already exists",
        ) from exc

    created_user = await db.users.find_one({"_id": result.inserted_id})
    public_user = user_document_to_public(created_user)

    return {
        "access_token": create_access_token(public_user["id"]),
        "token_type": "bearer",
        "user": public_user,
    }


@router.post("/login", response_model=AuthResponse)
async def login(payload: UserLogin):
    db = require_database()
    require_jwt_secret()
    user = await db.users.find_one({"email": payload.email.lower()})

    if user is None or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    public_user = user_document_to_public(user)

    return {
        "access_token": create_access_token(public_user["id"]),
        "token_type": "bearer",
        "user": public_user,
    }
