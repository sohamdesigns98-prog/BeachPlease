import { VIBES } from "@/content/voice";
import { getMockPlanForMood } from "@/utils/voiceHelpers";

const DEFAULT_MOOD_PHRASE = "I want a beach day that makes sense today.";

export function inferActivity(text = "") {
  const mood = text.toLowerCase();
  if (mood.includes("surf") || mood.includes("wave") || mood.includes("swell")) return "surf";
  if (mood.includes("swim") || mood.includes("float")) return "swim";
  if (mood.includes("snorkel")) return "snorkel";
  if (mood.includes("walk") || mood.includes("sunset")) return "walk";
  return "relax";
}

export function inferCompanion(text = "") {
  const mood = text.toLowerCase();
  if (mood.includes("dog") || mood.includes("pup")) return "dog";
  if (mood.includes("family") || mood.includes("kids")) return "family";
  if (mood.includes("date") || mood.includes("partner") || mood.includes("romantic")) return "partner";
  if (mood.includes("mates") || mood.includes("friends")) return "mates";
  return "solo";
}

export function buildPlanPayloadFromCanvas({
  moodPhrase = "",
  activityHint = "",
  companionHint = "",
  selectedBeach = null,
} = {}) {
  const trimmedMood = moodPhrase.trim();
  const resolvedMood = trimmedMood
    || (selectedBeach?.name ? `I want a beach day near ${selectedBeach.name}.` : "")
    || VIBES[0]?.phrase
    || DEFAULT_MOOD_PHRASE;

  const payload = {
    mood_phrase: resolvedMood,
    activity: activityHint || inferActivity(resolvedMood),
    companion: companionHint || inferCompanion(resolvedMood),
    selected_mood: selectedBeach?.vibe || undefined,
    companion_context: companionHint || inferCompanion(resolvedMood),
    experience_tags: [
      selectedBeach?.vibe,
      activityHint || inferActivity(resolvedMood),
      companionHint || inferCompanion(resolvedMood),
    ].filter(Boolean),
  };

  if (selectedBeach?.region_key) {
    payload.region = selectedBeach.region_key;
  }

  if (selectedBeach?.slug) {
    payload.preferred_beach_slug = selectedBeach.slug;
  }

  return payload;
}

export function buildGuestPlanFromCanvas({
  payload,
  selectedBeach,
  fallbackBeach,
  requiresAuthToSave = true,
}) {
  const beach = selectedBeach || fallbackBeach;
  if (!beach) {
    return {
      ...getMockPlanForMood(payload.mood_phrase),
      mood_phrase: payload.mood_phrase,
      ...payload,
      requiresAuthToSave,
    };
  }

  return {
    selected_beach_name: beach.name,
    selected_beach_slug: beach.slug,
    image_url: beach.imageUrl,
    mood_phrase: payload.mood_phrase,
    region: payload.region,
    activity: payload.activity,
    companion: payload.companion,
    preferred_beach_slug: payload.preferred_beach_slug,
    conditions: {
      temperature: beach.temp,
      wind_kmh: beach.windKmh,
      wave_height_m: beach.waves,
      uv_index: beach.uv,
    },
    mood_reading: {
      energy: beach.vibe || "coastal",
      social_level: payload.companion || "solo",
      desired_feeling: payload.activity || "relax",
      pace: beach.crowd?.label || "steady",
      summary: payload.mood_phrase,
    },
    plan: {
      where: `${beach.name}, ${beach.region || "Sydney"}.`,
      when: beach.bestTime || "morning or late arvo, before the day gets silly",
      why: `${beach.name} lines up with the vibe: ${[beach.vibe, payload.activity, payload.companion].filter(Boolean).join(", ")}.`,
      bring: Array.isArray(beach.whatToBring) && beach.whatToBring.length
        ? beach.whatToBring
        : ["water", "towel", "spf 50"],
      conditions_summary: [
        beach.temp !== null && beach.temp !== undefined ? `${beach.temp}°C` : null,
        beach.windKmh !== null && beach.windKmh !== undefined ? `${beach.windKmh}km/h wind` : null,
        beach.waves !== null && beach.waves !== undefined ? `${beach.waves}m swell` : null,
        beach.uv !== null && beach.uv !== undefined ? `UV ${beach.uv}` : null,
      ].filter(Boolean).join(" · "),
      gentle_warning: (beach.uv ?? 0) >= 8
        ? "UV is high. Wear SPF 50 and avoid the middle of the day."
        : "Looks workable. Still check flags and conditions when you arrive.",
    },
    rejected_beaches: [],
    confidence: 0.72,
    recommendation_type: "beach_plan",
    requiresAuthToSave,
  };
}
