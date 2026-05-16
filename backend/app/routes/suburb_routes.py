import httpx
from fastapi import APIRouter, Query

router = APIRouter(prefix="/suburbs", tags=["suburbs"])


def normalize_suburb_result(item: dict) -> dict:
    state = item.get("state")
    state_label = state.get("abbreviation") if isinstance(state, dict) else state
    return {
        "name": item.get("name") or item.get("suburb") or item.get("l") or "",
        "postcode": item.get("postcode") or item.get("post_code") or item.get("p") or "",
        "state": state_label or item.get("state_abbreviation") or item.get("s") or "",
        "latitude": item.get("latitude") or item.get("lat"),
        "longitude": item.get("longitude") or item.get("lng") or item.get("lon"),
    }


@router.get("/search")
async def search_suburbs(q: str = Query(min_length=2), state: str = "NSW"):
    async with httpx.AsyncClient(timeout=8.0) as client:
        response = await client.get(
            "https://v0.postcodeapi.com.au/suburbs.json",
            params={"q": q, "state": state},
        )
        response.raise_for_status()
        payload = response.json()

    raw_results = payload if isinstance(payload, list) else payload.get("value") or payload.get("suburbs") or []
    if not isinstance(raw_results, list):
        return []

    normalized_state = state.upper()
    return [
        result
        for result in (normalize_suburb_result(item) for item in raw_results if isinstance(item, dict))
        if str(result.get("state", "")).upper() == normalized_state
    ][:10]
