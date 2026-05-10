import { useEffect, useMemo, useState } from "react";

import { getBeaches } from "@/api/beaches";
import {
  createCluster,
  deleteCluster,
  getClusters,
  updateCluster,
} from "@/api/clusters";
import { getConditions } from "@/api/conditions";
import { createPlan } from "@/api/plans";
import AudioToggle from "@/components/audio/AudioToggle";
import BeachInfoTile from "@/components/BeachInfoTile";
import ClusterTray from "@/components/ClusterTray";
import CreateClusterDialog from "@/components/CreateClusterDialog";
import GeneratingOverlay from "@/components/GeneratingOverlay";
import MapboxBeachMap from "@/components/map/MapboxBeachMap";
import ModeToggle from "@/components/ModeToggle";
import MoodCanvasShell from "@/components/MoodCanvasShell";
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
const LOCAL_CLUSTERS_KEY = "beachplease_guest_clusters";

function getClusterId(cluster) {
  return cluster?._id || cluster?.id;
}

function uniqueBeachSlugs(slugs = []) {
  return Array.from(new Set(slugs.filter(Boolean)));
}

function loadLocalClusters() {
  try {
    if (typeof window === "undefined") return [];
    const stored = window.localStorage.getItem(LOCAL_CLUSTERS_KEY);
    const parsed = stored ? JSON.parse(stored) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLocalClusters(clusters) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(LOCAL_CLUSTERS_KEY, JSON.stringify(clusters));
  } catch {
    // Guest clusters are a convenience layer; the app can continue without persistence.
  }
}

