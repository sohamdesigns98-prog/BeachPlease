from typing import Optional

from pydantic import BaseModel, Field, field_validator


def dedupe_slugs(slugs: list[str]) -> list[str]:
    seen = set()
    deduped = []
    for slug in slugs:
        normalized = slug.strip()
        if not normalized or normalized in seen:
            continue
        seen.add(normalized)
        deduped.append(normalized)
    return deduped


class MoodClusterCreateRequest(BaseModel):
    name: str = Field(min_length=1)
    description: str = ""
    mood_phrase: str = ""
    color: str = "#91C059"
    beach_slugs: list[str] = Field(default_factory=list)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Cluster name is required")
        return stripped

    @field_validator("description", "mood_phrase")
    @classmethod
    def strip_optional_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("color")
    @classmethod
    def validate_color(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped.startswith("#") or len(stripped) not in {4, 7}:
            return "#91C059"
        return stripped

    @field_validator("beach_slugs")
    @classmethod
    def validate_beach_slugs(cls, value: list[str]) -> list[str]:
        return dedupe_slugs(value)


class MoodClusterUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    mood_phrase: Optional[str] = None
    color: Optional[str] = None
    beach_slugs: Optional[list[str]] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value

        stripped = value.strip()
        if not stripped:
            raise ValueError("Cluster name is required")
        return stripped

    @field_validator("description", "mood_phrase")
    @classmethod
    def strip_optional_text(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        return value.strip()

    @field_validator("color")
    @classmethod
    def validate_color(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        stripped = value.strip()
        if not stripped.startswith("#") or len(stripped) not in {4, 7}:
            return "#91C059"
        return stripped

    @field_validator("beach_slugs")
    @classmethod
    def validate_beach_slugs(cls, value: Optional[list[str]]) -> Optional[list[str]]:
        if value is None:
            return value
        return dedupe_slugs(value)
