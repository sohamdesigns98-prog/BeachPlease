import asyncio
from datetime import datetime, timezone

from app.database import get_database
from app.seed.beach_images import WIKIMEDIA_BEACH_IMAGES


async def seed_beach_images():
    db = get_database()
    if db is None:
        raise RuntimeError("MONGODB_URI is not configured")

    now = datetime.now(timezone.utc)
    matched = 0
    modified = 0

    for slug, image_fields in WIKIMEDIA_BEACH_IMAGES.items():
        result = await db.beaches.update_one(
            {"slug": slug},
            {
                "$set": {
                    **image_fields,
                    "updated_at": now,
                }
            },
        )
        matched += result.matched_count
        modified += result.modified_count

    print(
        "Beach image seed complete: "
        f"{matched} matched, {modified} modified, {len(WIKIMEDIA_BEACH_IMAGES)} mapped"
    )


if __name__ == "__main__":
    asyncio.run(seed_beach_images())
