import asyncio
from datetime import datetime, timezone
from typing import Any

import httpx

FORECAST_URL = "https://api.open-meteo.com/v1/forecast"
MARINE_URL = "https://marine-api.open-meteo.com/v1/marine"
REQUEST_TIMEOUT = 10.0


def first_value(values: list[Any] | None) -> Any:
    if not values:
        return None

    return values[0]


def current_or_hourly(data: dict[str, Any], key: str) -> Any:
    current = data.get("current") or {}
    if key in current:
        return current.get(key)

    hourly = data.get("hourly") or {}
    return first_value(hourly.get(key))


async def get_conditions_for_beach(lat: float, lng: float) -> dict:
    forecast_params = {
        "latitude": lat,
        "longitude": lng,
        "current": "temperature_2m,wind_speed_10m,wind_direction_10m,uv_index",
        "hourly": "temperature_2m,wind_speed_10m,wind_direction_10m,uv_index",
        "forecast_hours": 1,
        "timezone": "Australia/Sydney",
        "wind_speed_unit": "kmh",
    }
    marine_params = {
        "latitude": lat,
        "longitude": lng,
        "current": "wave_height,wave_period",
        "hourly": "wave_height,wave_period",
        "forecast_hours": 1,
        "timezone": "Australia/Sydney",
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        forecast_response, marine_response = await asyncio_gather_requests(
            client,
            forecast_params,
            marine_params,
        )

    forecast = forecast_response.json()
    marine = marine_response.json()

    return {
        "temperature": current_or_hourly(forecast, "temperature_2m"),
        "wind_kmh": current_or_hourly(forecast, "wind_speed_10m"),
        "wind_direction": current_or_hourly(forecast, "wind_direction_10m"),
        "uv_index": current_or_hourly(forecast, "uv_index"),
        "wave_height_m": current_or_hourly(marine, "wave_height"),
        "wave_period": current_or_hourly(marine, "wave_period"),
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }


async def asyncio_gather_requests(
    client: httpx.AsyncClient,
    forecast_params: dict[str, Any],
    marine_params: dict[str, Any],
) -> tuple[httpx.Response, httpx.Response]:
    forecast_request = client.get(FORECAST_URL, params=forecast_params)
    marine_request = client.get(MARINE_URL, params=marine_params)
    forecast_response, marine_response = await asyncio.gather(
        forecast_request,
        marine_request,
    )
    forecast_response.raise_for_status()
    marine_response.raise_for_status()
    return forecast_response, marine_response
