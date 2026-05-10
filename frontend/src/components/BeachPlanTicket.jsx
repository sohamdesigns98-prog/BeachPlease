import { useRef, useState } from "react";
import { toPng } from "html-to-image";

import { APP_COPY } from "@/content/voice";

const FALLBACK_IMAGE_URL = "/landing-scroll.jpg";
const PLAN_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=900&q=80",
];

function hashString(value = "") {
  return Array.from(String(value)).reduce((total, char) => total + char.charCodeAt(0), 0);
}

function fallbackImageForPlan(rawPlan = {}) {
  const key = rawPlan.selected_beach_slug || rawPlan.selected_beach_name || rawPlan.slug || "";
  return PLAN_FALLBACK_IMAGES[hashString(key) % PLAN_FALLBACK_IMAGES.length] || FALLBACK_IMAGE_URL;
}

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

function metricFromPlan(ticket, label, fallback = "n/a") {
  const rawConditions = ticket.raw?.conditions;
  if (label === "TEMP" && rawConditions?.temperature !== null && rawConditions?.temperature !== undefined) {
    return `${rawConditions.temperature}°C`;
  }
  if (label === "WAVES" && rawConditions?.wave_height_m !== null && rawConditions?.wave_height_m !== undefined) {
    return `${rawConditions.wave_height_m}m`;
  }
  if (label === "CROWD" && ticket.raw?.candidate_snapshot?.[0]?.crowd?.label) {
    return ticket.raw.candidate_snapshot[0].crowd.label;
  }

  const conditions = arrayFromConditions(ticket.conditions);
  if (label === "TEMP") return conditions.find((item) => item.includes("°")) || fallback;
  if (label === "WAVES") return conditions.find((item) => item.toLowerCase().includes("m")) || fallback;
  if (label === "CROWD") return ticket.raw?.crowd?.label || "moderate";
  return fallback;
}

function formatPostcardDate(rawPlan) {
  const source = rawPlan?.created_at || rawPlan?.updated_at;
  const date = source ? new Date(source) : new Date();
  return date.toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function postcardLine(ticket) {
  if (ticket.verdict) return ticket.verdict.replace(/^—\s*/, "");
  if (ticket.why) return ticket.why;
  return "salt-stung and full of it - this is what moving feels like.";
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
    imageUrl: validImageUrl(rawPlan.image_url) ? rawPlan.image_url : fallbackImageForPlan(rawPlan),
    region: rawPlan.region || generationInput.region || "sydney",
    activity: rawPlan.activity || generationInput.activity || moodReading.energy || "active",
    accent: rawPlan.accent || "#91C059",
    generationInput,
    raw: rawPlan,
  };
}

export default function BeachPlanTicket({ plan, generationInput }) {
  const postcardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const ticket = {
    ...APP_COPY.result.mockPlan,
    ...normalisePlanForTicket(plan, generationInput),
  };
  const copy = APP_COPY.result.ticket;
  const postcardDate = formatPostcardDate(ticket.raw);
  const metrics = [
    ["TEMP", metricFromPlan(ticket, "TEMP")],
    ["WAVES", metricFromPlan(ticket, "WAVES")],
    ["CROWD", metricFromPlan(ticket, "CROWD")],
  ];

  async function downloadPostcard() {
    if (!postcardRef.current || isDownloading) return;

    setIsDownloading(true);
    try {
      const dataUrl = await toPng(postcardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#F8F6EF",
        filter: (node) => !node?.classList?.contains("ticket-actions"),
      });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `${ticket.slug || ticket.beachName || "beachplease"}-postcard.png`
        .toLowerCase()
        .replace(/[^a-z0-9.-]+/g, "-");
      link.click();
    } finally {
      setIsDownloading(false);
    }
  }

  return (
    <article ref={postcardRef} className="beach-plan-ticket postcard-card" aria-label="Generated beach postcard">
      <img
        className="postcard-card__image"
        src={validImageUrl(ticket.imageUrl) ? ticket.imageUrl : FALLBACK_IMAGE_URL}
        alt={copy.imageAlt}
        onError={(event) => {
          if (event.currentTarget.src.endsWith(FALLBACK_IMAGE_URL)) return;
          event.currentTarget.src = FALLBACK_IMAGE_URL;
        }}
      />

      <div className="postcard-card__tear" aria-hidden="true" />

      <section className="postcard-card__content">
        <div className="postcard-card__title-row">
          <div>
            <p className="postcard-card__eyebrow">BeachPlease</p>
            <h1>{ticket.beachName}</h1>
            <p className="postcard-card__meta">{ticket.activity || "active"} · sydney</p>
          </div>

          <div className="postcard-card__stamp" aria-label="NSW stamp">
            <span style={{ "--stamp-accent": ticket.accent }} />
            <small>NSW</small>
          </div>
        </div>

        <div className="postcard-card__rule" aria-hidden="true" />

        <p className="postcard-card__quote">{ticket.moodPhrase ? `"${ticket.moodPhrase}"` : ticket.where}</p>
        <p className="postcard-card__poem">{postcardLine(ticket)}</p>

        <dl className="postcard-card__conditions">
          {metrics.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>

        <div className="postcard-card__footer">
          <div>
            <span>posted from</span>
            <p>{ticket.beachName.toLowerCase()}, sydney</p>
          </div>
          <div>
            <span>date</span>
            <p>{postcardDate}</p>
          </div>
        </div>
      </section>

      <footer className="ticket-actions">
        <button type="button" onClick={downloadPostcard}>
          {isDownloading ? "making png..." : "download postcard"}
        </button>
        <button type="button">share</button>
      </footer>
    </article>
  );
}
