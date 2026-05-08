import { useEffect, useMemo, useState } from "react";
import { HelpCircle } from "lucide-react";

import { getConditions } from "@/api/conditions";
import { createPlan } from "@/api/plans";
import StageFunnel from "@/components/funnel/StageFunnel";
import GeneratingOverlay from "@/components/GeneratingOverlay";
import MapboxBeachMap from "@/components/map/MapboxBeachMap";
import { REGION_CONFIG } from "@/components/map/regionConfig";
import { VIBES } from "@/content/voice";
import { useAuth } from "@/context/AuthContext";
import {
  getMockPlanForMood,
} from "@/utils/voiceHelpers";
import { selectCandidateBeaches } from "@/utils/candidateSelector";

const INITIAL_FUNNEL_STATE = {
  stage: 0,
  region: null,
  activity: null,
  companion: null,
  mood_phrase: "",
  preferredBeachSlug: null,
  candidateBeachSlugs: [],
  selectedBeachSlug: null,
};

export default function MainExperience({ visible = false, onPlanGenerated }) {
  const { token } = useAuth();
  const [funnelState, setFunnelState] = useState(INITIAL_FUNNEL_STATE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [mapBeaches, setMapBeaches] = useState([]);
  const [mapFallbackActive, setMapFallbackActive] = useState(false);
  const [selectedBeachSlug, setSelectedBeachSlug] = useState("");
  const [selectedBeachName, setSelectedBeachName] = useState("");
  const [utilityPanel, setUtilityPanel] = useState("");
  const [generationInput, setGenerationInput] = useState(null);
  const useMocks = import.meta.env.VITE_USE_MOCKS === "true";
  const candidates = useMemo(
    () => selectCandidateBeaches({
      conditions: mapBeaches,
      region: funnelState.region,
      activity: funnelState.activity,
      companion: funnelState.companion,
    }),
    [funnelState.activity, funnelState.companion, funnelState.region, mapBeaches],
  );
  const candidateBeachSlugs = useMemo(
    () => {
      if (candidates.length > 0) {
        return candidates.map((beach) => beach.slug);
      }

      if (funnelState.region && !funnelState.activity) {
        return REGION_CONFIG[funnelState.region]?.slugs || [];
      }

      return [];
    },
    [candidates, funnelState.activity, funnelState.region],
  );

  useEffect(() => {
    setFunnelState((current) => {
      if (arraysMatch(current.candidateBeachSlugs, candidateBeachSlugs)) {
        return current;
      }

      return {
        ...current,
        candidateBeachSlugs,
      };
    });
  }, [candidateBeachSlugs]);

  useEffect(() => {
    let cancelled = false;

    async function loadMapConditions() {
      try {
        const beaches = await getConditions();
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

  async function generatePlan(nextPayload) {
    if (isGenerating) return;

    const payload = nextPayload || buildPlanPayload(funnelState);
    const moodPhrase = payload.mood_phrase || fallbackMoodFromFunnel(payload);

    setError("");
    setGenerationInput(payload);
    setIsGenerating(true);

    if (useMocks) {
      window.setTimeout(() => {
        const mockPlan = {
          ...getMockPlanForMood(moodPhrase),
          mood_phrase: moodPhrase,
          ...payload,
        };
        setSelectedBeachSlug(mockPlan.selected_beach_slug || "");
        setSelectedBeachName(mockPlan.selected_beach_name || mockPlan.beachName || "");
        setFunnelState((current) => ({
          ...current,
          selectedBeachSlug: mockPlan.selected_beach_slug || "",
        }));
        onPlanGenerated?.(mockPlan, payload);
        setIsGenerating(false);
      }, 800);
      return;
    }

    if (!token) {
      window.setTimeout(() => {
        const mockPlan = {
          ...getMockPlanForMood(moodPhrase),
          mood_phrase: moodPhrase,
          ...payload,
          requiresAuthToSave: true,
        };
        setSelectedBeachSlug(mockPlan.selected_beach_slug || "");
        setSelectedBeachName(mockPlan.selected_beach_name || mockPlan.beachName || "");
        setFunnelState((current) => ({
          ...current,
          selectedBeachSlug: mockPlan.selected_beach_slug || "",
        }));
        onPlanGenerated?.(mockPlan, payload);
        setIsGenerating(false);
      }, 800);
      return;
    }

    try {
      const createdPlan = await createPlan(payload);
      setSelectedBeachSlug(createdPlan.selected_beach_slug || "");
      setSelectedBeachName(createdPlan.selected_beach_name || "");
      setFunnelState((current) => ({
        ...current,
        selectedBeachSlug: createdPlan.selected_beach_slug || "",
      }));
      onPlanGenerated?.(createdPlan, payload);
    } catch (caughtError) {
      if ([401, 403].includes(caughtError?.response?.status)) {
        const mockPlan = {
          ...getMockPlanForMood(moodPhrase),
          mood_phrase: moodPhrase,
          ...payload,
          requiresAuthToSave: true,
        };
        setSelectedBeachSlug(mockPlan.selected_beach_slug || "");
        setSelectedBeachName(mockPlan.selected_beach_name || mockPlan.beachName || "");
        setFunnelState((current) => ({
          ...current,
          selectedBeachSlug: mockPlan.selected_beach_slug || "",
        }));
        onPlanGenerated?.(mockPlan, payload);
        return;
      }

      setError(caughtError?.response?.data?.detail || "Couldn’t generate a plan right now.");
    } finally {
      setIsGenerating(false);
    }
  }

  function handleBeachSelect(beach) {
    setFunnelState((current) => ({
      ...current,
      preferredBeachSlug: beach.slug,
    }));
    setSelectedBeachName(beach.name || "");
  }

  function handleFunnelChange(nextState) {
    setFunnelState(nextState);
    setSelectedBeachSlug(nextState.selectedBeachSlug || "");
    const selected = mapBeaches.find((beach) => beach.slug === (
      nextState.selectedBeachSlug || nextState.preferredBeachSlug
    ));
    setSelectedBeachName(selected?.name || "");
  }

  function handleGenerateFromFunnel(payload) {
    generatePlan(payload || buildPlanPayload(funnelState));
  }

  function handleRegionSelect(region) {
    handleFunnelChange({
      ...funnelState,
      region,
      stage: 1,
    });
  }

  return (
    <main className={`main-app-shell main-experience-split ${visible ? "is-visible" : ""}`}>
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
          className="utility-popover is-help"
          aria-label="How to use"
        >
          <button
            type="button"
            className="utility-popover-close"
            aria-label="Close panel"
            onClick={() => setUtilityPanel("")}
          >
            ×
          </button>

          <div className="utility-help-copy">
            <p className="utility-popover-kicker">HOW IT WORKS</p>
            <ol>
              <li>Pick a patch.</li>
              <li>Say what you’re doing.</li>
              <li>Choose who’s getting dragged along.</li>
              <li>Add a vibe note if the coast needs context.</li>
            </ol>
          </div>
        </section>
      )}

      <StageFunnel
        state={{
          ...funnelState,
          candidateBeachSlugs,
        }}
        conditions={mapBeaches}
        candidates={candidates}
        onChange={handleFunnelChange}
        onGenerate={handleGenerateFromFunnel}
      />

      <MapboxBeachMap
        beaches={mapBeaches}
        isFallback={mapFallbackActive}
        region={funnelState.region}
        activity={funnelState.activity}
        candidateBeachSlugs={candidateBeachSlugs}
        preferredBeachSlug={funnelState.preferredBeachSlug || ""}
        selectedBeachSlug={selectedBeachSlug}
        selectedBeachName={selectedBeachName}
        onBeachPreview={handleBeachSelect}
        onRegionSelect={handleRegionSelect}
      />

      {error && <p className="home-error" role="alert">{error}</p>}

      <GeneratingOverlay
        mood={generationInput?.mood_phrase || funnelState.mood_phrase || fallbackMoodFromFunnel(funnelState)}
        isVisible={isGenerating}
      />
    </main>
  );
}

function arraysMatch(first = [], second = []) {
  if (first.length !== second.length) return false;
  return first.every((item, index) => item === second[index]);
}

function buildPlanPayload(state) {
  return {
    region: state.region,
    activity: state.activity,
    companion: state.companion,
    mood_phrase: state.mood_phrase.trim() || undefined,
    preferred_beach_slug: state.preferredBeachSlug || undefined,
  };
}

function fallbackMoodFromFunnel(payload) {
  if (payload.mood_phrase) return payload.mood_phrase;
  if (payload.region && payload.activity && payload.companion) {
    return `${payload.activity} beach day around ${payload.region} with ${payload.companion}`;
  }
  return VIBES[0].phrase;
}
