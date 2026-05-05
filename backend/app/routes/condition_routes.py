import asyncio
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException, Query, status

from app.database import get_database
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

CROWD_DEFAULT_SCORES = {
    "low": 15,
    "medium": 35,
    "high": 55,
}


def require_database():
    db = get_database()
    if db is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="MONGODB_URI is not configured",
        )
    return db


def clamp(value: int, minimum: int = 0, maximum: int = 100) -> int:
    return max(minimum, min(maximum, value))


def crowd_label(score: int) -> str:
    if score <= 25:
        return "quiet"
    if score <= 50:
        return "med"
    if score <= 75:
        return "busy"
    return "v.busy"


def crowd_bars(score: int) -> str:
    filled = round(score / 10)
    return "█" * filled + "░" * (10 - filled)


def estimate_crowd(beach: dict[str, Any], conditions: dict[str, Any]) -> dict[str, Any]:
    now = datetime.now()
    score = CROWD_DEFAULT_SCORES.get(beach.get("crowd_level_default"), 35)

    if now.weekday() >= 5:
        score += 25
    if 10 <= now.hour <= 15:
        score += 20

    temperature = conditions.get("temperature")
    wind_kmh = conditions.get("wind_kmh")

    if temperature is not None and temperature >= 24:
        score += 10
    if wind_kmh is not None and wind_kmh >= 30:
        score -= 10

    score = clamp(score)
    return {
        "score": score,
        "label": crowd_label(score),
        "bars": crowd_bars(score),
    }


def map_response(beach: dict[str, Any], conditions: dict[str, Any], status_text: str) -> dict:
    return {
        "slug": beach["slug"],
        "name": beach["name"],
        "region": beach["region"],
        "lat": beach["lat"],
        "lng": beach["lng"],
        "map_x": beach["map_x"],
        "map_y": beach["map_y"],
        "conditions": conditions,
        "crowd": estimate_crowd(beach, conditions),
        "status": status_text,
    }


async def conditions_for_map_beach(beach: dict[str, Any]) -> dict:
    try:
        conditions = await get_conditions_for_beach(beach["lat"], beach["lng"])
        return map_response(beach, conditions, "ok")
    except Exception as error:
        conditions = {
            "temperature": None,
            "wind_kmh": None,
            "wind_direction": None,
            "uv_index": None,
            "wave_height_m": None,
            "wave_period": None,
            "fetched_at": datetime.now(timezone.utc).isoformat(),
            "conditions_unavailable": True,
            "error": str(error),
        }
        response = map_response(beach, conditions, "conditions_unavailable")
        response["conditions_unavailable"] = True
        return response


@router.get("/test")
async def test_conditions(
    lat: float = Query(...),
    lng: float = Query(...),
):
    return await get_conditions_for_beach(lat, lng)


@router.get("/map")
async def map_conditions():
    db = require_database()
    beaches = await db.beaches.find(
        {"slug": {"$in": MAP_BEACH_SLUGS}},
    ).to_list(length=None)

    beach_by_slug = {beach["slug"]: beach for beach in beaches}
    ordered_beaches = [
        beach_by_slug[slug]
        for slug in MAP_BEACH_SLUGS
        if slug in beach_by_slug
    ]

    return await asyncio.gather(
        *(conditions_for_map_beach(beach) for beach in ordered_beaches)
    )
