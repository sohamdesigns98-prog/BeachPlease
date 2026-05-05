from typing import Optional

from pydantic import BaseModel, Field, field_validator


class PlanCreateRequest(BaseModel):
    mood_phrase: str = Field(min_length=1)
    selected_mood: Optional[str] = None
    companion_context: Optional[str] = None
    experience_tags: list[str] = Field(default_factory=list)

    @field_validator("mood_phrase")
    @classmethod
    def validate_mood_phrase(cls, value: str) -> str:
        mood_phrase = value.strip()
        if not mood_phrase:
            raise ValueError("Mood phrase must be non-empty")

        return mood_phrase


class PlanNotesUpdateRequest(BaseModel):
    user_notes: str = ""
