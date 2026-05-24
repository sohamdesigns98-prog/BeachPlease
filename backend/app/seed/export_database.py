import asyncio
import json
import re
from datetime import date, datetime
from pathlib import Path
from typing import Any

from bson import ObjectId

from app.database import get_database

EXPORT_COLLECTIONS = {
    "beaches": "beaches.export.json",
    "users": "users.export.json",
    "beach_plans": "plans.export.json",
    "mood_clusters": "clusters.export.json",
    "user_activities": "user_activities.export.json",
}

SENSITIVE_USER_FIELDS = {
    "password_hash",
    "google_sub",
    "google_id",
    "oauth_sub",
    "refresh_token",
    "access_token",
}

EMAIL_PATTERN = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")


def anonymize_email(document: dict[str, Any], field: str = "email") -> None:
    value = document.get(field)
    if not value:
        return

    source = document.get("_id") or document.get("user_id") or document.get("actor_user_id") or value
    suffix = str(source)[-8:].replace("@", "").replace(".", "")
    document[field] = f"user-{suffix}@example.com"


def redact_email_strings(value: Any) -> Any:
    if isinstance(value, str):
        return EMAIL_PATTERN.sub("[REDACTED_EMAIL]", value)
    if isinstance(value, list):
        return [redact_email_strings(item) for item in value]
    if isinstance(value, dict):
        return {key: redact_email_strings(item) for key, item in value.items()}
    return value


def to_json_safe(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, list):
        return [to_json_safe(item) for item in value]
    if isinstance(value, dict):
        return {key: to_json_safe(item) for key, item in value.items()}
    return value


def sanitize_document(collection_name: str, document: dict[str, Any]) -> dict[str, Any]:
    cleaned = to_json_safe(document)
    if collection_name == "users":
        for field in SENSITIVE_USER_FIELDS:
            if field in cleaned:
                cleaned[field] = "[REDACTED]"
        anonymize_email(cleaned)
    if collection_name == "user_activities":
        anonymize_email(cleaned, "email")
        anonymize_email(cleaned, "actor_email")
        cleaned = redact_email_strings(cleaned)
    return cleaned


async def export_collection(collection_name: str, output_path: Path) -> int:
    db = get_database()
    if db is None:
        raise RuntimeError("MONGODB_URI is not configured")

    documents = []
    cursor = db[collection_name].find({}).sort("_id", 1)
    async for document in cursor:
        documents.append(sanitize_document(collection_name, document))

    output_path.write_text(
        json.dumps(documents, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    return len(documents)


async def main() -> None:
    root = Path(__file__).resolve().parents[3]
    output_dir = root / "database"
    output_dir.mkdir(exist_ok=True)

    counts = {}
    for collection_name, filename in EXPORT_COLLECTIONS.items():
        counts[collection_name] = await export_collection(collection_name, output_dir / filename)

    print("Exported MongoDB collections:")
    for collection_name, count in counts.items():
        print(f"- {collection_name}: {count}")


if __name__ == "__main__":
    asyncio.run(main())
