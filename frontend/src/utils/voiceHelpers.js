import {
  ARC_MESSAGES,
  GENERATING_COPY,
  MOOD_RINGS,
  PLACEHOLDERS,
  RESULT_COPY,
  VIBES,
} from "@/content/voice";

export function formatDotList(items = []) {
  return items.join(" · ");
}

export function getWordCount(text = "") {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function textMatchesKeywords(text = "", keywords = []) {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
}

export function getMoodRing(text = "") {
  return MOOD_RINGS.find((ring) => textMatchesKeywords(text, ring.keywords)) || null;
}

export function getMoodRingLabel(text = "") {
  return getMoodRing(text)?.label || "";
}

export function getArcMessage(wordCount = 0) {
  return ARC_MESSAGES.reduce((current, [threshold, message]) => {
    return wordCount >= threshold ? message : current;
  }, ARC_MESSAGES[0]?.[1] || "");
}

export function getGeneratingCopy(text = "") {
  return (
    GENERATING_COPY.find((copy) => textMatchesKeywords(text, copy.keywords)) || {
      title: "checking the coast…",
      subtitle: "swell, wind, UV, crowds. the whole little circus.",
    }
  );
}

export function getRandomPlaceholder() {
  return PLACEHOLDERS[Math.floor(Math.random() * PLACEHOLDERS.length)] || "";
}

export function getVibeById(id) {
  return VIBES.find((vibe) => vibe.id === id) || null;
}

export function moodToPlanKey(mood = "") {
  const text = mood.toLowerCase();

  if (textMatchesKeywords(text, ["alone", "solo", "quiet", "disappear", "read", "book"])) {
    return "solo";
  }
  if (textMatchesKeywords(text, ["surf", "wave", "swell", "send", "big", "energy"])) {
    return "energy";
  }
  if (textMatchesKeywords(text, ["date", "partner", "person", "romantic", "couple"])) {
    return "couple";
  }
  if (textMatchesKeywords(text, ["dog", "pup", "doggo"])) return "dog";
  if (textMatchesKeywords(text, ["family", "kid", "kids", "child", "chaos"])) return "family";

  return "default";
}

export function getMockPlanForMood(mood = "") {
  const key = moodToPlanKey(mood);
  return RESULT_COPY.mockPlansByMood[key] || RESULT_COPY.mockPlan;
}
