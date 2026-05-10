import asyncio
from datetime import datetime, timedelta, timezone
from typing import Any
from zoneinfo import ZoneInfo

from app.services.weather_service import get_conditions_for_beach

conditions_cache: dict[str, dict[str, Any]] = {}

SYDNEY_TZ = ZoneInfo("Australia/Sydney")
SUCCESS_CACHE_SECONDS = 30 * 60
ERROR_CACHE_SECONDS = 2 * 60

CROWD_DEFAULT_SCORES = {
    "low": 15,
    "medium": 35,
    "high": 55,
}

REGION_KEY_BY_SLUG = {
    "palm-beach": "northern",
    "whale-beach": "northern",
    "avalon-beach": "northern",
    "bilgola-beach": "northern",
    "newport-beach": "northern",
    "mona-vale-beach": "northern",
    "manly-beach": "manly",
    "shelly-beach-manly": "manly",
    "freshwater-beach": "manly",
    "queenscliff-beach": "manly",
    "balmoral-beach": "harbour",
    "chinamans-beach": "harbour",
    "milk-beach": "harbour",
    "camp-cove": "harbour",
    "bondi-beach": "eastern",
    "tamarama-beach": "eastern",
    "bronte-beach": "eastern",
    "clovelly-beach": "eastern",
    "coogee-beach": "eastern",
    "maroubra-beach": "south",
    "malabar-beach": "south",
    "la-perouse-beach": "south",
    "cronulla-beach": "cronulla",
    "wanda-beach": "cronulla",
    "elouera-beach": "cronulla",
    "north-cronulla-beach": "cronulla",
}


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
    now = datetime.now(SYDNEY_TZ)
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


def get_region_key(beach: dict[str, Any]) -> str:
    slug = beach.get("slug", "")
    if slug in REGION_KEY_BY_SLUG:
        return REGION_KEY_BY_SLUG[slug]

    region = str(beach.get("region", "")).lower()
    if "northern" in region or "palm" in region:
        return "northern"
    if "manly" in region:
        return "manly"
    if "harbour" in region:
        return "harbour"
    if "eastern" in region or "bondi" in region:
        return "eastern"
    if "cronulla" in region:
        return "cronulla"
    if "south" in region:
        return "south"

    return "eastern"


def condition_status(conditions: dict[str, Any]) -> str:
    if conditions.get("conditions_unavailable"):
        return "conditions_unavailable"

    wind_kmh = conditions.get("wind_kmh")
    wave_height_m = conditions.get("wave_height_m")

    if wind_kmh is not None and wind_kmh >= 30:
        return "windy"
    if wave_height_m is not None and wave_height_m >= 1.5:
        return "pumping"
    if wave_height_m is not None and wave_height_m <= 0.7:
        return "calm"

    return "ok"


def unavailable_conditions(error: Exception) -> dict[str, Any]:
    return {
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


def build_cache_object(beach: dict[str, Any], conditions: dict[str, Any]) -> dict[str, Any]:
    response = {
        "slug": beach["slug"],
        "name": beach["name"],
        "region": beach.get("region"),
        "region_key": get_region_key(beach),
        "lat": beach.get("lat"),
        "lng": beach.get("lng"),
        "map_x": beach.get("map_x"),
        "map_y": beach.get("map_y"),
        "conditions": conditions,
        "crowd": estimate_crowd(beach, conditions),
        "status": condition_status(conditions),
    }

    if conditions.get("conditions_unavailable"):
        response["conditions_unavailable"] = True

    return response


def cached_condition_is_fresh(condition: dict[str, Any]) -> bool:
    conditions = condition.get("conditions") or {}
    fetched_at = conditions.get("fetched_at")
    if not fetched_at:
        return False

    try:
        fetched = datetime.fromisoformat(fetched_at)
    except ValueError:
        return False

    if fetched.tzinfo is None:
        fetched = fetched.replace(tzinfo=timezone.utc)

    max_age = ERROR_CACHE_SECONDS if condition.get("conditions_unavailable") else SUCCESS_CACHE_SECONDS
    return datetime.now(timezone.utc) - fetched < timedelta(seconds=max_age)


async def fetch_condition_for_beach(beach: dict[str, Any]) -> dict[str, Any]:
    try:
        conditions = await get_conditions_for_beach(beach["lat"], beach["lng"])
    except Exception as error:
        conditions = unavailable_conditions(error)

    return build_cache_object(beach, conditions)


async def refresh_conditions_cache(db) -> dict[str, dict[str, Any]]:
    global conditions_cache

    beaches = await db.beaches.find({}).to_list(length=None)
    if not beaches:
        return conditions_cache

    results = await asyncio.gather(
        *(fetch_condition_for_beach(beach) for beach in beaches),
        return_exceptions=True,
    )

    next_cache: dict[str, dict[str, Any]] = {}
    for beach, result in zip(beaches, results, strict=False):
        if isinstance(result, Exception):
            result = build_cache_object(beach, unavailable_conditions(result))
        next_cache[result["slug"]] = result

    conditions_cache = next_cache
    return conditions_cache


async def get_all_cached_conditions(db) -> list[dict[str, Any]]:
    if not conditions_cache:
        await refresh_conditions_cache(db)

    return list(conditions_cache.values())


async def get_cached_condition_by_slug(db, slug: str) -> dict[str, Any] | None:
    cached = conditions_cache.get(slug)
    if cached is None or not cached_condition_is_fresh(cached):
        beach = await db.beaches.find_one({"slug": slug})
        if beach is None:
            return None
        conditions_cache[slug] = await fetch_condition_for_beach(beach)

    return conditions_cache.get(slug)
