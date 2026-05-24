import { motion, useReducedMotion } from "framer-motion";

import { getPlanBody, listItems, planText } from "@/utils/planDisplay";

const LOCAL_JOURNAL_IMAGES = ["/landing-scroll.jpg", "/sydney-coast.svg", "/loading.png"];

function validImageUrl(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function firstValidImage(...values) {
  return values.find((value) => validImageUrl(value)) || LOCAL_JOURNAL_IMAGES[0];
}

function getBeachName(plan, planBody) {
  return plan?.selected_beach_name || plan?.beach_name || plan?.beachName || planBody.where || "your beach day";
}

function getPlanTitle(plan, generationInput) {
  const companion = String(plan?.companion || generationInput?.companion || "").toLowerCase();
  const activity = String(plan?.activity || generationInput?.activity || "").toLowerCase();
  const mood = String(plan?.mood_phrase || generationInput?.mood_phrase || "").toLowerCase();

  if (/date|partner|romantic/.test(companion + " " + mood)) return "A low-pressure date by the water.";
  if (/solo|alone|reset/.test(companion + " " + mood)) return "A quiet reset without making a production of it.";
  if (/family|kids/.test(companion + " " + mood)) return "An easy beach day with room to breathe.";
  if (/surf/.test(activity + " " + mood)) return "A proper water-first plan, conditions permitting.";
  if (/walk/.test(activity + " " + mood)) return "A relaxed coastal wander with a swim nearby.";
  return "A calm Sydney beach plan that actually fits today.";
}

function getHeroSubtitle(plan, generationInput) {
  const companion = String(plan?.companion || generationInput?.companion || "").toLowerCase();
  const activity = String(plan?.activity || generationInput?.activity || "").toLowerCase();
  const mood = String(plan?.mood_phrase || generationInput?.mood_phrase || "").toLowerCase();

  if (/date|partner|romantic/.test(companion + " " + mood)) {
    return "A cruisy date spot with calm water, history nearby, and enough space to actually hear each other.";
  }
  if (/solo|alone|reset/.test(companion + " " + mood)) {
    return "A gentle solo reset with enough quiet to properly switch off.";
  }
  if (/family|kids/.test(companion + " " + mood)) {
    return "An easy family beach day with simple logistics and room to settle in.";
  }
  if (/surf/.test(activity + " " + mood)) {
    return "A water-first beach plan with swell, wind, and timing doing the heavy lifting.";
  }
  return "A relaxed Sydney beach pick with the conditions, timing, and vibe doing the sorting.";
}

function getPlanImage(plan) {
  return firstValidImage(
    plan?.image_url,
    plan?.selected_beach_image_url,
    plan?.beach?.image_url,
    plan?.raw?.image_url,
  );
}

function getFoodNote(plan, generationInput) {
  const sourceTags = [
    ...(generationInput?.experience_tags || []),
    ...(plan?.input_context?.experience_tags || []),
    generationInput?.food,
    plan?.food,
  ]
    .filter(Boolean)
    .map((item) => String(item).trim())
    .filter(Boolean);
  const foodTag = sourceTags.find((item) => /food|cafe|coffee|bar|drink|breakfast|lunch|snack|fish|chips/i.test(item)) || sourceTags[0];

  if (foodTag) return `Keep it simple: ${foodTag}. Easy, nearby, and not trying too hard.`;
  return "Keep it simple: coffee, lunch, or something easy nearby. This is not a white-tablecloth kind of beach plan.";
}

function getMapQuery(plan, planBody, beachName) {
  const rawWhere = planText(planBody.where, "");
  const base = beachName && beachName !== "your beach day" ? beachName : rawWhere;
  return (base || "Sydney beach") + " Sydney NSW Australia";
}

function interactiveProps(prefersReducedMotion, rotate = 0) {
  if (prefersReducedMotion) return {};
  return {
    whileHover: { y: -5, scale: 1.012, rotate },
    whileTap: { scale: 0.99 },
    transition: { type: "spring", stiffness: 260, damping: 22 },
  };
}

function cleanText(value, fallback) {
  return planText(value, fallback).replace(/\s+/g, " ").trim();
}

function conditionValue(conditions, keys, suffix = "") {
  const key = keys.find((candidate) => conditions?.[candidate] !== null && conditions?.[candidate] !== undefined);
  if (!key) return "n/a";
  const value = conditions[key];
  return `${value}${suffix}`;
}

export default function GeneratedPlanJournal({ plan, generationInput, className = "" }) {
  const planBody = getPlanBody(plan);
  const bringItems = listItems(planBody.bring);
  const prefersReducedMotion = useReducedMotion();
  const beachName = getBeachName(plan, planBody);
  const heroImage = getPlanImage(plan);
  const cafeNote = getFoodNote(plan, generationInput);
  const mapQuery = getMapQuery(plan, planBody, beachName);
  const pop = (rotate = 0) => interactiveProps(prefersReducedMotion, rotate);
  const planTitle = getPlanTitle(plan, generationInput);
  const heroSubtitle = getHeroSubtitle(plan, generationInput);
  const summary = cleanText(
    plan?.mood_reading?.summary || planBody.why,
    "You’re after something gentle, relaxed, and not too chaotic. This pick gives you calm water, a decent bit of scenery, and a beach day that does not need to become a whole production.",
  );
  const whyCopy = cleanText(
    planBody.why,
    "It gives you the sweet spot: calm enough for a proper chat, scenic enough to feel like you made an effort, and relaxed enough that it does not become a big date performance.",
  );
  const timingCopy = cleanText(
    planBody.when,
    "Late afternoon is your best bet. You’ll get softer light, calmer energy, and less of the midday glare situation.",
  );
  const locationCopy = cleanText(
    planBody.where,
    `${beachName} is the call. Check your route before you leave, then keep the plan simple once you arrive.`,
  );
  const warningCopy = cleanText(
    planBody.gentle_warning,
    "Keep an eye on local conditions and respect the area around the beach. Also, UV does not care that the plan is romantic.",
  );
  const conditions = plan?.conditions || plan?.conditions_snapshot || {};
  const crowdLabel = plan?.candidate_snapshot?.[0]?.crowd?.label || plan?.crowd?.label || conditions?.crowd?.label || "moderate";
  const conditionItems = [
    ["Temp", conditionValue(conditions, ["temperature", "temperature_c", "temp_c"], "°C")],
    ["Waves", conditionValue(conditions, ["wave_height_m", "waves"], "m")],
    ["Wind", conditionValue(conditions, ["wind_kmh", "windKmh"], "km/h")],
    ["UV", conditionValue(conditions, ["uv_index", "uv"])],
    ["Crowd", crowdLabel],
  ];

  return (
    <div className={`generated-plan-journal ${className}`.trim()}>
      <img className="generated-plan-journal__clouds" src="/Cloud2.png" alt="" aria-hidden="true" />

      <section className="generated-bento" aria-label="Generated plan details">
        <div className="generated-bento-column generated-bento-column--primary">
          <motion.article className="generated-bento-card generated-bento-card--hero" {...pop(-0.1)}>
            <img
              src={heroImage}
              alt={beachName + " beach"}
              onError={(event) => {
                event.currentTarget.src = LOCAL_JOURNAL_IMAGES[0];
              }}
            />
            <div>
              <span>YOUR BEACH TODAY</span>
              <h2>{beachName}</h2>
              <p>{heroSubtitle}</p>
            </div>
          </motion.article>

          <motion.article className="generated-bento-card generated-bento-card--map" {...pop(-0.15)}>
            <iframe
              title={beachName + " map"}
              src={"https://www.google.com/maps?q=" + encodeURIComponent(mapQuery) + "&output=embed"}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
            <span>OPEN MAP</span>
          </motion.article>

          <motion.article className="generated-bento-card generated-bento-card--warning" {...pop(-0.1)}>
            <span>QUICK HEADS UP</span>
            <p>{warningCopy}</p>
          </motion.article>
        </div>

        <div className="generated-bento-column generated-bento-column--middle">
          <motion.article className="generated-bento-card generated-bento-card--title" {...pop(0.1)}>
            <span>THE PLAN</span>
            <h1>{planTitle}</h1>
            <p>{summary}</p>
          </motion.article>

          <motion.article className="generated-bento-card generated-bento-card--description" {...pop(0.15)}>
            <span>WHY IT FITS</span>
            <h2>Why this works</h2>
            <p>{whyCopy}</p>
          </motion.article>

          <motion.article className="generated-bento-card generated-bento-card--cafe" {...pop(0.1)}>
            <span>FOOD / AFTER</span>
            <p>{cafeNote}</p>
          </motion.article>

          <motion.article className="generated-bento-card generated-bento-card--bring" {...pop(0.1)}>
            <span>PACK THIS</span>
            <div>
              {(bringItems.length ? bringItems : ["water", "towel", "SPF"]).slice(0, 4).map((item) => <small key={item}>{item}</small>)}
            </div>
          </motion.article>
        </div>

        <div className="generated-bento-column generated-bento-column--secondary">
          <motion.article className="generated-bento-card generated-bento-card--conditions" {...pop(-0.1)}>
            <span>TODAY’S CONDITIONS</span>
            <div className="generated-condition-grid">
              {conditionItems.map(([label, value]) => (
                <div key={label}>
                  <small>{label}</small>
                  <strong>{value}</strong>
                </div>
              ))}
            </div>
          </motion.article>

          <motion.article className="generated-bento-card generated-bento-card--where" {...pop(0.1)}>
            <span>GETTING THERE</span>
            <p>{locationCopy}</p>
          </motion.article>

          <motion.article className="generated-bento-card generated-bento-card--when" {...pop(-0.1)}>
            <span>BEST TIME</span>
            <h2>Best time</h2>
            <p>{timingCopy}</p>
          </motion.article>
        </div>
      </section>
    </div>
  );
}
