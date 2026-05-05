import json
from typing import Any

import httpx

from app.config import settings

GEMINI_MODEL = "gemini-2.0-flash"
GEMINI_URL = (
    f"https://generativelanguage.googleapis.com/v1beta/models/"
    f"{GEMINI_MODEL}:generateContent"
)
REQUEST_TIMEOUT = 30.0


class GeminiServiceError(Exception):
    pass


def compact_candidate_beach(beach: dict[str, Any]) -> dict[str, Any]:
    return {
        "name": beach.get("name"),
        "slug": beach.get("slug"),
        "suburb": beach.get("suburb"),
        "region": beach.get("region"),
        "vibe_tags": beach.get("vibe_tags", []),
        "best_for": beach.get("best_for", []),
        "avoid_when": beach.get("avoid_when", []),
        "facilities": beach.get("facilities", []),
        "access_tags": beach.get("access_tags", []),
        "dog_access": beach.get("dog_access"),
        "accessibility": beach.get("accessibility"),
        "crowd_level_default": beach.get("crowd_level_default"),
        "ideal_times": beach.get("ideal_times", []),
        "water_type": beach.get("water_type"),
        "exposure": beach.get("exposure"),
        "swim_suitability": beach.get("swim_suitability"),
        "surf_suitability": beach.get("surf_suitability"),
        "walk_suitability": beach.get("walk_suitability"),
        "score": beach.get("score"),
        "score_breakdown": beach.get("score_breakdown", {}),
        "matched_reasons": beach.get("matched_reasons", []),
        "penalties": beach.get("penalties", []),
        "conditions": beach.get("conditions", {}),
    }


def build_prompt(
    mood_phrase: str,
    user_profile: dict,
    candidate_beaches: list[dict],
) -> str:
    candidates = [compact_candidate_beach(beach) for beach in candidate_beaches]
    profile = {
        "suburb": user_profile.get("suburb"),
        "companions": user_profile.get("companions"),
        "travel_mode": user_profile.get("travel_mode"),
    }

    return f"""
You are BeachPlease, a Sydney beach curator.

Recommend exactly one beach using only the candidate beaches provided below.
Consider the user's mood, profile, beach data, deterministic scores, and live conditions.
Do not invent weather data. Do not recommend a beach outside the candidate list.
Return only valid JSON. Do not use markdown. Do not wrap the JSON in code fences.

VOICE:
You are BeachPlease, a Sydney beach curator.
Sound like a witty Sydney local who knows the beaches properly.
Be warm, practical, specific, and lightly funny.
Use occasional Australian phrasing naturally, such as:
- proper
- arvo
- squiz
- yeah nah
- worth the trip
- full send
Do not overdo slang.
Do not sound like a tourism brochure.
Do not sound like a chatbot.
Do not make safety warnings jokey.
Mild humour is welcome, but the plan must remain useful.

WRITING RULES:
1. Specific over generic.
2. Opinionated but not rude.
3. Practical first, funny second.
4. Short sentences.
5. Reference actual conditions where useful.
6. If a beach is a bad fit, say so clearly.
7. Keep safety warnings clear and serious.
8. Avoid saying "hidden gem".
9. Avoid generic phrases like "stunning coastline", "crystal-clear waters", or "perfect destination".

Apply this voice only inside:
- mood_reading.summary
- selected_beach.reason
- plan.where
- plan.when
- plan.why
- plan.conditions_summary
- plan.gentle_warning
- rejected_beaches reasons

The JSON must match this exact shape:
{{
  "mood_reading": {{
    "energy": "",
    "social_level": "",
    "desired_feeling": "",
    "pace": "",
    "summary": ""
  }},
  "selected_beach": {{
    "name": "",
    "slug": "",
    "reason": ""
  }},
  "plan": {{
    "where": "",
    "when": "",
    "why": "",
    "bring": [],
    "conditions_summary": "",
    "gentle_warning": ""
  }},
  "rejected_beaches": [
    {{
      "name": "",
      "reason": ""
    }}
  ],
  "confidence": 0,
  "recommendation_type": "beach_plan"
}}

Rules:
- selected_beach.slug must be one of: {[beach.get("slug") for beach in candidates]}
- confidence must be a number from 0 to 100.
- rejected_beaches should mention the strongest alternatives from the candidate list.
- Use a concise Sydney-local voice.

Mood phrase:
{mood_phrase}

User profile:
{json.dumps(profile, ensure_ascii=False)}

Candidate beaches:
{json.dumps(candidates, ensure_ascii=False)}
""".strip()


def strip_markdown_fences(text: str) -> str:
    content = text.strip()
    if content.startswith("```"):
        lines = content.splitlines()
        if lines:
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        content = "\n".join(lines).strip()

    if content.lower().startswith("json\n"):
        content = content[5:].strip()

    return content


def parse_json_response(text: str) -> dict:
    content = strip_markdown_fences(text)
    try:
        parsed = json.loads(content)
    except json.JSONDecodeError as error:
        raise GeminiServiceError(
            f"Gemini returned invalid JSON: {error.msg}"
        ) from error

    if not isinstance(parsed, dict):
        raise GeminiServiceError("Gemini JSON response must be an object")

    return parsed


def validate_selected_beach(plan: dict, candidate_beaches: list[dict]) -> None:
    selected = plan.get("selected_beach")
    if not isinstance(selected, dict):
        raise GeminiServiceError("Gemini response is missing selected_beach")

    selected_slug = selected.get("slug")
    selected_name = selected.get("name")
    candidate_slugs = {beach.get("slug") for beach in candidate_beaches}
    candidate_names = {beach.get("name") for beach in candidate_beaches}

    if selected_slug not in candidate_slugs and selected_name not in candidate_names:
        raise GeminiServiceError(
            "Gemini selected a beach outside the candidate list"
        )


def extract_text_from_response(response_data: dict) -> str:
    candidates = response_data.get("candidates") or []
    if not candidates:
        raise GeminiServiceError("Gemini returned no candidates")

    parts = candidates[0].get("content", {}).get("parts", [])
    text_parts = [part.get("text", "") for part in parts if part.get("text")]
    text = "\n".join(text_parts).strip()
    if not text:
        raise GeminiServiceError("Gemini returned an empty response")

    return text


async def generate_beach_plan_with_gemini(
    mood_phrase: str,
    user_profile: dict,
    candidate_beaches: list[dict],
) -> dict:
    if not settings.gemini_api_key:
        raise GeminiServiceError("GEMINI_API_KEY is not configured")
    if not candidate_beaches:
        raise GeminiServiceError("At least one candidate beach is required")

    prompt = build_prompt(mood_phrase, user_profile, candidate_beaches)
    payload = {
        "contents": [
            {
                "role": "user",
                "parts": [{"text": prompt}],
            }
        ],
        "generationConfig": {
            "temperature": 0.4,
            "response_mime_type": "application/json",
        },
    }
    headers = {
        "Content-Type": "application/json",
        "x-goog-api-key": settings.gemini_api_key,
    }

    async with httpx.AsyncClient(timeout=REQUEST_TIMEOUT) as client:
        response = await client.post(GEMINI_URL, headers=headers, json=payload)

    try:
        response.raise_for_status()
    except httpx.HTTPStatusError as error:
        raise GeminiServiceError(
            f"Gemini request failed with status {response.status_code}"
        ) from error

    text = extract_text_from_response(response.json())
    plan = parse_json_response(text)
    validate_selected_beach(plan, candidate_beaches)
    return plan
