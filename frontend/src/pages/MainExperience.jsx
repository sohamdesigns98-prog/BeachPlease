import { useEffect, useMemo, useState } from "react";

import { getBeaches } from "@/api/beaches";
import { getConditions } from "@/api/conditions";
import { createPlan } from "@/api/plans";
import BeachInfoTile from "@/components/BeachInfoTile";
import GeneratingOverlay from "@/components/GeneratingOverlay";
import MapboxBeachMap from "@/components/map/MapboxBeachMap";
import ModeToggle from "@/components/ModeToggle";
import MoodCanvasShell from "@/components/MoodCanvasShell";
import SavedModeShell from "@/components/SavedModeShell";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { normalizeBeachesForCanvas } from "@/utils/beachAdapter";
import { buildGuestPlanFromCanvas, buildPlanPayloadFromCanvas } from "@/utils/planPayload";

const ACTIVITY_HINTS = [
  { id: "swim", color: "#ADD0EE" },
  { id: "surf", color: "#91C059" },
  { id: "relax", color: "#ECBCEE" },
  { id: "snorkel", color: "#004724" },
  { id: "walk", color: "#FEC200" },
];
const COMPANION_HINTS = [
  { id: "solo", color: "#ADD0EE" },
  { id: "partner", color: "#ECBCEE" },
];

