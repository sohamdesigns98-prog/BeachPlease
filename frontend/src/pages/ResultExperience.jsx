import { useState } from "react";

import { savePlanSnapshot } from "@/api/plans";
import AuthSheet from "@/components/AuthSheet";
import BeachPlanTicket from "@/components/BeachPlanTicket";
import SaveBar from "@/components/SaveBar";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";
import { getPlanBody, listItems, planText } from "@/utils/planDisplay";

function getPlanId(plan) {
  return plan?._id || plan?.id;
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
          <p className="generated-plan-panel__eyebrow">generated plan</p>
          <h1>{activePlan?.selected_beach_name || planBody.where || "your beach day"}</h1>
          {activePlan?.mood_reading?.summary && <p className="generated-plan-panel__summary">{activePlan.mood_reading.summary}</p>}

          <div className="generated-plan-panel__grid">
            <article>
              <span>where</span>
              <p>{planText(planBody.where, "No beach destination was included.")}</p>
            </article>
            <article>
              <span>when</span>
              <p>{planText(planBody.when, "No timing was included.")}</p>
            </article>
            <article className="is-wide">
              <span>why</span>
              <p>{planText(planBody.why, "No reasoning was included.")}</p>
            </article>
            <article className="is-wide">
              <span>conditions</span>
              <p>{planText(planBody.conditions_summary, "No condition summary was included.")}</p>
            </article>
            <article className="is-wide">
              <span>heads up</span>
              <p>{planText(planBody.gentle_warning, "No warning was included.")}</p>
            </article>
          </div>

          {bringItems.length > 0 && (
            <div className="generated-plan-panel__chips" aria-label="What to bring">
              {bringItems.map((item) => <span key={item}>{item}</span>)}
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
