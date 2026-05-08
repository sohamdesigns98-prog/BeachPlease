import { useState } from "react";

import { createPlan } from "@/api/plans";
import AuthSheet from "@/components/AuthSheet";
import BeachPlanTicket from "@/components/BeachPlanTicket";
import SaveBar from "@/components/SaveBar";
import { useAuth } from "@/context/AuthContext";

export default function ResultExperience({ plan, generationInput, visible = false }) {
  const { token, login, register } = useAuth();
  const [isSaveDismissed, setIsSaveDismissed] = useState(false);
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [savedPlan, setSavedPlan] = useState(null);
  const isSaved = Boolean(savedPlan || (token && !plan?.requiresAuthToSave));
  const showSaveBar = visible && !token && !isSaveDismissed;

  async function saveAfterAuth(authAction, credentials) {
    if (!generationInput) {
      setSaveError("Couldn’t find the original beach request. Try generating it again.");
      return;
    }

    setIsSaving(true);
    setSaveError("");

    try {
      await authAction(credentials);
      const createdPlan = await createPlan(generationInput);
      setSavedPlan(createdPlan);
      setIsAuthSheetOpen(false);
      setIsSaveDismissed(false);
    } catch (error) {
      setSaveError(error?.response?.data?.detail || "Couldn’t save it. Give it another go.");
    } finally {
      setIsSaving(false);
    }
  }

  function buildRegisterPayload(credentials) {
    return {
      ...credentials,
      suburb: "Sydney",
      companions: companionForProfile(generationInput?.companion),
      travel_mode: "public_transport",
    };
  }

  return (
    <main className={`result-experience ${visible ? "is-visible" : ""}`} aria-label="BeachPlease result">
      <BeachPlanTicket plan={savedPlan || plan} generationInput={generationInput} />
      {showSaveBar && (
        <SaveBar
          isSaved={isSaved}
          isSaving={isSaving}
          error={!isAuthSheetOpen ? saveError : ""}
          onDismiss={() => setIsSaveDismissed(true)}
          onSave={() => {
            setSaveError("");
            setIsAuthSheetOpen(true);
          }}
        />
      )}
      {savedPlan && <SaveBar isSaved />}
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
