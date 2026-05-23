import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { savePlanSnapshot } from "@/api/plans";
import AuthSheet from "@/components/AuthSheet";
import BeachPlanTicket, { validImageUrl } from "@/components/BeachPlanTicket";
import SaveBar from "@/components/SaveBar";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";
import { getPlanBody, listItems, planText } from "@/utils/planDisplay";

function getPlanId(plan) {
  return plan?._id || plan?.id;
}

const LOCAL_JOURNAL_IMAGES = ["/landing-scroll.jpg", "/sydney-coast.svg"];

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

function makeJournalCards(planBody, cafeNote) {
  return [
    ["where", "patch", planText(planBody.where, "No beach destination was included.")],
    ["when", "timing", planText(planBody.when, "No timing was included.")],
    ["cafe / after", "local stop", cafeNote],
    ["why", "mood fit", planText(planBody.why, "No reasoning was included."), "is-wide"],
    ["conditions", "live read", planText(planBody.conditions_summary, "No condition summary was included."), "is-wide"],
    ["heads up", "tiny warning", planText(planBody.gentle_warning, "No warning was included."), "is-wide"],
  ];
}

function interactiveProps(prefersReducedMotion, rotate = 0) {
  if (prefersReducedMotion) return {};
  return {
    whileHover: { y: -6, scale: 1.018, rotate },
    whileTap: { scale: 0.985 },
    transition: { type: "spring", stiffness: 260, damping: 20 },
  };
}

export default function ResultExperience({ plan, generationInput, visible = false }) {
  const { token, login, register } = useAuth();
  const [isSaveDismissed, setIsSaveDismissed] = useState(false);
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedPlan, setSavedPlan] = useState(null);
  const isSaved = Boolean(savedPlan || getPlanId(plan));
  const savedPlanId = getPlanId(savedPlan || (token ? plan : null));
  const showSaveBar = visible && !isSaved && !isSaveDismissed;
  const activePlan = savedPlan || plan;
  const planBody = getPlanBody(activePlan);
  const bringItems = listItems(planBody.bring);
  const prefersReducedMotion = useReducedMotion();
  const beachName = getBeachName(activePlan, planBody);
  const heroImage = getPlanImage(activePlan);
  const cafeNote = getFoodNote(activePlan, generationInput);
  const mapQuery = getMapQuery(activePlan, planBody, beachName);
  const journalCards = makeJournalCards(planBody, cafeNote);
  const pop = (rotate = 0) => interactiveProps(prefersReducedMotion, rotate);

  async function saveCurrentPlan() {
    if (!plan) {
      setSaveError("Couldn't find the generated plan. Try generating it again.");
      return;
    }

    setIsSaving(true);
    setSaveError("");
    try {
      const createdPlan = await savePlanSnapshot({
        plan,
        generation_input: generationInput || plan.input_context || {},
      });
      setSavedPlan(createdPlan);
      setIsSaveDismissed(false);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Couldn't save it. Give it another go."));
    } finally {
      setIsSaving(false);
    }
  }

  async function saveAfterAuth(authAction, credentials) {
    if (!plan) {
      setSaveError("Couldn't find the generated plan. Try generating it again.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await authAction(credentials);
      const createdPlan = await savePlanSnapshot({
        plan,
        generation_input: generationInput || plan.input_context || {},
      });
      setSavedPlan(createdPlan);
      setIsAuthSheetOpen(false);
      setIsSaveDismissed(false);
    } catch (error) {
      setSaveError(getApiErrorMessage(error, "Couldn't save it. Give it another go."));
    } finally {
      setIsSaving(false);
    }
  }

  function buildRegisterPayload(credentials) {
    return {
      ...credentials,
      suburb: credentials.suburb,
      companions: companionForProfile(generationInput?.companion),
      travel_mode: "public_transport",
    };
  }

  return (
    <main className={`result-experience ${visible ? "is-visible" : ""}`} aria-label="BeachPlease result">
      <div className="result-experience__layout">
        <BeachPlanTicket plan={activePlan} generationInput={generationInput} />

        <section className="generated-plan-panel" aria-label="Generated plan details">
          <div className="generated-plan-panel__header">
            <div>
              <p className="generated-plan-panel__eyebrow">digital beach journal</p>
              <h1>{beachName}</h1>
            </div>
            <span className="generated-plan-panel__stamp">NSW</span>
          </div>

          {activePlan?.mood_reading?.summary && (
            <p className="generated-plan-panel__summary">{activePlan.mood_reading.summary}</p>
          )}

          <div className="generated-plan-panel__board">
            <div className="journal-collage" aria-label="Plan images and map">
              <motion.figure className="journal-photo journal-photo--hero" {...pop(-1.4)}>
                <img
                  src={heroImage}
                  alt={beachName + " beach"}
                  onError={(event) => {
                    event.currentTarget.src = LOCAL_JOURNAL_IMAGES[0];
                  }}
                />
                <figcaption>main patch</figcaption>
              </motion.figure>

              <motion.figure className="journal-photo journal-photo--local" {...pop(1.2)}>
                <img src={LOCAL_JOURNAL_IMAGES[0]} alt="Local coast detail" />
                <figcaption>salt air note</figcaption>
              </motion.figure>

              <motion.div className="journal-map-card" {...pop(-0.8)}>
                <iframe
                  title={beachName + " map"}
                  src={"https://www.google.com/maps?q=" + encodeURIComponent(mapQuery) + "&output=embed"}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <span>map it</span>
              </motion.div>

              <motion.div className="journal-scribble" {...pop(0.6)}>
                <span>after swim</span>
                <p>{cafeNote}</p>
              </motion.div>
            </div>

            <div className="journal-notes">
              {journalCards.map(([label, title, copy, width], index) => (
                <motion.article
                  className={`journal-note-card ${width || ""}`.trim()}
                  key={`${label}-${title}`}
                  {...pop(index % 2 === 0 ? -0.5 : 0.5)}
                >
                  <span>{label}</span>
                  <h2>{title}</h2>
                  <p>{copy}</p>
                </motion.article>
              ))}
            </div>
          </div>

          {bringItems.length > 0 && (
            <div className="generated-plan-panel__chips" aria-label="What to bring">
              {bringItems.map((item) => <motion.span key={item} {...pop(0)}>{item}</motion.span>)}
            </div>
          )}
        </section>
      </div>
      {showSaveBar && (
        <SaveBar
          isSaved={isSaved}
          isSaving={isSaving}
          error={!isAuthSheetOpen ? saveError : ""}
          onDismiss={() => setIsSaveDismissed(true)}
          onSave={() => {
            setSaveError("");
            if (token) {
              saveCurrentPlan();
              return;
            }
            setIsAuthSheetOpen(true);
          }}
        />
      )}
      {visible && isSaved && savedPlanId && <SaveBar isSaved savedPlanId={savedPlanId} />}
      <AuthSheet
        isOpen={isAuthSheetOpen}
        isSubmitting={isSaving}
        error={saveError}
        onClose={() => setIsAuthSheetOpen(false)}
        onRegister={(credentials) => saveAfterAuth(register, buildRegisterPayload(credentials))}
        onLogin={(credentials) => saveAfterAuth(login, credentials)}
      />
    </main>
  );
}

function companionForProfile(companion) {
  if (companion === "mates") return "friends";
  if (["solo", "partner", "family", "dog"].includes(companion)) return companion;
  return "solo";
}
