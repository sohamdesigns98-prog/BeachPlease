from datetime import datetime, timezone
from typing import Any


async def log_activity(
    db,
    *,
    action: str,
    entity_type: str,
    actor: dict[str, Any] | None = None,
    entity_id: str | None = None,
    label: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    if db is None:
        return

    await db.user_activities.insert_one(
        {
            "user_id": actor.get("id") if actor else None,
            "email": actor.get("email") if actor else None,
            "actor_role": actor.get("role", "user") if actor else "anonymous",
            "action": action,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "label": label or "",
            "metadata": metadata or {},
            "created_at": datetime.now(timezone.utc),
        }
    )
