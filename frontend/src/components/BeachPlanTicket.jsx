import { APP_COPY } from "@/content/voice";

const FALLBACK_IMAGE_URL = "/landing-scroll.jpg";

export function validImageUrl(value) {
  if (!value) return false;
  if (typeof value !== "string") return false;
  if (!value.trim()) return false;
  return !value.includes("source-404");
}

function arrayFromConditions(conditions) {
  if (Array.isArray(conditions)) return conditions;
  if (!conditions) return APP_COPY.result.mockPlan.conditions;
  if (typeof conditions === "object") {
    const parts = [];

    if (conditions.temperature !== null && conditions.temperature !== undefined) {
      parts.push(`${conditions.temperature}°C`);
    }
    if (conditions.wind_kmh !== null && conditions.wind_kmh !== undefined) {
      parts.push(`${conditions.wind_kmh}km/h wind`);
    }
    if (conditions.wave_height_m !== null && conditions.wave_height_m !== undefined) {
      parts.push(`${conditions.wave_height_m}m swell`);
    }
    if (conditions.uv_index !== null && conditions.uv_index !== undefined) {
      parts.push(`UV ${conditions.uv_index}`);
    }

    return parts.length ? parts : APP_COPY.result.mockPlan.conditions;
  }

  return String(conditions)
    .split(/\s*·\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalisePlanForTicket(rawPlan, generationInput = {}) {
  if (!rawPlan) return APP_COPY.result.mockPlan;
  if (rawPlan.beachName) return rawPlan;

  const plan = rawPlan.plan || {};
  const moodReading = rawPlan.mood_reading || {};
  const moodTags = [
    moodReading.desired_feeling,
    moodReading.social_level,
    moodReading.pace,
  ].filter(Boolean);

  return {
    id: rawPlan._id || rawPlan.id,
    slug: rawPlan.selected_beach_slug || rawPlan.slug,
    eyebrow: "YOUR BEACH PLAN · GENERATED NOW",
    beachName: rawPlan.selected_beach_name || rawPlan.beach_name || APP_COPY.result.mockPlan.beachName,
    moodPhrase: rawPlan.mood_phrase || generationInput.mood_phrase || moodReading.summary || "",
    moodTags,
    bestTime: plan.when || "",
    where: plan.where || "",
    when: plan.when || "",
    why: plan.why || "",
    conditions: plan.conditions_summary || rawPlan.conditions || "",
    bring: Array.isArray(plan.bring) ? plan.bring : [],
    verdict: plan.gentle_warning || "— worth a look, conditions permitting.",
    imageUrl: validImageUrl(rawPlan.image_url) ? rawPlan.image_url : FALLBACK_IMAGE_URL,
    generationInput,
    raw: rawPlan,
  };
}

export default function BeachPlanTicket({ plan, generationInput }) {
  const ticket = {
    ...APP_COPY.result.mockPlan,
    ...normalisePlanForTicket(plan, generationInput),
  };
  const copy = APP_COPY.result.ticket;
  const conditions = arrayFromConditions(ticket.conditions);

  return (
    <article className="beach-plan-ticket" aria-label="Beach plan ticket">
      <span className="ticket-notch ticket-notch-left" aria-hidden="true" />
      <span className="ticket-notch ticket-notch-right" aria-hidden="true" />

      <header className="ticket-rich-header">
        <p className="ticket-eyebrow">{ticket.eyebrow}</p>
        <h1>{ticket.beachName}</h1>
        <p className="ticket-mood-quote">"{ticket.moodPhrase}"</p>
      </header>

      <img
        className="ticket-image"
        src={validImageUrl(ticket.imageUrl) ? ticket.imageUrl : FALLBACK_IMAGE_URL}
        alt={copy.imageAlt}
        onError={(event) => {
          if (event.currentTarget.src.endsWith(FALLBACK_IMAGE_URL)) return;
          event.currentTarget.src = FALLBACK_IMAGE_URL;
        }}
      />

      <section className="ticket-condition-grid" aria-label="Beach conditions">
        {conditions.map((condition) => (
          <span key={condition}>{condition}</span>
        ))}
      </section>

      <div className="ticket-divider" aria-hidden="true" />

      <section className="ticket-body">
        <div className="ticket-body-section ticket-section-where">
          <h2>Where</h2>
          <p>{ticket.where}</p>
        </div>

        <div className="ticket-body-section ticket-section-when">
          <h2>When</h2>
          <p>{ticket.when}</p>
        </div>

        <div className="ticket-body-section ticket-section-bring">
          <h2>{copy.bringLabel}</h2>
          <ul className="ticket-bring-list">
            {ticket.bring.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="ticket-body-section ticket-section-why">
          <h2>Why this beach today</h2>
          <p>{ticket.why}</p>
        </div>

        <div className="ticket-body-section ticket-section-verdict">
          <h2>Verdict</h2>
          <p>{ticket.verdict}</p>
        </div>
      </section>

      <footer className="ticket-actions">
        <button type="button">SHARE THIS PLAN ↗</button>
        <button type="button">← different vibe</button>
      </footer>
    </article>
  );
}
