import { useEffect, useState } from "react";
import { HelpCircle, LayoutGrid, X } from "lucide-react";

import { getMapConditions } from "@/api/conditions";
import { createPlan } from "@/api/plans";
import GeneratingOverlay from "@/components/GeneratingOverlay";
import MoodSearchBar from "@/components/MoodSearchBar";
import ShoreMap from "@/components/ShoreMap";
import { APP_COPY, VIBES } from "@/content/voice";
import { useAuth } from "@/context/AuthContext";
import {
  getArcMessage,
  getMockPlanForMood,
  getMoodRing,
  getWordCount,
} from "@/utils/voiceHelpers";

export default function MainExperience({ visible = false, onPlanGenerated }) {
  const { token } = useAuth();
  const [mood, setMood] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [mapBeaches, setMapBeaches] = useState([]);
  const [mapFallbackActive, setMapFallbackActive] = useState(false);
  const [selectedBeachSlug, setSelectedBeachSlug] = useState("");
  const [selectedBeachName, setSelectedBeachName] = useState("");
  const [utilityPanel, setUtilityPanel] = useState("");
  const moodRing = getMoodRing(mood);
  const progressMessage = getArcMessage(getWordCount(mood));
  const useMocks = import.meta.env.VITE_USE_MOCKS === "true";

  useEffect(() => {
    let cancelled = false;

    async function loadMapConditions() {
      try {
        const beaches = await getMapConditions();
        if (cancelled) return;
        setMapBeaches(Array.isArray(beaches) ? beaches : []);
        setMapFallbackActive(false);
      } catch {
        if (cancelled) return;
        setMapBeaches([]);
        setMapFallbackActive(true);
      }
    }

    loadMapConditions();

    return () => {
      cancelled = true;
    };
  }, []);

  async function generatePlan(nextMood = mood) {
    if (isGenerating) return;

    const moodPhrase = nextMood.trim();
    if (!moodPhrase) return;

    setError("");
    setIsGenerating(true);

    if (useMocks) {
      window.setTimeout(() => {
        const mockPlan = {
          ...getMockPlanForMood(moodPhrase),
          mood_phrase: moodPhrase,
        };
        setSelectedBeachSlug(mockPlan.selected_beach_slug || "");
        setSelectedBeachName(mockPlan.selected_beach_name || mockPlan.beachName || "");
        onPlanGenerated?.(mockPlan);
        setIsGenerating(false);
      }, 800);
      return;
    }

    if (!token) {
      window.setTimeout(() => {
        const mockPlan = {
          ...getMockPlanForMood(moodPhrase),
          mood_phrase: moodPhrase,
          requiresAuthToSave: true,
        };
        setSelectedBeachSlug(mockPlan.selected_beach_slug || "");
        setSelectedBeachName(mockPlan.selected_beach_name || mockPlan.beachName || "");
        onPlanGenerated?.(mockPlan);
        setIsGenerating(false);
      }, 800);
      return;
    }

    try {
      const createdPlan = await createPlan({ mood_phrase: moodPhrase });
      setSelectedBeachSlug(createdPlan.selected_beach_slug || "");
      setSelectedBeachName(createdPlan.selected_beach_name || "");
      onPlanGenerated?.(createdPlan);
    } catch (caughtError) {
      if ([401, 403].includes(caughtError?.response?.status)) {
        const mockPlan = {
          ...getMockPlanForMood(moodPhrase),
          mood_phrase: moodPhrase,
          requiresAuthToSave: true,
        };
        setSelectedBeachSlug(mockPlan.selected_beach_slug || "");
        setSelectedBeachName(mockPlan.selected_beach_name || mockPlan.beachName || "");
        onPlanGenerated?.(mockPlan);
        return;
      }

      setError(caughtError?.response?.data?.detail || "Couldn’t generate a plan right now.");
    } finally {
      setIsGenerating(false);
    }
  }

  function pickForMe() {
    const vibe = VIBES[Math.floor(Math.random() * VIBES.length)];
    setMood(vibe.phrase);
    generatePlan(vibe.phrase);
  }

  function handleBeachSelect(beach) {
    setMood(`I want a beach day near ${beach.name}`);
  }

  function selectPremadePlan(phrase) {
    setMood(phrase);
    setUtilityPanel("");
  }

  return (
    <main className={`main-app-shell app-flow-shell ${visible ? "is-visible" : ""}`}>
      <section className="utility-button-rail" aria-label="Quick tools">
        <button
          type="button"
          className="round-utility-button"
          aria-label="How to use BeachPlease"
          aria-expanded={utilityPanel === "help"}
          onClick={() => setUtilityPanel((current) => (current === "help" ? "" : "help"))}
        >
          <HelpCircle aria-hidden="true" strokeWidth={1.7} />
        </button>
      </section>

      {utilityPanel && (
        <section
          className={`utility-popover ${utilityPanel === "plans" ? "is-plans" : "is-help"}`}
          aria-label={utilityPanel === "help" ? "How to use" : "Premade plans"}
        >
          <button
            type="button"
            className="utility-popover-close"
            aria-label="Close panel"
            onClick={() => setUtilityPanel("")}
          >
            <X aria-hidden="true" strokeWidth={1.7} />
          </button>

          {utilityPanel === "help" ? (
            <div className="utility-help-copy">
              <p className="utility-popover-kicker">HOW IT WORKS</p>
              <ol>
                <li>Say the mood. Plain English is best.</li>
                <li>Pick a dot if you already have a beach in mind.</li>
                <li>Hit get me a beach. We’ll sort the coast.</li>
                <li>Like the ticket? Log in after to save it.</li>
              </ol>
            </div>
          ) : (
            <div className="premade-plan-list">
              <p className="utility-popover-kicker">PREMADE STARTERS</p>
              {VIBES.map((vibe) => (
                <button
                  key={vibe.id}
                  type="button"
                  onClick={() => selectPremadePlan(vibe.phrase)}
                >
                  <span>{vibe.emoji}</span>
                  <strong>{vibe.label}</strong>
                  <small>{vibe.phrase}</small>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="minimal-headline" aria-label="BeachPlease prompt">
        <h1>
          {APP_COPY.home.headline.map((line) => (
            <span key={line}>
              {line}
              <br />
            </span>
          ))}
        </h1>
      </section>

      <ShoreMap
        mapBeaches={mapBeaches}
        isFallback={mapFallbackActive}
        selectedBeachSlug={selectedBeachSlug}
        selectedBeachName={selectedBeachName}
        onBeachSelect={handleBeachSelect}
      />

      <MoodSearchBar
        value={mood}
        isLoading={isGenerating}
        moodRing={moodRing}
        progressMessage={progressMessage}
        onChange={setMood}
        onSubmit={generatePlan}
      />

      <button
        type="button"
        className="search-grid-button"
        aria-label="Open premade plans"
        aria-expanded={utilityPanel === "plans"}
        onClick={() => setUtilityPanel((current) => (current === "plans" ? "" : "plans"))}
      >
        <LayoutGrid aria-hidden="true" strokeWidth={1.7} />
      </button>

      <section className="home-action-row" aria-label="Plan actions">
        <button type="button" onClick={() => generatePlan()}>
          GET ME A BEACH →
        </button>
        <button type="button" onClick={pickForMe}>
          ✦ nah, just pick for me
        </button>
      </section>

      {error && <p className="home-error" role="alert">{error}</p>}

      <GeneratingOverlay mood={mood} isVisible={isGenerating} />
    </main>
  );
}
