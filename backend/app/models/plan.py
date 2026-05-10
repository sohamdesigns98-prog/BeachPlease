from typing import Any, Literal, Optional

from pydantic import BaseModel, Field, field_validator

Region = Literal["northern", "manly", "harbour", "eastern", "south", "cronulla"]
Activity = Literal["swim", "surf", "relax", "snorkel", "walk"]
Companion = Literal["solo", "partner", "family", "dog", "mates"]


class PlanCreateRequest(BaseModel):
    region: Optional[Region] = None
    activity: Optional[Activity] = None
    companion: Optional[Companion] = None
    mood_phrase: Optional[str] = None
    preferred_beach_slug: Optional[str] = None
    selected_mood: Optional[str] = None
    companion_context: Optional[str] = None
    experience_tags: list[str] = Field(default_factory=list)

    @field_validator("mood_phrase", "preferred_beach_slug")
    @classmethod
    def strip_optional_string(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None

        stripped = value.strip()
        return stripped or None

    def has_required_inputs(self) -> bool:
        has_mood = bool(self.mood_phrase)
        has_complete_funnel = bool(self.region and self.activity and self.companion)
        return has_mood or has_complete_funnel


class PlanNotesUpdateRequest(BaseModel):
    user_notes: str = ""


class PlanSnapshotSaveRequest(BaseModel):
    plan: dict[str, Any]
    generation_input: dict[str, Any] = Field(default_factory=dict)