export default function MainExperience({ visible = false, onPlanGenerated }) {
  const { token } = useAuth();
  const [activeMode, setActiveMode] = useState("mood");
  const [moodPhrase, setMoodPhrase] = useState("");
  const [selectedBeachSlug, setSelectedBeachSlug] = useState("");
  const [selectedBeachName, setSelectedBeachName] = useState("");
  const [selectedBeachData, setSelectedBeachData] = useState(null);
  const [activityHint, setActivityHint] = useState("");
  const [companionHint, setCompanionHint] = useState("");
  const [beaches, setBeaches] = useState([]);
  const [mapFallbackActive, setMapFallbackActive] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationInput, setGenerationInput] = useState(null);
  const [error, setError] = useState("");
  const useMocks = import.meta.env.VITE_USE_MOCKS === "true";

  const selectedBeach = useMemo(
    () => {
      if (selectedBeachData?.slug === selectedBeachSlug) return selectedBeachData;
      return beaches.find((beach) => beach.slug === selectedBeachSlug) || null;
    },
    [beaches, selectedBeachData, selectedBeachSlug],
  );

  const highlightedBeachSlugs = useMemo(
    () => {
      if (!moodPhrase.trim()) return [];

      const words = moodPhrase.toLowerCase().split(/\s+/).filter((word) => word.length > 3);
      return beaches
        .filter((beach) => {
          const haystack = [
            beach.name,
            beach.region,
            beach.suburb,
            ...(beach.vibe_tags || []),
            ...(beach.best_for || []),
            ...(beach.facilities || []),
            ...(beach.access_tags || []),
          ].join(" ").toLowerCase();

          return words.some((word) => haystack.includes(word));
        })
        .slice(0, 12)
        .map((beach) => beach.slug);
    },
    [beaches, moodPhrase],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadBeachData() {
      try {
        const [beachResponse, conditionResponse] = await Promise.allSettled([
          getBeaches(),
          getConditions(),
        ]);
        if (cancelled) return;

        const nextBeaches = beachResponse.status === "fulfilled" && Array.isArray(beachResponse.value)
          ? beachResponse.value
          : [];
        const nextConditions = conditionResponse.status === "fulfilled" && Array.isArray(conditionResponse.value)
          ? conditionResponse.value
          : [];

        setBeaches(normalizeBeachesForCanvas(nextBeaches, nextConditions));
        setMapFallbackActive(conditionResponse.status !== "fulfilled");
      } catch {
        if (cancelled) return;
        setBeaches(normalizeBeachesForCanvas([], []));
        setMapFallbackActive(true);
      }
    }

    loadBeachData();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleBeachSelect(beach) {
    setSelectedBeachSlug(beach.slug || "");
    setSelectedBeachName(beach.name || "");
    setSelectedBeachData(beach);
  }

  function buildGenerationPayload() {
    return buildPlanPayloadFromCanvas({
      moodPhrase,
      activityHint,
      companionHint,
      selectedBeach,
    });
  }

  async function handleGeneratePostcard() {
    if (isGenerating) return;

    const payload = buildGenerationPayload();
    setGenerationInput(payload);
    setIsGenerating(true);
    setError("");

    if (useMocks || !token) {
      window.setTimeout(() => {
        const fallbackBeach = beaches.find((beach) => beach.slug === highlightedBeachSlugs[0]) || beaches[0];
        const mockPlan = buildGuestPlanFromCanvas({
          payload,
          selectedBeach,
          fallbackBeach,
          requiresAuthToSave: !token,
        });
        onPlanGenerated?.(mockPlan, payload);
        setIsGenerating(false);
      }, 800);
      return;
    }

    try {
      const createdPlan = await createPlan(payload);
      setSelectedBeachSlug(createdPlan.selected_beach_slug || selectedBeachSlug);
      setSelectedBeachName(createdPlan.selected_beach_name || selectedBeachName);
      onPlanGenerated?.(createdPlan, payload);
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn’t generate a postcard right now.");
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className={`main-app-shell mood-app-shell ${visible ? "is-visible" : ""}`}>
      <header className="mood-app-header">
        <span className="mood-app-mark" aria-hidden="true" />
        <ModeToggle
          activeMode={activeMode}
          savedCount={savedCount}
          onChange={setActiveMode}
        />
      </header>

      <section className={`mood-mode-layer ${activeMode === "mood" ? "is-active" : ""}`} aria-hidden={activeMode !== "mood"}>
        <MoodCanvasShell
          beaches={beaches}
          moodPhrase={moodPhrase}
          activityHint={activityHint}
          companionHint={companionHint}
          selectedBeachSlug={selectedBeachSlug}
          onBeachSelect={handleBeachSelect}
        />
      </section>

      <section className={`mood-mode-layer ${activeMode === "saved" ? "is-active" : ""}`} aria-hidden={activeMode !== "saved"}>
        <SavedModeShell onCountChange={setSavedCount} />
      </section>

      <section className={`mood-mode-layer ${activeMode === "map" ? "is-active" : ""}`} aria-hidden={activeMode !== "map"}>
        <MapboxBeachMap
          beaches={beaches}
          isFallback={mapFallbackActive}
          candidateBeachSlugs={highlightedBeachSlugs}
          preferredBeachSlug={selectedBeachSlug}
          selectedBeachSlug={selectedBeachSlug}
          selectedBeachName={selectedBeachName}
          onBeachPreview={handleBeachSelect}
        />
      </section>

      {selectedBeach && activeMode !== "saved" && (
        <BeachInfoTile
          beach={selectedBeach}
          isGenerating={isGenerating}
          onClose={() => {
            setSelectedBeachSlug("");
            setSelectedBeachName("");
            setSelectedBeachData(null);
          }}
          onGenerate={handleGeneratePostcard}
        />
      )}

      {activeMode !== "saved" && (
        <form
          className={`mood-input-bar ${selectedBeach ? "has-info-tile" : ""}`}
          onSubmit={(event) => {
            event.preventDefault();
            handleGeneratePostcard();
          }}
        >
          <input
            value={moodPhrase}
            placeholder="what kind of beach day do you need?"
            onChange={(event) => setMoodPhrase(event.target.value)}
          />
          <div className="mood-chip-line" aria-label="Mood filters">
            {ACTIVITY_HINTS.map((hint) => (
              <button
                key={hint.id}
                type="button"
                className={`mood-chip ${activityHint === hint.id ? "is-active" : ""}`}
                style={{ "--chip-color": hint.color }}
                onClick={() => setActivityHint((current) => (current === hint.id ? "" : hint.id))}
              >
                {hint.id}
              </button>
            ))}
            {COMPANION_HINTS.map((hint) => (
              <button
                key={hint.id}
                type="button"
                className={`mood-chip ${companionHint === hint.id ? "is-active" : ""}`}
                style={{ "--chip-color": hint.color }}
                onClick={() => setCompanionHint((current) => (current === hint.id ? "" : hint.id))}
              >
                {hint.id}
              </button>
            ))}
          </div>
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? "checking..." : "Find My Beach"}
          </Button>
        </form>
      )}

      {error && <p className="home-error" role="alert">{error}</p>}

      <GeneratingOverlay
        mood={generationInput?.mood_phrase || moodPhrase}
        isVisible={isGenerating}
      />
    </main>
  );
}
