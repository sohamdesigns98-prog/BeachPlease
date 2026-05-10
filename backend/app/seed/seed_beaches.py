import asyncio
from datetime import datetime, timezone

from pymongo import ASCENDING

from app.database import get_database
from app.seed.beach_images import WIKIMEDIA_BEACH_IMAGES


def build_beach(
    name,
    slug,
    suburb,
    region,
    lat,
    lng,
    map_x,
    map_y,
    vibe_tags,
    best_for,
    avoid_when,
    facilities,
    access_tags,
    dog_access,
    accessibility,
    crowd_level_default,
    ideal_times,
    water_type,
    exposure,
    swim_suitability,
    surf_suitability,
    walk_suitability,
):
    return {
        "name": name,
        "slug": slug,
        "suburb": suburb,
        "region": region,
        "lat": lat,
        "lng": lng,
        "map_x": map_x,
        "map_y": map_y,
        "image_url": "",
        "attribution": "Image placeholder. Replace with licensed beach photography before production.",
        "vibe_tags": vibe_tags,
        "best_for": best_for,
        "avoid_when": avoid_when,
        "facilities": facilities,
        "access_tags": access_tags,
        "dog_access": dog_access,
        "accessibility": accessibility,
        "crowd_level_default": crowd_level_default,
        "ideal_times": ideal_times,
        "water_type": water_type,
        "exposure": exposure,
        "swim_suitability": swim_suitability,
        "surf_suitability": surf_suitability,
        "walk_suitability": walk_suitability,
    }


