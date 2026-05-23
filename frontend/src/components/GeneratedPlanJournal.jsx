import { useEffect, useRef } from "react";
import BentoGrid from "@bentogrid/core";
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

  if (foodTag) return "after the water, keep the stop simple: " + foodTag + ".";
  return "after the water, find coffee, something salty, and a shady bit of pavement to debrief.";
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

function shortText(value, fallback, limit = 150) {
  const text = planText(value, fallback).replace(/\s+/g, " ").trim();
  if (text.length <= limit) return text;
  return text.slice(0, limit).trimEnd() + ".";
}

export default function GeneratedPlanJournal({ plan, generationInput, className = "" }) {
  const bentoRef = useRef(null);
  const planBody = getPlanBody(plan);
  const bringItems = listItems(planBody.bring);
  const prefersReducedMotion = useReducedMotion();
  const beachName = getBeachName(plan, planBody);
  const heroImage = getPlanImage(plan);
  const cafeNote = getFoodNote(plan, generationInput);
  const mapQuery = getMapQuery(plan, planBody, beachName);
  const pop = (rotate = 0) => interactiveProps(prefersReducedMotion, rotate);
  const summary = plan?.mood_reading?.summary || planText(planBody.why, "A clean little beach day, built around the conditions and your mood.");
  const conditionCopy = planText(planBody.conditions_summary, "Live conditions were included in the recommendation.");
  const warningCopy = planText(planBody.gentle_warning, "Keep an eye on the water and make the sensible call.");
  const conditionMetric = plan?.conditions_snapshot?.temperature_c ?? plan?.conditions?.temperature_c ?? plan?.conditions?.temp_c;
  const score = Number.isFinite(Number(plan?.score)) ? Math.round(Number(plan.score)) : null;
  const statValue = score || (conditionMetric !== undefined && conditionMetric !== null ? Math.round(Number(conditionMetric)) : 99);
  const statLabel = score ? "fit" : "temp";

  useEffect(() => {
    if (!bentoRef.current) return undefined;

    const grid = new BentoGrid({
      target: bentoRef.current,
      columns: 6,
      cellGap: 18,
      aspectRatio: 1,
      balanceFillers: false,
      breakpoints: {
        0: { columns: 1, cellGap: 12, aspectRatio: 1.45 },
        720: { columns: 3, cellGap: 14, aspectRatio: 1.05 },
        1120: { columns: 6, cellGap: 18, aspectRatio: 1 },
      },
    });

    return () => {
      grid.resizeObserver?.unobserve?.(grid.gridContainer);
      grid.removeClonedFillers?.();
    };
  }, [beachName, heroImage, summary, conditionCopy, warningCopy, cafeNote, bringItems.length]);

  return (
    <div className={`generated-plan-journal ${className}`.trim()}>
      <video className="generated-plan-journal__clouds" autoPlay muted loop playsInline aria-hidden="true">
        <source src="/CloudAsset.mp4" type="video/mp4" />
      </video>

      <section ref={bentoRef} className="generated-bento" aria-label="Generated plan details">
        <motion.article className="generated-bento-card generated-bento-card--title" data-bento="3x2" data-bento-no-swap {...pop(0.1)}>
          <span>digital beach journal</span>
          <h1>{beachName}</h1>
          <p>{shortText(summary, "A clean little beach day, built around the conditions and your mood.", 210)}</p>
        </motion.article>

        <motion.article className="generated-bento-card generated-bento-card--hero" data-bento="1x2" data-bento-no-swap {...pop(-0.2)}>
          <img
            src={heroImage}
            alt={beachName + " beach"}
            onError={(event) => {
              event.currentTarget.src = LOCAL_JOURNAL_IMAGES[0];
            }}
          />
          <div>
            <span>main patch</span>
            <h2>{beachName}</h2>
          </div>
        </motion.article>

        <motion.article className="generated-bento-card generated-bento-card--where" data-bento="1x2" {...pop(0.2)}>
          <span>where</span>
          <h2>Patch</h2>
          <p>{shortText(planBody.where, "No destination was included.", 125)}</p>
        </motion.article>

        <motion.article className="generated-bento-card generated-bento-card--swatches" data-bento="1x2" {...pop(-0.1)}>
          <span>read</span>
          <div aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </motion.article>

        <motion.article className="generated-bento-card generated-bento-card--stat" data-bento="1x1" {...pop(0.1)}>
          <span>{statLabel}</span>
          <strong>{statValue}</strong>
        </motion.article>

        <motion.article className="generated-bento-card generated-bento-card--type" data-bento="1x1" {...pop(-0.1)}>
          <span>mood</span>
          <strong>{plan?.activity || plan?.mood_phrase || "Aa"}</strong>
        </motion.article>

        <motion.article className="generated-bento-card generated-bento-card--when" data-bento="2x2" {...pop(-0.2)}>
          <span>when</span>
          <h2>Timing</h2>
          <p>{shortText(planBody.when, "No timing was included.", 150)}</p>
        </motion.article>

        <motion.article className="generated-bento-card generated-bento-card--map" data-bento="2x2" {...pop(-0.3)}>
          <iframe
            title={beachName + " map"}
            src={"https://www.google.com/maps?q=" + encodeURIComponent(mapQuery) + "&output=embed"}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
          <span>map it</span>
        </motion.article>

        <motion.article className="generated-bento-card generated-bento-card--cafe" data-bento="2x1" {...pop(0.3)}>
          <span>cafe / after</span>
          <p>{shortText(cafeNote, "Keep the stop simple after the water.", 120)}</p>
        </motion.article>

        <motion.article className="generated-bento-card generated-bento-card--conditions" data-bento="2x1" {...pop(-0.2)}>
          <span>conditions</span>
          <p>{shortText(conditionCopy, "Live conditions were included.", 125)}</p>
        </motion.article>

        <motion.article className="generated-bento-card generated-bento-card--warning" data-bento="2x1" {...pop(0.2)}>
          <span>heads up</span>
          <p>{shortText(warningCopy, "Keep an eye on the water.", 120)}</p>
        </motion.article>

        {bringItems.length > 0 && (
          <motion.article className="generated-bento-card generated-bento-card--bring" data-bento="2x1" {...pop(-0.2)}>
            <span>bring</span>
            <div>
              {bringItems.slice(0, 4).map((item) => <small key={item}>{item}</small>)}
            </div>
          </motion.article>
        )}
      </section>
    </div>
  );
}
