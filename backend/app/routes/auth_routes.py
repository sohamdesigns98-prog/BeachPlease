from datetime import datetime, timezone

import httpx
from fastapi import APIRouter, HTTPException, status
from pymongo.errors import DuplicateKeyError

from app.config import settings
from app.auth import create_access_token, hash_password, verify_password
from app.database import get_database
from app.models.user import AuthResponse, GoogleAuthRequest, UserLogin, UserRegister, user_document_to_public
from app.services.suburb_validation import canonical_suburb

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
        "suburb": canonical_suburb(payload.suburb),
        "postcode": payload.postcode,
        "suburb_lat": payload.suburb_lat,
        "suburb_lng": payload.suburb_lng,
        "companions": payload.companions.value,
        "travel_mode": payload.travel_mode.value,
        "auth_provider": "password",
        "profile_complete": True,
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

    if user is None or not user.get("password_hash") or not verify_password(payload.password, user["password_hash"]):
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


@router.post("/google", response_model=AuthResponse)
async def google_login(payload: GoogleAuthRequest):
    db = require_database()
    require_jwt_secret()

    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="GOOGLE_CLIENT_ID is not configured",
        )

    try:
        async with httpx.AsyncClient(timeout=8.0) as client:
            response = await client.get(
                "https://oauth2.googleapis.com/tokeninfo",
                params={"id_token": payload.credential},
            )
        response.raise_for_status()
        token_info = response.json()
    except httpx.HTTPError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google sign-in could not be verified",
        ) from exc

    if token_info.get("aud") != settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google sign-in is not for this app",
        )

    if token_info.get("email_verified") not in (True, "true", "True"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google email is not verified",
        )

    email = str(token_info.get("email", "")).lower()
    google_sub = token_info.get("sub")
    if not email or not google_sub:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google sign-in did not include an email",
        )

    now = datetime.now(timezone.utc)
    existing_user = await db.users.find_one({"email": email})

    if existing_user is None:
        result = await db.users.insert_one(
            {
                "email": email,
                "google_sub": google_sub,
                "suburb": "",
                "postcode": None,
                "suburb_lat": None,
                "suburb_lng": None,
                "companions": "solo",
                "travel_mode": "public_transport",
                "auth_provider": "google",
                "profile_complete": False,
                "created_at": now,
                "updated_at": now,
            }
        )
        user = await db.users.find_one({"_id": result.inserted_id})
    else:
        await db.users.update_one(
            {"_id": existing_user["_id"]},
            {
                "$set": {
                    "google_sub": existing_user.get("google_sub") or google_sub,
                    "auth_provider": existing_user.get("auth_provider", "password"),
                    "updated_at": now,
                }
            },
        )
        user = await db.users.find_one({"_id": existing_user["_id"]})

    public_user = user_document_to_public(user)

    return {
        "access_token": create_access_token(public_user["id"]),
        "token_type": "bearer",
        "user": public_user,
    }
