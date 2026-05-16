from typing import Any, Optional

from pydantic import BaseModel, Field, field_validator


class BeachWriteRequest(BaseModel):
    name: str = Field(min_length=1)
    slug: str = Field(min_length=1)
    suburb: str = ""
    region: str = ""
    lat: Optional[float] = None
    lng: Optional[float] = None
    image_url: str = ""
    image_source: str = ""
    image_license: str = ""
    water_type: str = ""
    exposure: str = ""
    accessibility: str = ""
    crowd_level_default: str = ""
    surf_suitability: str = ""
    swim_suitability: str = ""
    walk_suitability: str = ""
    dog_access: str = ""
    vibe_tags: list[str] = Field(default_factory=list)
    best_for: list[str] = Field(default_factory=list)
    facilities: list[str] = Field(default_factory=list)
    access_tags: list[str] = Field(default_factory=list)
    ideal_times: list[str] = Field(default_factory=list)
    avoid_when: list[str] = Field(default_factory=list)
    map_x: Optional[float] = None
    map_y: Optional[float] = None

    @field_validator("name", "slug")
    @classmethod
    def strip_required(cls, value: str) -> str:
        stripped = value.strip()
        if not stripped:
            raise ValueError("Required beach fields cannot be blank")
        return stripped

    @field_validator(
        "suburb",
        "region",
        "image_url",
        "image_source",
        "image_license",
        "water_type",
        "exposure",
        "accessibility",
        "crowd_level_default",
        "surf_suitability",
        "swim_suitability",
        "walk_suitability",
        "dog_access",
    )
    @classmethod
    def strip_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("vibe_tags", "best_for", "facilities", "access_tags", "ideal_times", "avoid_when")
    @classmethod
    def clean_list(cls, value: list[str]) -> list[str]:
        seen = set()
        cleaned = []
        for item in value:
            normalized = str(item).strip()
            if normalized and normalized not in seen:
                seen.add(normalized)
                cleaned.append(normalized)
        return cleaned

    def to_document(self) -> dict[str, Any]:
        return self.model_dump()
