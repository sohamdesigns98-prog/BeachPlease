import { useState } from "react";

import { savePlanSnapshot } from "@/api/plans";
import AuthSheet from "@/components/AuthSheet";
import GeneratedPlanJournal from "@/components/GeneratedPlanJournal";
import SaveBar from "@/components/SaveBar";
import { useAuth } from "@/context/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";

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
      <GeneratedPlanJournal plan={activePlan} generationInput={generationInput} />
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
