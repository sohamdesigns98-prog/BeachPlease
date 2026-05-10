export function listItems(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [String(value)];
}

export function formatConditions(conditions) {
  if (!conditions || typeof conditions !== "object") return "";

  const parts = [];
  if (conditions.temperature !== null && conditions.temperature !== undefined) {
    parts.push(`${conditions.temperature}°C`);
  }
  if (conditions.wind_kmh !== null && conditions.wind_kmh !== undefined) {
    parts.push(`${conditions.wind_kmh}km/h wind`);
  }
  if (conditions.wave_height_m !== null && conditions.wave_height_m !== undefined) {
    parts.push(`${conditions.wave_height_m}m waves`);
  }
  if (conditions.uv_index !== null && conditions.uv_index !== undefined) {
    parts.push(`UV ${conditions.uv_index}`);
  }

  return parts.join(" / ");
}

export function getPlanBody(plan = {}) {
  const nestedPlan = plan.plan?.plan && typeof plan.plan.plan === "object"
    ? plan.plan.plan
    : null;
  const body = nestedPlan || (plan.plan && typeof plan.plan === "object" ? plan.plan : {});
  const beachName = plan.selected_beach_name || plan.beachName || plan.beach_name || "";
  const moodSummary = plan.mood_reading?.summary || "";
  const conditionSummary = body.conditions_summary || plan.conditions_summary || formatConditions(plan.conditions);

  return {
    where: body.where || plan.where || (beachName ? `Head to ${beachName}.` : ""),
    when: body.when || plan.when || plan.bestTime || "",
    why: body.why || plan.why || moodSummary,
    conditions_summary: conditionSummary,
    gentle_warning: body.gentle_warning || plan.gentle_warning || plan.verdict || "",
    bring: listItems(body.bring || plan.bring),
  };
}

export function hasUsefulPlanBody(body = {}) {
  return Boolean(
    body.where
    || body.when
    || body.why
    || body.conditions_summary
    || body.gentle_warning
    || listItems(body.bring).length,
  );
}

export function planText(value, fallback = "Not included in this saved snapshot yet.") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}
