from datetime import datetime
from math import atan2, cos, radians, sin, sqrt
from typing import Any

MOOD_TAG_MAPPING = {
    ("quiet", "disappear", "reset", "alone"): [
        "quiet",
        "calm",
        "low_social",
        "slow",
        "private",
    ],
    ("romantic", "favourite person", "date"): [
        "romantic",
        "gentle",
        "scenic",
        "sunset",
    ],
    ("swim", "swimming"): ["swim", "protected", "calm_water"],
    ("surf", "waves"): ["surf", "active"],
    ("walk", "sunset"): ["walk", "scenic", "late_afternoon"],
    ("friends", "social"): ["social", "cafes", "medium_energy"],
    ("dog",): ["dog_friendly"],
    ("cinematic", "main character"): [
        "cinematic",
        "scenic",
        "destination",
        "escape",
    ],
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


def clamp_score(score: float) -> float:
    return max(0.0, min(100.0, score))


def extract_mood_tags(mood_phrase: str) -> list[str]:
    phrase = mood_phrase.lower()
    mood_tags = []

    for triggers, tags in MOOD_TAG_MAPPING.items():
        if any(trigger in phrase for trigger in triggers):
            mood_tags.extend(tags)

    return sorted(set(mood_tags))


def beach_tags(beach: dict) -> set[str]:
    tags = set()
    for key in ("vibe_tags", "best_for", "avoid_when", "facilities", "access_tags", "ideal_times"):
        tags.update(str(tag).lower() for tag in beach.get(key, []))

    name = str(beach.get("name", "")).lower()
    region = str(beach.get("region", "")).lower()
    dog_access = str(beach.get("dog_access", "")).lower()
    exposure = str(beach.get("exposure", "")).lower()
    water_type = str(beach.get("water_type", "")).lower()
    crowd_level = str(beach.get("crowd_level_default", "")).lower()

    if dog_access in {"off_leash", "off_leash_zones", "dog_friendly"}:
        tags.add("dog_friendly")
    if dog_access == "restricted":
        tags.add("dog_restricted")
    if dog_access == "not_allowed":
        tags.add("dog_not_allowed")

    if exposure == "protected":
        tags.update({"protected", "calm", "calm_water", "gentle"})
    if exposure == "semi_protected":
        tags.update({"semi_protected", "swim"})
    if exposure == "exposed":
        tags.update({"surf", "active"})

    if water_type in {"bay", "harbour", "cove"}:
        tags.update({"calm", "protected", "calm_water"})
    if crowd_level == "low":
        tags.update({"quiet", "low_social", "slow", "private"})
    if crowd_level == "medium":
        tags.add("medium_energy")
    if crowd_level == "high":
        tags.update({"social", "busy"})

    if any(term in name for term in ("palm", "whale", "bungan", "avalon")):
        tags.update({"destination", "escape", "scenic"})
    if region in {"harbour", "lower north shore", "northern beaches"}:
        tags.add("scenic")

    return tags


def region_key_for_beach(beach: dict, conditions: dict | None = None) -> str:
    if conditions and conditions.get("region_key"):
        return conditions["region_key"]

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


def score_region_match(region: str | None, beach: dict, conditions: dict | None = None) -> float:
    if not region:
        return 50.0

    return 92.0 if region_key_for_beach(beach, conditions) == region else 18.0


def score_activity_match(activity: str | None, beach: dict, conditions: dict | None = None) -> float:
    if not activity:
        return 50.0

    tags = beach_tags(beach)
    conditions = conditions or {}
    score = 50.0
    wave_height = conditions.get("wave_height_m")
    exposure = beach.get("exposure")

    if activity == "swim":
        if beach.get("swim_suitability") == "high":
            score += 28
        if exposure in {"protected", "semi_protected"}:
            score += 16
        if wave_height is not None and wave_height >= 1.5:
            score -= 28

    if activity == "surf":
        if beach.get("surf_suitability") == "high":
            score += 32
        if exposure in {"exposed", "semi_protected"}:
            score += 16
        if wave_height is not None and wave_height >= 0.8:
            score += 16

    if activity == "relax":
        if tags.intersection({"quiet", "calm", "private", "slow"}):
            score += 24
        if beach.get("crowd_level_default") == "low":
            score += 16
        if exposure == "protected":
            score += 10

    if activity == "snorkel":
        if tags.intersection({"snorkel", "calm_water", "protected"}):
            score += 30
        if exposure == "protected":
            score += 16
        if wave_height is not None and wave_height >= 1.0:
            score -= 18

    if activity == "walk":
        if beach.get("walk_suitability") == "high":
            score += 30
        if tags.intersection({"scenic", "coastal_walk", "walk"}):
            score += 20

    return clamp_score(score)


def score_companion_match(companion: str | None, beach: dict, conditions: dict | None = None) -> float:
    if not companion:
        return 50.0

    score = 50.0
    tags = beach_tags(beach)
    crowd = (conditions or {}).get("crowd") or {}
    crowd_score = crowd.get("score")
    facilities = set(beach.get("facilities", []))
    access_tags = set(beach.get("access_tags", []))
    dog_access = beach.get("dog_access")

    if companion == "solo":
        if tags.intersection({"quiet", "private", "low_social", "slow"}):
            score += 28
        if crowd_score is not None and crowd_score <= 35:
            score += 12

    if companion == "partner":
        if tags.intersection({"romantic", "scenic", "calm", "sunset"}):
            score += 30

    if companion == "family":
        if facilities:
            score += min(22, len(facilities) * 4)
        if beach.get("accessibility") == "easy":
            score += 12
        if beach.get("exposure") == "protected":
            score += 16

    if companion == "dog":
        if "dog_friendly" in tags:
            score += 35
        elif dog_access == "restricted":
            score += 10
        elif dog_access == "not_allowed":
            score -= 35

    if companion == "mates":
        if tags.intersection({"social", "cafes", "swim", "medium_energy"}):
            score += 26
        if access_tags.intersection({"public_transport_easy", "ferry", "bus", "train"}):
            score += 10

    return clamp_score(score)


def preferred_beach_boost(preferred_beach_slug: str | None, beach: dict) -> float:
    if preferred_beach_slug and beach.get("slug") == preferred_beach_slug:
        return 12.0

    return 0.0


def score_mood_match(mood_tags: list[str], beach: dict) -> float:
    if not mood_tags:
        return 50.0

    tags = beach_tags(beach)
    matches = sum(1 for tag in mood_tags if tag in tags)
    score = 25 + (matches / len(mood_tags)) * 75

    return clamp_score(score)


def distance_km(lat_a: float, lng_a: float, lat_b: float, lng_b: float) -> float:
    radius_km = 6371.0
    dlat = radians(lat_b - lat_a)
    dlng = radians(lng_b - lng_a)
    a = (
        sin(dlat / 2) ** 2
        + cos(radians(lat_a)) * cos(radians(lat_b)) * sin(dlng / 2) ** 2
    )
    return radius_km * 2 * atan2(sqrt(a), sqrt(1 - a))


def suburb_distance_to_beach(user_profile: dict, beach: dict) -> float | None:
    user_lat = user_profile.get("suburb_lat")
    user_lng = user_profile.get("suburb_lng")
    beach_lat = beach.get("lat")
    beach_lng = beach.get("lng")

    if None in {user_lat, user_lng, beach_lat, beach_lng}:
        return None

    try:
        return distance_km(
            float(user_lat),
            float(user_lng),
            float(beach_lat),
            float(beach_lng),
        )
    except (TypeError, ValueError):
        return None


def score_profile_match(user_profile: dict, beach: dict) -> float:
    score = 50.0
    tags = beach_tags(beach)
    companions = user_profile.get("companions")
    travel_mode = user_profile.get("travel_mode")
    profile_suburb = str(user_profile.get("suburb") or "").strip().lower()
    beach_suburb = str(beach.get("suburb") or "").strip().lower()
    facilities = set(beach.get("facilities", []))
    access_tags = set(beach.get("access_tags", []))
    dog_access = beach.get("dog_access")

    if companions == "dog":
        if "dog_friendly" in tags:
            score += 35
        elif dog_access == "restricted":
            score += 8
        elif dog_access == "not_allowed":
            score -= 35

    if companions == "family":
        if facilities:
            score += min(20, len(facilities) * 4)
        if beach.get("exposure") == "protected":
            score += 18
        if beach.get("swim_suitability") == "high":
            score += 8

    if companions == "partner":
        if tags.intersection({"romantic", "calm", "sunset", "scenic", "gentle"}):
            score += 25

    if companions == "friends":
        if tags.intersection({"social", "cafes", "medium_energy"}):
            score += 20

    if companions == "solo":
        if tags.intersection({"quiet", "private", "slow", "low_social"}):
            score += 18

    if travel_mode == "public_transport":
        if "public_transport_easy" in access_tags:
            score += 25
        elif access_tags.intersection({"bus", "train", "ferry"}):
            score += 18
        else:
            score -= 12

    if travel_mode == "walk":
        if "walking_track" in access_tags or beach.get("walk_suitability") == "high":
            score += 18
        else:
            score -= 10

    if travel_mode == "drive":
        if "destination" in tags or "parking" in access_tags or "paid_parking" in access_tags:
            score += 12

    return clamp_score(score)


def score_conditions(conditions: dict, beach: dict) -> float:
    if not conditions or conditions.get("conditions_unavailable"):
        return 50.0

    score = 70.0
    temperature = conditions.get("temperature")
    wind_kmh = conditions.get("wind_kmh")
    uv_index = conditions.get("uv_index")
    wave_height = conditions.get("wave_height_m")
    exposure = beach.get("exposure")
    swim_suitability = beach.get("swim_suitability")
    walk_suitability = beach.get("walk_suitability")

    if uv_index is not None and uv_index >= 8 and swim_suitability == "high":
        score -= 12

    if wind_kmh is not None and wind_kmh >= 30:
        if exposure == "exposed":
            score -= 25
        elif exposure == "semi_protected":
            score -= 12
        else:
            score -= 5

    if wave_height is not None and wave_height >= 1.5:
        if swim_suitability == "high":
            score -= 20
        elif swim_suitability == "medium":
            score -= 10
        if beach.get("surf_suitability") == "high":
            score += 8

    if wave_height is not None and wave_height <= 0.7:
        if exposure == "protected" and swim_suitability == "high":
            score += 18

    if temperature is not None and temperature < 19:
        if swim_suitability == "high":
            score -= 15
        if walk_suitability == "high":
            score += 12

    return clamp_score(score)


def score_time_of_day(beach: dict) -> float:
    hour = datetime.now().hour
    ideal_times = set(beach.get("ideal_times", []))
    current_tags = set()

    if 5 <= hour <= 9:
        current_tags.update({"early_morning", "morning"})
    if 9 <= hour <= 11:
        current_tags.add("morning")
    if 11 <= hour <= 15:
        current_tags.add("midday")
    if 12 <= hour <= 17:
        current_tags.add("afternoon")
    if 15 <= hour <= 18:
        current_tags.add("late_afternoon")
    if 17 <= hour <= 20:
        current_tags.add("sunset")
    if 18 <= hour <= 22:
        current_tags.add("evening")

    if ideal_times.intersection(current_tags):
        return 90.0
    if not ideal_times:
        return 55.0
    return 60.0


def score_reason_details(
    mood_tags: list[str],
    user_profile: dict,
    conditions: dict,
    beach: dict,
    region: str | None = None,
    activity: str | None = None,
    companion: str | None = None,
    preferred_beach_slug: str | None = None,
) -> tuple[list[str], list[str]]:
    tags = beach_tags(beach)
    matched_reasons = []
    penalties = []

    for tag in mood_tags:
        if tag in tags:
            matched_reasons.append(f"Matches mood: {tag}")

    if region and region_key_for_beach(beach, conditions) == region:
        matched_reasons.append(f"Fits selected region: {region}")

    if activity and score_activity_match(activity, beach, conditions) >= 70:
        matched_reasons.append(f"Strong fit for {activity}")

    if companion and score_companion_match(companion, beach, conditions) >= 70:
        matched_reasons.append(f"Works well for {companion}")

    if preferred_beach_slug and beach.get("slug") == preferred_beach_slug:
        matched_reasons.append("Soft boost from preferred beach")

    companions = user_profile.get("companions")
    travel_mode = user_profile.get("travel_mode")
    distance = suburb_distance_to_beach(user_profile, beach)

    if distance is not None:
        if distance <= 12:
            matched_reasons.append(f"Close to profile suburb: about {round(distance)}km away")
        elif distance >= 45 and travel_mode != "drive":
            penalties.append(f"Longer trip from profile suburb: about {round(distance)}km")

    if companions == "dog":
        if "dog_friendly" in tags:
            matched_reasons.append("Dog-friendly access")
        elif beach.get("dog_access") == "restricted":
            matched_reasons.append("Some dog access restrictions")
        elif beach.get("dog_access") == "not_allowed":
            penalties.append("Dogs are not allowed")

    if companions == "family" and beach.get("exposure") == "protected":
        matched_reasons.append("Protected water suits family beach days")
    if companions == "partner" and tags.intersection({"romantic", "calm", "sunset", "scenic"}):
        matched_reasons.append("Good partner/date vibe")
    if travel_mode == "public_transport" and tags.intersection({"bus", "train", "ferry"}):
        matched_reasons.append("Reachable by public transport")
    if travel_mode == "drive" and tags.intersection({"destination", "parking", "paid_parking"}):
        matched_reasons.append("Works well as a driving destination")

    temperature = conditions.get("temperature") if conditions else None
    wind_kmh = conditions.get("wind_kmh") if conditions else None
    uv_index = conditions.get("uv_index") if conditions else None
    wave_height = conditions.get("wave_height_m") if conditions else None

    if uv_index is not None and uv_index >= 8 and beach.get("swim_suitability") == "high":
        penalties.append("High UV makes midday swimming less ideal")
    if wind_kmh is not None and wind_kmh >= 30 and beach.get("exposure") == "exposed":
        penalties.append("Strong wind penalises exposed beaches")
    if wave_height is not None and wave_height >= 1.5 and beach.get("swim_suitability") in {"medium", "high"}:
        penalties.append("Higher waves reduce swim suitability")
    if wave_height is not None and wave_height <= 0.7 and beach.get("exposure") == "protected":
        matched_reasons.append("Small waves suit protected swimming")
    if temperature is not None and temperature < 19:
        if beach.get("swim_suitability") == "high":
            penalties.append("Cooler temperature reduces swim appeal")
        if beach.get("walk_suitability") == "high":
            matched_reasons.append("Cooler weather suits a walk")

    return matched_reasons[:8], penalties[:6]


def serialize_beach(beach: dict) -> dict:
    serialized = dict(beach)
    if "_id" in serialized:
        serialized["_id"] = str(serialized["_id"])
        serialized["id"] = serialized["_id"]
    return serialized


def rank_candidate_beaches(
    mood_phrase: str,
    user_profile: dict,
    beaches: list[dict],
    conditions_by_slug: dict,
    region: str | None = None,
    activity: str | None = None,
    companion: str | None = None,
    preferred_beach_slug: str | None = None,
) -> list[dict]:
    mood_tags = extract_mood_tags(mood_phrase)
    candidate_beaches = beaches
    if region:
        region_matches = [
            beach
            for beach in beaches
            if region_key_for_beach(
                beach,
                conditions_by_slug.get(beach.get("slug"), {}),
            ) == region
        ]
        if region_matches:
            candidate_beaches = region_matches

    ranked = []

    for beach in candidate_beaches:
        conditions = conditions_by_slug.get(beach.get("slug"), {})
        mood_score = score_mood_match(mood_tags, beach)
        condition_score = score_conditions(conditions, beach)
        profile_score = score_profile_match(user_profile, beach)
        time_score = score_time_of_day(beach)
        region_score = score_region_match(region, beach, conditions)
        activity_score = score_activity_match(activity, beach, conditions)
        companion_score = score_companion_match(companion, beach, conditions)
        final_score = clamp_score(
            mood_score * 0.24
            + condition_score * 0.22
            + profile_score * 0.14
            + time_score * 0.08
            + region_score * 0.12
            + activity_score * 0.12
            + companion_score * 0.08
            + preferred_beach_boost(preferred_beach_slug, beach)
        )
        matched_reasons, penalties = score_reason_details(
            mood_tags,
            user_profile,
            conditions,
            beach,
            region,
            activity,
            companion,
            preferred_beach_slug,
        )

        ranked.append(
            {
                **serialize_beach(beach),
                "score": round(final_score, 2),
                "score_breakdown": {
                    "mood_score": round(mood_score, 2),
                    "condition_score": round(condition_score, 2),
                    "profile_score": round(profile_score, 2),
                    "time_score": round(time_score, 2),
                    "region_score": round(region_score, 2),
                    "activity_score": round(activity_score, 2),
                    "companion_score": round(companion_score, 2),
                    "profile_distance_km": (
                        round(suburb_distance_to_beach(user_profile, beach), 1)
                        if suburb_distance_to_beach(user_profile, beach) is not None
                        else None
                    ),
                },
                "matched_reasons": matched_reasons,
                "penalties": penalties,
                "conditions": conditions,
            }
        )

    return sorted(ranked, key=lambda beach: beach["score"], reverse=True)
    if profile_suburb and profile_suburb == beach_suburb:
        score += 28

    distance = suburb_distance_to_beach(user_profile, beach)
    if distance is not None:
        if distance <= 5:
            score += 24
        elif distance <= 12:
            score += 18
        elif distance <= 25:
            score += 10
        elif distance >= 45 and travel_mode != "drive":
            score -= 12
