function includesAny(values, needles) {
  const haystack = Array.isArray(values)
    ? values.join(" ").toLowerCase()
    : String(values || "").toLowerCase();

  return needles.some((needle) => haystack.includes(needle));
}

function numberOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function addReason(reasons, reason) {
  if (reason && !reasons.includes(reason)) {
    reasons.push(reason);
  }
}

function scoreActivity(beach, activity, reasons) {
  const conditions = beach.conditions || {};
  const waveHeight = numberOrNull(conditions.wave_height_m);
  const exposure = beach.exposure || "";
  let score = 0;

  if (activity === "swim") {
    if (waveHeight !== null && waveHeight <= 0.8) {
      score += 3;
      addReason(reasons, "low swell");
    }
    if (["protected", "semi_protected"].includes(exposure)) {
      score += 2;
      addReason(reasons, "sheltered water");
    }
    if (beach.swim_suitability === "high") score += 3;
  }

  if (activity === "surf") {
    if (beach.surf_suitability === "high") {
      score += 3;
      addReason(reasons, "surf-friendly");
    }
    if (waveHeight !== null && waveHeight >= 0.8) {
      score += 3;
      addReason(reasons, "waves are showing up");
    }
  }

  if (activity === "relax") {
    if (beach.crowd?.score <= 40) {
      score += 3;
      addReason(reasons, "quieter right now");
    }
    if (["protected", "semi_protected"].includes(exposure) || beach.status === "calm") {
      score += 2;
      addReason(reasons, "calmer setup");
    }
    if (includesAny(beach.vibe_tags, ["quiet", "calm", "private", "slow"])) score += 2;
  }

  if (activity === "snorkel") {
    if (exposure === "protected") {
      score += 3;
      addReason(reasons, "protected pocket");
    }
    if (includesAny([beach.vibe_tags, beach.best_for, beach.facilities], ["snorkel"])) score += 3;
    if (waveHeight !== null && waveHeight <= 0.7) score += 2;
  }

  if (activity === "walk") {
    if (beach.walk_suitability === "high") {
      score += 3;
      addReason(reasons, "good wander");
    }
    if (includesAny([beach.vibe_tags, beach.best_for, beach.access_tags], ["scenic", "coastal_walk", "walk"])) score += 2;
  }

  return score;
}

function scoreCompanion(beach, companion, reasons) {
  const exposure = beach.exposure || "";
  let score = 0;

  if (companion === "solo") {
    if (beach.crowd?.score <= 40) score += 2;
    if (includesAny(beach.vibe_tags, ["quiet", "private", "calm", "slow"])) {
      score += 3;
      addReason(reasons, "solo-friendly");
    }
  }

  if (companion === "partner") {
    if (includesAny(beach.vibe_tags, ["romantic", "scenic", "calm", "sunset"])) {
      score += 3;
      addReason(reasons, "good for two");
    }
  }

  if (companion === "family") {
    if (Array.isArray(beach.facilities) && beach.facilities.length > 0) score += 2;
    if (beach.accessibility === "easy") score += 2;
    if (["protected", "semi_protected"].includes(exposure)) {
      score += 2;
      addReason(reasons, "less drama");
    }
  }

  if (companion === "dog") {
    const dogAccess = String(beach.dog_access || "").toLowerCase();
    if (dogAccess && !dogAccess.includes("not_allowed")) {
      score += dogAccess.includes("allowed") || dogAccess.includes("dog") ? 3 : 1;
      addReason(reasons, "dog angle checked");
    }
  }

  if (companion === "mates") {
    if (includesAny([beach.vibe_tags, beach.best_for], ["social", "cafes", "swim"])) score += 2;
    if (includesAny(beach.access_tags, ["easy", "public_transport_easy"])) {
      score += 2;
      addReason(reasons, "easy to rally");
    }
  }

  return score;
}

function scoreConditionPenalties(beach, reasons) {
  const conditions = beach.conditions || {};
  const uvIndex = numberOrNull(conditions.uv_index);
  const windKmh = numberOrNull(conditions.wind_kmh);
  let penalty = 0;

  if (!conditions || Object.keys(conditions).length === 0 || beach.conditions_unavailable) {
    penalty += 0.8;
    addReason(reasons, "conditions a bit patchy");
  }

  if (uvIndex !== null && uvIndex >= 8) {
    penalty += 0.8;
  }

  if (windKmh !== null && windKmh >= 30 && beach.exposure === "exposed") {
    penalty += 1.5;
  }

  return penalty;
}

export function selectCandidateBeaches({
  conditions = [],
  region,
  activity,
  companion,
} = {}) {
  if (!region || !activity) return [];

  return conditions
    .filter((beach) => beach?.region_key === region)
    .map((beach) => {
      const reasons = [];
      const activityScore = scoreActivity(beach, activity, reasons);
      const companionScore = scoreCompanion(beach, companion, reasons);
      const penalty = scoreConditionPenalties(beach, reasons);
      const score = activityScore + companionScore - penalty;

      return {
        ...beach,
        candidateScore: score,
        candidateReason: reasons.slice(0, 2).join(" · "),
      };
    })
    .sort((first, second) => second.candidateScore - first.candidateScore)
    .slice(0, 3);
}