BEACHES = [
    build_beach("Bondi Beach", "bondi-beach", "Bondi Beach", "Eastern Suburbs", -33.8915, 151.2767, 73, 55, ["iconic", "busy", "surf"], ["surfing", "people watching", "cafes"], ["big crowds", "rough surf"], ["toilets", "showers", "lifeguards", "cafes"], ["bus", "paid_parking", "coastal_walk"], "restricted", "easy", "high", ["early_morning", "sunset"], "ocean", "exposed", "high", "high", "high"),
    build_beach("Tamarama Beach", "tamarama-beach", "Tamarama", "Eastern Suburbs", -33.8983, 151.2719, 72, 57, ["compact", "dramatic", "local"], ["sunbathing", "coastal walk", "quick swims"], ["dangerous surf", "crowded weekends"], ["toilets", "showers", "lifeguards"], ["bus", "coastal_walk"], "restricted", "moderate", "high", ["morning", "late_afternoon"], "ocean", "exposed", "medium", "medium", "high"),
    build_beach("Bronte Beach", "bronte-beach", "Bronte", "Eastern Suburbs", -33.9019, 151.2682, 71, 58, ["family", "picnic", "ocean pool"], ["families", "ocean pool", "picnics"], ["large swell", "parking pressure"], ["toilets", "showers", "lifeguards", "bbq", "park"], ["bus", "paid_parking", "coastal_walk"], "restricted", "easy", "high", ["morning", "weekday"], "ocean", "semi_protected", "high", "medium", "high"),
    build_beach("Clovelly Beach", "clovelly-beach", "Clovelly", "Eastern Suburbs", -33.9123, 151.2665, 70, 61, ["protected", "snorkel", "family"], ["snorkelling", "calm swims", "kids"], ["after heavy rain"], ["toilets", "showers", "lifeguards", "kiosk"], ["bus", "parking", "coastal_walk"], "restricted", "easy", "medium", ["morning", "midday"], "bay", "protected", "high", "low", "medium"),
    build_beach("Gordons Bay", "gordons-bay", "Coogee", "Eastern Suburbs", -33.9169, 151.2662, 70, 62, ["snorkel", "rocky", "quiet"], ["snorkelling", "floating", "romantic swims"], ["large swell", "mobility needs"], ["nearby_toilets"], ["bus", "coastal_walk"], "restricted", "moderate", "medium", ["morning"], "bay", "protected", "medium", "low", "medium"),
    build_beach("Coogee Beach", "coogee-beach", "Coogee", "Eastern Suburbs", -33.9205, 151.2588, 69, 63, ["family", "social", "cafes"], ["families", "cafes", "safe swimming"], ["crowded summer days"], ["toilets", "showers", "lifeguards", "cafes", "park"], ["bus", "paid_parking"], "restricted", "easy", "high", ["morning", "evening"], "ocean", "semi_protected", "high", "medium", "high"),
    build_beach("Maroubra Beach", "maroubra-beach", "Maroubra", "Eastern Suburbs", -33.9502, 151.2593, 69, 69, ["wide", "surf", "local"], ["surfing", "long walks", "space"], ["strong rips"], ["toilets", "showers", "lifeguards", "cafes"], ["bus", "parking"], "restricted", "easy", "medium", ["early_morning", "late_afternoon"], "ocean", "exposed", "medium", "high", "high"),
    build_beach("Malabar Beach", "malabar-beach", "Malabar", "Eastern Suburbs", -33.9637, 151.2503, 67, 72, ["calm", "local", "family"], ["calm swims", "kids", "low key days"], ["after heavy rain"], ["toilets", "showers", "park"], ["bus", "parking"], "restricted", "easy", "low", ["mid_morning", "afternoon"], "bay", "protected", "high", "low", "medium"),
    build_beach("Little Bay Beach", "little-bay-beach", "Little Bay", "Eastern Suburbs", -33.9797, 151.2516, 68, 75, ["scenic", "protected", "hidden"], ["calm swims", "snorkelling", "quiet dates"], ["limited parking"], ["toilets", "showers"], ["bus", "parking"], "restricted", "moderate", "medium", ["morning", "weekday"], "bay", "protected", "high", "low", "medium"),
    build_beach("La Perouse Beach", "la-perouse-beach", "La Perouse", "Eastern Suburbs", -33.9891, 151.2312, 63, 77, ["heritage", "calm", "walks"], ["history walks", "calm water", "families"], ["strong wind"], ["toilets", "cafes", "parking"], ["bus", "parking"], "restricted", "easy", "medium", ["morning", "sunset"], "bay", "protected", "medium", "low", "high"),
    build_beach("Milk Beach", "milk-beach", "Vaucluse", "Harbour", -33.8537, 151.2711, 72, 47, ["harbour", "views", "boutique"], ["harbour views", "dates", "picnics"], ["high tide", "limited shade"], ["nearby_toilets"], ["bus", "walking_track"], "restricted", "moderate", "medium", ["sunrise", "weekday"], "harbour", "protected", "medium", "low", "medium"),
    build_beach("Shark Beach", "shark-beach", "Vaucluse", "Harbour", -33.8522, 151.2677, 71, 47, ["harbour", "family", "netted"], ["families", "calm swimming", "picnics"], ["crowded weekends"], ["toilets", "showers", "kiosk", "netted_swim_area"], ["bus", "paid_parking"], "restricted", "easy", "high", ["morning", "weekday"], "harbour", "protected", "high", "low", "medium"),
    build_beach("Camp Cove", "camp-cove", "Watsons Bay", "Harbour", -33.8414, 151.2816, 75, 45, ["harbour", "sunset", "calm"], ["sunset", "calm swims", "families"], ["parking pressure"], ["toilets", "showers", "kiosk"], ["ferry", "bus", "parking"], "restricted", "easy", "high", ["morning", "sunset"], "harbour", "protected", "high", "low", "medium"),
    build_beach("Lady Bay Beach", "lady-bay-beach", "Watsons Bay", "Harbour", -33.8338, 151.2808, 75, 43, ["secluded", "harbour", "clothing_optional"], ["quiet swims", "views"], ["limited access", "family facilities needed"], ["nearby_toilets"], ["ferry", "walking_track"], "restricted", "moderate", "medium", ["midday", "weekday"], "harbour", "protected", "medium", "low", "medium"),
    build_beach("Nielsen Park Beach", "nielsen-park-beach", "Vaucluse", "Harbour", -33.8512, 151.2686, 71, 47, ["classic", "harbour", "family"], ["picnics", "families", "calm swims"], ["peak weekend crowds"], ["toilets", "showers", "kiosk", "park"], ["bus", "parking"], "restricted", "easy", "high", ["early_morning", "weekday"], "harbour", "protected", "high", "low", "high"),
    build_beach("Balmoral Beach", "balmoral-beach", "Mosman", "Lower North Shore", -33.8252, 151.2524, 68, 40, ["calm", "family", "cafes"], ["families", "stand up paddle", "long lunches"], ["parking pressure"], ["toilets", "showers", "cafes", "playground"], ["bus", "paid_parking"], "restricted", "easy", "high", ["morning", "weekday"], "harbour", "protected", "high", "low", "high"),
    build_beach("Chinamans Beach", "chinamans-beach", "Mosman", "Lower North Shore", -33.8172, 151.2485, 67, 39, ["quiet", "harbour", "family"], ["picnics", "calm swims", "kids"], ["limited cafes"], ["toilets", "park"], ["bus", "parking"], "restricted", "easy", "medium", ["morning", "afternoon"], "harbour", "protected", "high", "low", "medium"),
    build_beach("Clifton Gardens", "clifton-gardens", "Mosman", "Lower North Shore", -33.8408, 151.2568, 69, 44, ["netted", "family", "picnic"], ["families", "jetty walks", "calm swims"], ["parking pressure"], ["toilets", "bbq", "playground", "netted_swim_area"], ["bus", "paid_parking"], "restricted", "easy", "high", ["morning"], "harbour", "protected", "high", "low", "medium"),
    build_beach("Obelisk Beach", "obelisk-beach", "Mosman", "Lower North Shore", -33.8327, 151.2676, 72, 42, ["secluded", "harbour", "clothing_optional"], ["quiet swims", "views"], ["limited facilities"], ["nearby_toilets"], ["walking_track"], "restricted", "moderate", "low", ["midday", "weekday"], "harbour", "protected", "medium", "low", "medium"),
    build_beach("Cobblers Beach", "cobblers-beach", "Mosman", "Lower North Shore", -33.8268, 151.2707, 73, 41, ["secluded", "bushland", "harbour"], ["quiet swims", "bush walks", "views"], ["limited facilities"], ["nearby_toilets"], ["walking_track"], "restricted", "moderate", "low", ["morning", "weekday"], "harbour", "protected", "medium", "low", "high"),
    build_beach("Manly Beach", "manly-beach", "Manly", "Northern Beaches", -33.7969, 151.2873, 76, 34, ["iconic", "surf", "social"], ["surfing", "cafes", "day trips"], ["big crowds", "strong rips"], ["toilets", "showers", "lifeguards", "cafes"], ["ferry", "bus", "paid_parking"], "restricted", "easy", "high", ["early_morning", "evening"], "ocean", "exposed", "high", "high", "high"),
    build_beach("Shelly Beach", "shelly-beach-manly", "Manly", "Northern Beaches", -33.8008, 151.2988, 79, 35, ["snorkel", "protected", "scenic"], ["snorkelling", "calm swims", "walks"], ["crowded weekends"], ["toilets", "showers", "kiosk"], ["ferry", "walking_track"], "restricted", "easy", "high", ["morning", "weekday"], "cove", "protected", "high", "low", "high"),
    build_beach("Freshwater Beach", "freshwater-beach", "Freshwater", "Northern Beaches", -33.7799, 151.2907, 77, 31, ["surf", "family", "local"], ["surfing", "families", "ocean pool"], ["large swell"], ["toilets", "showers", "lifeguards", "kiosk"], ["bus", "parking"], "restricted", "easy", "medium", ["morning"], "ocean", "semi_protected", "high", "high", "medium"),
    build_beach("Curl Curl Beach", "curl-curl-beach", "Curl Curl", "Northern Beaches", -33.7683, 151.2964, 78, 29, ["wide", "surf", "space"], ["surfing", "long walks", "space"], ["strong rips"], ["toilets", "showers", "lifeguards"], ["bus", "parking"], "restricted", "easy", "medium", ["early_morning", "late_afternoon"], "ocean", "exposed", "medium", "high", "high"),
    build_beach("Dee Why Beach", "dee-why-beach", "Dee Why", "Northern Beaches", -33.7524, 151.2966, 78, 26, ["family", "cafes", "surf"], ["families", "cafes", "ocean pool"], ["busy weekends"], ["toilets", "showers", "lifeguards", "cafes", "ocean_pool"], ["bus", "parking"], "restricted", "easy", "high", ["morning", "weekday"], "ocean", "semi_protected", "high", "medium", "high"),
    build_beach("Long Reef Beach", "long-reef-beach", "Collaroy", "Northern Beaches", -33.7398, 151.3106, 81, 24, ["wild", "walks", "surf"], ["headland walks", "surfing", "space"], ["strong wind", "large swell"], ["toilets", "showers", "lifeguards"], ["bus", "parking"], "restricted", "moderate", "medium", ["morning", "sunset"], "ocean", "exposed", "medium", "high", "high"),
    build_beach("Collaroy Beach", "collaroy-beach", "Collaroy", "Northern Beaches", -33.7315, 151.3028, 79, 23, ["family", "accessible", "calmer"], ["families", "accessible visits", "swimming"], ["erosion events", "big swell"], ["toilets", "showers", "lifeguards", "cafes"], ["bus", "parking", "accessible"], "restricted", "easy", "medium", ["morning", "afternoon"], "ocean", "semi_protected", "high", "medium", "medium"),
    build_beach("Narrabeen Beach", "narrabeen-beach", "Narrabeen", "Northern Beaches", -33.7139, 151.3034, 79, 20, ["long", "surf", "local"], ["surfing", "long walks", "space"], ["strong rips"], ["toilets", "showers", "lifeguards"], ["bus", "parking"], "restricted", "easy", "medium", ["early_morning"], "ocean", "exposed", "medium", "high", "high"),
    build_beach("Warriewood Beach", "warriewood-beach", "Warriewood", "Northern Beaches", -33.6958, 151.3095, 80, 17, ["compact", "local", "surf"], ["surfing", "quiet swims", "families"], ["large swell"], ["toilets", "showers", "lifeguards"], ["bus", "parking"], "restricted", "moderate", "medium", ["morning"], "ocean", "semi_protected", "medium", "high", "medium"),
    build_beach("Mona Vale Beach", "mona-vale-beach", "Mona Vale", "Northern Beaches", -33.6771, 151.3144, 81, 14, ["ocean pool", "surf", "family"], ["ocean pool", "surfing", "families"], ["strong rips"], ["toilets", "showers", "lifeguards", "ocean_pool"], ["bus", "parking"], "restricted", "easy", "medium", ["morning", "weekday"], "ocean", "exposed", "high", "high", "high"),
    build_beach("Bungan Beach", "bungan-beach", "Newport", "Northern Beaches", -33.6674, 151.3214, 82, 12, ["secluded", "surf", "dramatic"], ["quiet walks", "surfing", "space"], ["difficult access", "large swell"], ["limited_facilities"], ["street_parking", "stairs"], "restricted", "difficult", "low", ["morning"], "ocean", "exposed", "medium", "high", "medium"),
    build_beach("Newport Beach", "newport-beach", "Newport", "Northern Beaches", -33.6569, 151.3217, 82, 10, ["surf", "village", "family"], ["surfing", "cafes", "families"], ["strong rips"], ["toilets", "showers", "lifeguards", "cafes"], ["bus", "parking"], "restricted", "easy", "medium", ["morning", "late_afternoon"], "ocean", "exposed", "medium", "high", "high"),
    build_beach("Bilgola Beach", "bilgola-beach", "Bilgola Beach", "Northern Beaches", -33.6456, 151.3280, 83, 8, ["village", "ocean pool", "surf"], ["ocean pool", "surfing", "quiet mornings"], ["limited parking"], ["toilets", "showers", "lifeguards", "ocean_pool"], ["bus", "parking"], "restricted", "moderate", "medium", ["morning"], "ocean", "semi_protected", "high", "high", "medium"),
    build_beach("Avalon Beach", "avalon-beach", "Avalon Beach", "Northern Beaches", -33.6374, 151.3317, 84, 7, ["village", "surf", "relaxed"], ["surfing", "cafes", "local days"], ["large swell"], ["toilets", "showers", "lifeguards", "cafes"], ["bus", "parking"], "restricted", "easy", "medium", ["morning", "sunset"], "ocean", "exposed", "medium", "high", "high"),
    build_beach("Whale Beach", "whale-beach", "Whale Beach", "Northern Beaches", -33.6125, 151.3318, 84, 4, ["scenic", "surf", "quiet"], ["surfing", "romantic walks", "space"], ["strong rips", "limited public transport"], ["toilets", "showers", "lifeguards"], ["parking"], "restricted", "moderate", "medium", ["morning"], "ocean", "exposed", "medium", "high", "medium"),
    build_beach("Palm Beach", "palm-beach", "Palm Beach", "Northern Beaches", -33.5967, 151.3239, 82, 2, ["destination", "scenic", "surf"], ["day trips", "surfing", "lighthouse walks"], ["holiday crowds", "strong wind"], ["toilets", "showers", "lifeguards", "cafes"], ["bus", "parking", "walking_track"], "restricted", "moderate", "high", ["early_morning", "sunset"], "ocean", "exposed", "medium", "high", "high"),
    build_beach("Cronulla Beach", "cronulla-beach", "Cronulla", "Sutherland Shire", -34.0577, 151.1547, 47, 91, ["classic", "surf", "train_access"], ["surfing", "cafes", "easy transport"], ["busy weekends"], ["toilets", "showers", "lifeguards", "cafes"], ["train", "parking"], "restricted", "easy", "high", ["morning", "weekday"], "ocean", "semi_protected", "high", "high", "high"),
    build_beach("North Cronulla Beach", "north-cronulla-beach", "Cronulla", "Sutherland Shire", -34.0535, 151.1563, 47, 90, ["social", "surf", "cafes"], ["surfing", "groups", "cafes"], ["crowded days"], ["toilets", "showers", "lifeguards", "cafes"], ["train", "parking"], "restricted", "easy", "high", ["morning", "evening"], "ocean", "semi_protected", "high", "high", "high"),
    build_beach("Elouera Beach", "elouera-beach", "Cronulla", "Sutherland Shire", -34.0458, 151.1586, 48, 88, ["surf", "local", "wide"], ["surfing", "long walks", "space"], ["strong rips"], ["toilets", "showers", "lifeguards"], ["train", "parking"], "restricted", "easy", "medium", ["morning"], "ocean", "exposed", "medium", "high", "high"),
    build_beach("Wanda Beach", "wanda-beach", "Cronulla", "Sutherland Shire", -34.0388, 151.1609, 48, 86, ["wild", "surf", "space"], ["surfing", "long walks", "quiet"], ["strong rips", "wind"], ["toilets", "showers", "lifeguards"], ["parking"], "restricted", "easy", "medium", ["early_morning"], "ocean", "exposed", "medium", "high", "high"),
    build_beach("Shelly Beach Cronulla", "shelly-beach-cronulla", "Cronulla", "Sutherland Shire", -34.0673, 151.1571, 48, 93, ["family", "rock_pool", "calm"], ["kids", "rock pool", "picnics"], ["limited sand at high tide"], ["toilets", "showers", "park", "rock_pool"], ["train", "parking", "walking_track"], "restricted", "easy", "medium", ["morning", "afternoon"], "ocean", "protected", "high", "low", "high"),
    build_beach("Gunnamatta Bay Beach", "gunnamatta-bay-beach", "Cronulla", "Sutherland Shire", -34.0561, 151.1485, 45, 90, ["bay", "calm", "family"], ["calm swims", "kids", "picnics"], ["after heavy rain"], ["toilets", "park", "playground"], ["train", "parking"], "restricted", "easy", "medium", ["mid_morning"], "bay", "protected", "high", "low", "medium"),
    build_beach("Congwong Beach", "congwong-beach", "La Perouse", "Eastern Suburbs", -33.9899, 151.2339, 64, 78, ["calm", "national_park", "family"], ["calm swims", "picnics", "low key days"], ["holiday crowds"], ["toilets", "showers", "parking"], ["bus", "parking"], "restricted", "easy", "medium", ["morning"], "bay", "protected", "high", "low", "medium"),
    build_beach("Little Congwong Beach", "little-congwong-beach", "La Perouse", "Eastern Suburbs", -33.9918, 151.2370, 65, 79, ["secluded", "calm", "walk"], ["quiet swims", "short walks"], ["limited facilities"], ["nearby_toilets"], ["bus", "walking_track"], "restricted", "moderate", "low", ["weekday", "morning"], "bay", "protected", "medium", "low", "medium"),
    build_beach("Frenchmans Beach", "frenchmans-beach", "La Perouse", "Eastern Suburbs", -33.9870, 151.2322, 63, 77, ["calm", "family", "heritage"], ["families", "picnics", "calm water"], ["strong wind"], ["toilets", "parking", "cafes"], ["bus", "parking"], "restricted", "easy", "medium", ["morning", "afternoon"], "bay", "protected", "medium", "low", "medium"),
    build_beach("Yarra Bay Beach", "yarra-bay-beach", "Phillip Bay", "Eastern Suburbs", -33.9781, 151.2191, 60, 75, ["calm", "local", "bay"], ["calm walks", "low key swims", "families"], ["after heavy rain"], ["toilets", "parking", "park"], ["bus", "parking"], "restricted", "easy", "low", ["morning", "sunset"], "bay", "protected", "medium", "low", "medium"),
    build_beach("Silver Beach", "silver-beach", "Kurnell", "Sutherland Shire", -34.0102, 151.2053, 57, 81, ["bay", "dog_friendly", "calm"], ["dogs", "calm walks", "families"], ["strong wind", "after heavy rain"], ["toilets", "parking", "park"], ["bus", "parking"], "off_leash_zones", "easy", "low", ["morning", "late_afternoon"], "bay", "protected", "medium", "low", "high"),
    build_beach("Lady Robinsons Beach", "lady-robinsons-beach", "Brighton-Le-Sands", "St George", -33.9611, 151.1566, 47, 72, ["bay", "long_walk", "urban"], ["walking", "families", "planespotting"], ["after heavy rain"], ["toilets", "showers", "cafes", "park"], ["bus", "parking"], "restricted", "easy", "medium", ["morning", "sunset"], "bay", "protected", "medium", "low", "high"),
    build_beach("Brighton-Le-Sands Beach", "brighton-le-sands-beach", "Brighton-Le-Sands", "St George", -33.9600, 151.1545, 46, 72, ["urban", "cafes", "bay"], ["cafes", "group hangs", "walks"], ["after heavy rain", "peak traffic"], ["toilets", "showers", "cafes", "park"], ["bus", "parking"], "restricted", "easy", "high", ["evening", "weekday"], "bay", "protected", "medium", "low", "high"),
    build_beach("Dolls Point Beach", "dolls-point-beach", "Dolls Point", "St George", -33.9976, 151.1452, 44, 80, ["bay", "calm", "walks"], ["families", "walks", "picnics"], ["after heavy rain"], ["toilets", "park", "parking"], ["bus", "parking"], "restricted", "easy", "medium", ["morning", "sunset"], "bay", "protected", "medium", "low", "high"),
]


async def seed_beaches():
    db = get_database()
    if db is None:
        raise RuntimeError("MONGODB_URI is not configured")

    await db.beaches.create_index([("slug", ASCENDING)], unique=True)
    now = datetime.now(timezone.utc)

    for beach in BEACHES:
        image_fields = WIKIMEDIA_BEACH_IMAGES.get(beach["slug"], {})
        document = {
            **beach,
            **image_fields,
            "created_at": now,
            "updated_at": now,
        }
        await db.beaches.update_one(
            {"slug": beach["slug"]},
            {"$set": document},
            upsert=True,
        )

    count = await db.beaches.count_documents({})
    print(f"Beach count: {count}")


if __name__ == "__main__":
    asyncio.run(seed_beaches())