function makeLocalCluster(payload) {
  const timestamp = new Date().toISOString();
  return {
    id: `local-${Date.now()}`,
    user_id: "guest",
    name: payload.name,
    description: payload.description || "",
    mood_phrase: payload.mood_phrase || "",
    beach_slugs: uniqueBeachSlugs(payload.beach_slugs || []),
    created_at: timestamp,
    updated_at: timestamp,
  };
}

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
  const [clusters, setClusters] = useState([]);
  const [clustersLoading, setClustersLoading] = useState(false);
  const [clusterError, setClusterError] = useState("");
  const [isClusterDialogOpen, setIsClusterDialogOpen] = useState(false);
  const [isClusterSaving, setIsClusterSaving] = useState(false);
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

  const beachesBySlug = useMemo(
    () => Object.fromEntries(beaches.map((beach) => [beach.slug, beach])),
    [beaches],
  );

  const clusteredBeachCount = useMemo(
    () => uniqueBeachSlugs(clusters.flatMap((cluster) => cluster.beach_slugs || [])).length,
    [clusters],
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

  useEffect(() => {
    let cancelled = false;

    async function loadClusters() {
      if (!token) {
        setClusters(loadLocalClusters());
        setClustersLoading(false);
        setClusterError("");
        return;
      }

      setClustersLoading(true);
      setClusterError("");
      try {
        const nextClusters = await getClusters();
        if (!cancelled) setClusters(Array.isArray(nextClusters) ? nextClusters : []);
      } catch (caughtError) {
        if (!cancelled) {
          setClusterError(caughtError?.response?.data?.detail || "Couldn’t load clusters.");
        }
      } finally {
        if (!cancelled) setClustersLoading(false);
      }
    }

    loadClusters();

    return () => {
      cancelled = true;
    };
  }, [token]);

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

  async function handleCreateCluster(payload, options = {}) {
    if (isClusterSaving) return;

    const { activate = true } = options;
    setIsClusterSaving(true);
    setClusterError("");
    if (!token) {
      const createdCluster = makeLocalCluster(payload);
      setClusters((currentClusters) => {
        const nextClusters = [createdCluster, ...currentClusters];
        saveLocalClusters(nextClusters);
        return nextClusters;
      });
      setIsClusterDialogOpen(false);
      if (activate) setActiveMode("clusters");
      setIsClusterSaving(false);
      return;
    }

    try {
      const createdCluster = await createCluster(payload);
      setClusters((currentClusters) => [createdCluster, ...currentClusters]);
      setIsClusterDialogOpen(false);
      if (activate) setActiveMode("clusters");
    } catch (caughtError) {
      setClusterError(caughtError?.response?.data?.detail || "Couldn’t create that cluster.");
    } finally {
      setIsClusterSaving(false);
    }
  }

  async function handleAddBeachToCluster(cluster, beach) {
    if (!cluster || !beach?.slug) return;

    const clusterId = getClusterId(cluster);
    const beachSlugs = uniqueBeachSlugs([...(cluster.beach_slugs || []), beach.slug]);
    setClusterError("");

    if (!token) {
      setClusters((currentClusters) => {
        const timestamp = new Date().toISOString();
        const nextClusters = currentClusters.map((currentCluster) => (
          getClusterId(currentCluster) === clusterId
            ? { ...currentCluster, beach_slugs: beachSlugs, updated_at: timestamp }
            : currentCluster
        ));
        saveLocalClusters(nextClusters);
        return nextClusters;
      });
      return;
    }

    try {
      const updatedCluster = await updateCluster(clusterId, { beach_slugs: beachSlugs });
      setClusters((currentClusters) => currentClusters.map((currentCluster) => (
        getClusterId(currentCluster) === clusterId ? updatedCluster : currentCluster
      )));
    } catch (caughtError) {
      setClusterError(caughtError?.response?.data?.detail || "Couldn’t add that beach.");
    }
  }

  async function handleRemoveBeachFromCluster(cluster, beachSlug) {
    const clusterId = getClusterId(cluster);
    if (!clusterId || !beachSlug) return;

    const beachSlugs = (cluster.beach_slugs || []).filter((slug) => slug !== beachSlug);
    setClusterError("");

    if (!token) {
      setClusters((currentClusters) => {
        const timestamp = new Date().toISOString();
        const nextClusters = currentClusters.map((currentCluster) => (
          getClusterId(currentCluster) === clusterId
            ? { ...currentCluster, beach_slugs: beachSlugs, updated_at: timestamp }
            : currentCluster
        ));
        saveLocalClusters(nextClusters);
        return nextClusters;
      });
      return;
    }

    try {
      const updatedCluster = await updateCluster(clusterId, { beach_slugs: beachSlugs });
      setClusters((currentClusters) => currentClusters.map((currentCluster) => (
        getClusterId(currentCluster) === clusterId ? updatedCluster : currentCluster
      )));
    } catch (caughtError) {
      setClusterError(caughtError?.response?.data?.detail || "Couldn’t remove that beach.");
    }
  }

  async function handleDeleteCluster(cluster) {
    const clusterId = getClusterId(cluster);
    if (!clusterId) return;

    setClusterError("");

    if (!token) {
      setClusters((currentClusters) => {
        const nextClusters = currentClusters.filter((currentCluster) => getClusterId(currentCluster) !== clusterId);
        saveLocalClusters(nextClusters);
        return nextClusters;
      });
      return;
    }

    try {
      await deleteCluster(clusterId);
      setClusters((currentClusters) => currentClusters.filter((currentCluster) => (
        getClusterId(currentCluster) !== clusterId
      )));
    } catch (caughtError) {
      setClusterError(caughtError?.response?.data?.detail || "Couldn’t delete that cluster.");
    }
  }

  function handleOpenClusterAdd() {
    if (clusters.length === 0) {
      setIsClusterDialogOpen(true);
      return;
    }
    if (selectedBeach) {
      handleAddBeachToCluster(clusters[0], selectedBeach);
    }
  }

  function handleQuickAddBeachToCluster(beach) {
    if (!beach?.slug) return;

    if (clusters.length === 0) {
      handleCreateCluster({
        name: "my beaches",
        description: "quick saves from the canvas",
        mood_phrase: moodPhrase,
        beach_slugs: [beach.slug],
      }, { activate: false });
      return;
    }

    handleAddBeachToCluster(clusters[0], beach);
  }

  return (
    <main className={`main-app-shell mood-app-shell ${visible ? "is-visible" : ""}`}>
      <header className="mood-app-header">
        <div className="mood-app-left-controls">
          <span className="mood-app-mark" aria-hidden="true" />
          <AudioToggle />
        </div>
        <div className="mood-app-controls">
          <ModeToggle
            activeMode={activeMode}
            clusterCount={clusteredBeachCount}
            onChange={setActiveMode}
          />
        </div>
      </header>

      <section className={`mood-mode-layer ${activeMode === "mood" ? "is-active" : ""}`} aria-hidden={activeMode !== "mood"}>
        <MoodCanvasShell
          beaches={beaches}
          moodPhrase={moodPhrase}
          activityHint={activityHint}
          companionHint={companionHint}
          selectedBeachSlug={selectedBeachSlug}
          onBeachSelect={handleBeachSelect}
          onBeachAddToCluster={handleQuickAddBeachToCluster}
        />
      </section>

      <section className={`mood-mode-layer ${activeMode === "clusters" ? "is-active" : ""}`} aria-hidden={activeMode !== "clusters"}>
        <ClusterTray
          clusters={clusters}
          beachesBySlug={beachesBySlug}
          selectedBeach={selectedBeach}
          loading={clustersLoading}
          error={clusterError}
          onCreate={() => setIsClusterDialogOpen(true)}
          onDelete={handleDeleteCluster}
          onAddBeach={handleAddBeachToCluster}
          onRemoveBeach={handleRemoveBeachFromCluster}
        />
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

      {selectedBeach && activeMode !== "clusters" && (
        <BeachInfoTile
          beach={selectedBeach}
          isGenerating={isGenerating}
          onClose={() => {
            setSelectedBeachSlug("");
            setSelectedBeachName("");
            setSelectedBeachData(null);
          }}
          onGenerate={handleGeneratePostcard}
          onAddToCluster={handleOpenClusterAdd}
        />
      )}

      {activeMode !== "clusters" && (
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

      <CreateClusterDialog
        isOpen={isClusterDialogOpen}
        selectedBeach={selectedBeach}
        moodPhrase={moodPhrase}
        isSubmitting={isClusterSaving}
        error={clusterError}
        onClose={() => setIsClusterDialogOpen(false)}
        onCreate={handleCreateCluster}
      />
    </main>
  );
}
