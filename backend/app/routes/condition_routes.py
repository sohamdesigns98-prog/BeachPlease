from fastapi import APIRouter, HTTPException, Query, status

from app.database import get_database
from app.services.conditions_cache import (
    get_all_cached_conditions,
    get_cached_condition_by_slug,
)
from app.services.weather_service import get_conditions_for_beach

router = APIRouter(prefix="/conditions", tags=["conditions"])

MAP_BEACH_SLUGS = [
    "palm-beach",
    "manly-beach",
    "shelly-beach-manly",
    "balmoral-beach",
    "bondi-beach",
    "tamarama-beach",
    "bronte-beach",
    "clovelly-beach",
    "coogee-beach",
    "maroubra-beach",
    "cronulla-beach",
]


def require_database():
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MONGODB_URI is not configured",
        )
    return db


@router.get("/test")
async def test_conditions(
    lat: float = Query(...),
    lng: float = Query(...),
):
    return await get_conditions_for_beach(lat, lng)


@router.get("")
async def all_conditions():
    db = require_database()
    return await get_all_cached_conditions(db)


@router.get("/")
async def all_conditions_with_slash():
    return await all_conditions()


@router.get("/map")
async def map_conditions():
    db = require_database()
    all_cached = await get_all_cached_conditions(db)
    condition_by_slug = {
        item["slug"]: item
        for item in all_cached
    }

    return [
        condition_by_slug[slug]
        for slug in MAP_BEACH_SLUGS
        if slug in condition_by_slug
    ]


@router.get("/{slug}")
async def condition_by_slug(slug: str):
    db = require_database()
    condition = await get_cached_condition_by_slug(db, slug)

    if condition is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Beach conditions not found",
        )

    return condition
