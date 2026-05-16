import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getBeaches, getCachedBeaches } from "@/api/beaches";
import {
  createCluster,
  getCachedClusters,
  getClusters,
  updateCluster,
} from "@/api/clusters";
import { getCondition } from "@/api/conditions";
import { createPlan, generatePlanPreview } from "@/api/plans";
import BeachInfoTile from "@/components/BeachInfoTile";
import CircularBeachCanvas from "@/components/CircularBeachCanvas";
import ClusterPickerDialog from "@/components/ClusterPickerDialog";
import ClusterStackGallery from "@/components/ClusterStackGallery";
import CreateClusterDialog from "@/components/CreateClusterDialog";
import MapboxBeachMap from "@/components/map/MapboxBeachMap";
import ModeToggle from "@/components/ModeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { normalizeBeach, normalizeBeachesForCanvas } from "@/utils/beachAdapter";
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
const EXPERIENCE_MODES = new Set(["cluster", "canvas", "map"]);

function getClusterId(cluster) {
  return cluster?._id || cluster?.id;
}

function uniqueBeachSlugs(slugs = []) {
  return Array.from(new Set(slugs.filter(Boolean)));
}

export default function MainExperience({ visible = false, modeOverride = "", onPlanGenerated }) {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { mode } = useParams();
  const routeMode = mode === "mood" ? "canvas" : mode;
  const activeMode = modeOverride || (EXPERIENCE_MODES.has(routeMode) ? routeMode : "canvas");
  const [moodPhrase, setMoodPhrase] = useState("");
  const [isMoodPanelOpen, setIsMoodPanelOpen] = useState(false);
  const [selectedBeachSlug, setSelectedBeachSlug] = useState("");
  const [selectedBeachName, setSelectedBeachName] = useState("");
  const [selectedBeachData, setSelectedBeachData] = useState(null);
  const [activityHint, setActivityHint] = useState("");
  const [companionHint, setCompanionHint] = useState("");
  const [beaches, setBeaches] = useState(() => normalizeBeachesForCanvas(getCachedBeaches() || [], []));
  const [mapFallbackActive, setMapFallbackActive] = useState(false);
  const [clusters, setClusters] = useState(() => (token ? getCachedClusters() || [] : []));
  const [clustersLoading, setClustersLoading] = useState(false);
  const [clusterError, setClusterError] = useState("");
  const [conditionsBySlug, setConditionsBySlug] = useState({});
  const [loadingConditionSlugs, setLoadingConditionSlugs] = useState({});
  const [isClusterDialogOpen, setIsClusterDialogOpen] = useState(false);
  const [editingCluster, setEditingCluster] = useState(null);
  const [focusedClusterId, setFocusedClusterId] = useState("");
  const [clusterPickerBeach, setClusterPickerBeach] = useState(null);
  const [isClusterSaving, setIsClusterSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationInput, setGenerationInput] = useState(null);
  const [error, setError] = useState("");
  const useMocks = import.meta.env.VITE_USE_MOCKS === "true";
  const previousModeRef = useRef(activeMode);

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

  const selectedBeachClusters = useMemo(
    () => {
      if (!selectedBeach?.slug) return [];
      return clusters.filter((cluster) => (
        Array.isArray(cluster.beach_slugs) && cluster.beach_slugs.includes(selectedBeach.slug)
      ));
    },
    [clusters, selectedBeach],
  );

  useEffect(() => {
    let cancelled = false;

    async function loadBeachData() {
      try {
        const beachResponse = await getBeaches();
        if (cancelled) return;

        const nextBeaches = Array.isArray(beachResponse) ? beachResponse : [];
        setBeaches(normalizeBeachesForCanvas(nextBeaches, []));
        setMapFallbackActive(true);
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
        setClusters([]);
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
          setClusterError(caughtError?.response?.data?.detail || "Couldn't load clusters.");
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

  useEffect(() => {
    if (mode && !EXPERIENCE_MODES.has(mode)) {
      navigate("/explore/canvas", { replace: true });
    }
  }, [mode, navigate]);

  useEffect(() => {
    if (previousModeRef.current !== activeMode) {
      setSelectedBeachSlug("");
      setSelectedBeachName("");
      setSelectedBeachData(null);
      previousModeRef.current = activeMode;
    }
  }, [activeMode]);

  async function hydrateBeachConditions(beach) {
    if (!beach?.slug) return;
    if (loadingConditionSlugs[beach.slug]) return;
    if (conditionsBySlug[beach.slug] && !conditionsBySlug[beach.slug]?.conditions_unavailable) return;

    setLoadingConditionSlugs((currentSlugs) => ({
      ...currentSlugs,
      [beach.slug]: true,
    }));

    try {
      const condition = await getCondition(beach.slug);
      setConditionsBySlug((currentConditions) => ({
        ...currentConditions,
        [beach.slug]: condition,
      }));
      if (condition?.conditions_unavailable) {
        setSelectedBeachData((currentBeach) => (
          currentBeach?.slug === beach.slug
            ? normalizeBeach(currentBeach, { [beach.slug]: condition }, 0)
            : currentBeach
        ));
        return;
      }

      setBeaches((currentBeaches) => currentBeaches.map((currentBeach, index) => (
        currentBeach.slug === beach.slug
          ? normalizeBeach(currentBeach, { [beach.slug]: condition }, index)
          : currentBeach
      )));
      setSelectedBeachData((currentBeach) => (
        currentBeach?.slug === beach.slug
          ? normalizeBeach(currentBeach, { [beach.slug]: condition }, 0)
          : currentBeach
      ));
    } catch {
      setSelectedBeachData((currentBeach) => (
        currentBeach?.slug === beach.slug
          ? { ...currentBeach, conditions_unavailable: true }
          : currentBeach
      ));
    } finally {
      setLoadingConditionSlugs((currentSlugs) => ({
        ...currentSlugs,
        [beach.slug]: false,
      }));
    }
  }

  function handleBeachSelect(beach) {
    setSelectedBeachSlug(beach.slug || "");
    setSelectedBeachName(beach.name || "");
    setSelectedBeachData(beach);
    hydrateBeachConditions(beach);
  }

  function buildGenerationPayload() {
    return buildPlanPayloadFromCanvas({
      moodPhrase,
      activityHint,
      companionHint,
      selectedBeach,
    });
  }

  function revealGeneratedPlan(plan, payload) {
    onPlanGenerated?.(plan, payload);
    setIsGenerating(false);
  }

  async function handleGeneratePostcard() {
    if (isGenerating) return;

    const payload = buildGenerationPayload();
    setGenerationInput(payload);
    setIsGenerating(true);
    setError("");
    setSelectedBeachSlug("");
    setSelectedBeachName("");
    setSelectedBeachData(null);

    if (useMocks || !token) {
      window.setTimeout(() => {
        const fallbackBeach = beaches.find((beach) => beach.slug === highlightedBeachSlugs[0]) || beaches[0];
        const mockPlan = buildGuestPlanFromCanvas({
          payload,
          selectedBeach,
          fallbackBeach,
          requiresAuthToSave: !token,
        });
        revealGeneratedPlan(mockPlan, payload);
      }, 800);
      return;
    }

    try {
      const previewPlan = await generatePlanPreview(payload);
      revealGeneratedPlan(previewPlan, payload);
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn't generate a postcard right now.");
      setIsGenerating(false);
    }
  }

  async function handleCreatePlanFromMenu(form) {
    if (!token) {
      navigate("/login");
      return;
    }

    const notes = [
      form.mood,
      form.food ? `food/drink: ${form.food}` : "",
      form.notes ? `notes: ${form.notes}` : "",
    ].filter(Boolean).join(" · ");
    const payload = {
      mood_phrase: notes || form.mood,
      region: form.locality,
      activity: form.activity,
      companion: form.companion,
      selected_mood: form.mood,
      companion_context: form.companion,
      experience_tags: [form.food, form.notes].filter(Boolean),
    };

    setGenerationInput(payload);
    setIsGenerating(true);
    setError("");

    try {
      const savedPlan = await createPlan(payload);
      revealGeneratedPlan(savedPlan, payload);
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn't create that plan right now.");
      setIsGenerating(false);
    }
  }

  function handleCreateRitualFromMenu(form) {
    const existing = JSON.parse(window.localStorage.getItem("beachplease_rituals") || "[]");
    const ritual = {
      id: crypto.randomUUID?.() || `${Date.now()}`,
      ...form,
      createdAt: new Date().toISOString(),
    };
    window.localStorage.setItem("beachplease_rituals", JSON.stringify([ritual, ...existing]));
  }

  async function handleCreateCluster(payload, options = {}) {
    if (isClusterSaving) return;

    const { activate = true } = options;
    if (!token) {
      navigate("/login");
      return;
    }

    setIsClusterSaving(true);
    setClusterError("");

    try {
      const createdCluster = await createCluster(payload);
      setClusters((currentClusters) => [{ ...payload, ...createdCluster }, ...currentClusters]);
      setIsClusterDialogOpen(false);
      if (activate) navigate("/explore/canvas");
    } catch (caughtError) {
      setClusterError(caughtError?.response?.data?.detail || "Couldn't create that cluster.");
    } finally {
      setIsClusterSaving(false);
    }
  }

  async function handleAddBeachToCluster(cluster, beach) {
    if (!cluster || !beach?.slug) return;
    if (!token) {
      navigate("/login");
      return;
    }

    const clusterId = getClusterId(cluster);
    if ((cluster.beach_slugs || []).includes(beach.slug)) return;
    const beachSlugs = uniqueBeachSlugs([...(cluster.beach_slugs || []), beach.slug]);
    setClusterError("");

    try {
      const updatedCluster = await updateCluster(clusterId, { beach_slugs: beachSlugs });
      setClusters((currentClusters) => currentClusters.map((currentCluster) => (
        getClusterId(currentCluster) === clusterId ? updatedCluster : currentCluster
      )));
    } catch (caughtError) {
      setClusterError(caughtError?.response?.data?.detail || "Couldn't add that beach.");
    }
  }

  async function handleUpdateCluster(cluster, payload) {
    const clusterId = getClusterId(cluster);
    if (!clusterId) return;
    if (!token) {
      navigate("/login");
      return;
    }

    setIsClusterSaving(true);
    setClusterError("");

    try {
      const updatedCluster = await updateCluster(clusterId, payload);
      const nextCluster = { ...updatedCluster, ...payload };
      setClusters((currentClusters) => currentClusters.map((currentCluster) => (
        getClusterId(currentCluster) === clusterId ? nextCluster : currentCluster
      )));
      setEditingCluster(null);
      setIsClusterDialogOpen(false);
    } catch (caughtError) {
      setClusterError(caughtError?.response?.data?.detail || "Couldn't update that cluster.");
    } finally {
      setIsClusterSaving(false);
    }
  }

  async function handleRemoveBeachFromCluster(cluster, beachSlug) {
    const clusterId = getClusterId(cluster);
    if (!clusterId || !beachSlug) return;
    if (!token) {
      navigate("/login");
      return;
    }

    const beachSlugs = (cluster.beach_slugs || []).filter((slug) => slug !== beachSlug);
    setClusterError("");

    try {
      const updatedCluster = await updateCluster(clusterId, { beach_slugs: beachSlugs });
      setClusters((currentClusters) => currentClusters.map((currentCluster) => (
        getClusterId(currentCluster) === clusterId ? updatedCluster : currentCluster
      )));
    } catch (caughtError) {
      setClusterError(caughtError?.response?.data?.detail || "Couldn't remove that beach.");
    }
  }

  function handleOpenClusterAdd() {
    if (!token) {
      navigate("/login");
      return;
    }

    if (clusters.length === 0) {
      setIsClusterDialogOpen(true);
      return;
    }
    if (selectedBeach) {
      if (clusters.length === 1) {
        handleAddBeachToCluster(clusters[0], selectedBeach);
        return;
      }
      setClusterPickerBeach(selectedBeach);
    }
  }

  function handleQuickAddBeachToCluster(beach) {
    if (!beach?.slug) return;
    if (!token) {
      navigate("/login");
      return;
    }

    if (clusters.length === 0) {
      handleCreateCluster({
        name: "my beaches",
        description: "quick saves from the canvas",
        mood_phrase: moodPhrase,
        color: "#ADD0EE",
        beach_slugs: [beach.slug],
      }, { activate: false });
      return;
    }

    if (clusters.length === 1) {
      handleAddBeachToCluster(clusters[0], beach);
      return;
    }

    setClusterPickerBeach(beach);
  }

  function handleCreateClusterFromPicker() {
    setSelectedBeachSlug(clusterPickerBeach?.slug || "");
    setSelectedBeachName(clusterPickerBeach?.name || "");
    setSelectedBeachData(clusterPickerBeach);
    setClusterPickerBeach(null);
    setIsClusterDialogOpen(true);
  }

  return (
    <main className={`main-app-shell mood-app-shell ${visible ? "is-visible" : ""} ${selectedBeach && activeMode === "canvas" ? "has-canvas-selection" : ""} ${isGenerating ? "is-generating-plan" : ""}`}>
      {activeMode !== "cluster" && (
        <div className="explore-mode-pill">
          <ModeToggle
            activeMode={activeMode}
            onChange={(nextMode) => navigate(`/explore/${nextMode}`)}
          />
        </div>
      )}

      <section className={`mood-mode-layer ${activeMode === "canvas" ? "is-active" : ""}`} aria-hidden={activeMode !== "canvas"}>
        <CircularBeachCanvas
          beaches={beaches}
          moodPhrase={moodPhrase}
          activityHint={activityHint}
          companionHint={companionHint}
          selectedBeachSlug={selectedBeachSlug}
          isFocused={Boolean(selectedBeach)}
          isGenerating={isGenerating}
          clusters={clusters}
          focusedClusterId={focusedClusterId}
          onBeachSelect={handleBeachSelect}
          onBeachAddToCluster={handleQuickAddBeachToCluster}
          onClusterFocus={setFocusedClusterId}
        />
      </section>

      <section className={`mood-mode-layer ${activeMode === "cluster" ? "is-active" : ""}`} aria-hidden={activeMode !== "cluster"}>
        <ClusterStackGallery
          beaches={beaches}
          onCreateCluster={() => {
            if (!token) {
              navigate("/login");
              return;
            }
            setIsClusterDialogOpen(true);
          }}
          onCreatePlan={handleCreatePlanFromMenu}
          onCreateRitual={handleCreateRitualFromMenu}
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

      {selectedBeach && activeMode !== "cluster" && (
        <BeachInfoTile
          beach={selectedBeach}
          conditionLoading={Boolean(loadingConditionSlugs[selectedBeach.slug])}
          isGenerating={isGenerating}
          clusterMembership={selectedBeachClusters}
          variant={activeMode === "canvas" || activeMode === "cluster" ? "overlay" : "drawer"}
          onClose={() => {
            setSelectedBeachSlug("");
            setSelectedBeachName("");
            setSelectedBeachData(null);
          }}
          onGenerate={handleGeneratePostcard}
          onAddToCluster={handleOpenClusterAdd}
        />
      )}

      {activeMode !== "cluster" && (
        <form
          className={`mood-input-bar ${selectedBeach ? "has-info-tile" : ""} ${isMoodPanelOpen ? "is-open" : ""}`}
          onSubmit={(event) => {
            event.preventDefault();
            if (!isMoodPanelOpen) {
              setIsMoodPanelOpen(true);
              return;
            }
            handleGeneratePostcard();
          }}
        >
          {isMoodPanelOpen && (
            <>
              <input
                value={moodPhrase}
                placeholder="what kind of beach day do you need?"
                onChange={(event) => setMoodPhrase(event.target.value)}
                autoFocus
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
            </>
          )}
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? "generating plan..." : "Find My Beach"}
          </Button>
        </form>
      )}

      {error && <p className="home-error" role="alert">{error}</p>}

      <CreateClusterDialog
        isOpen={isClusterDialogOpen || Boolean(editingCluster)}
        cluster={editingCluster}
        selectedBeach={selectedBeach || clusterPickerBeach}
        moodPhrase={moodPhrase}
        isSubmitting={isClusterSaving}
        error={clusterError}
        onClose={() => {
          setIsClusterDialogOpen(false);
          setEditingCluster(null);
        }}
        onCreate={handleCreateCluster}
        onUpdate={handleUpdateCluster}
      />

      <ClusterPickerDialog
        isOpen={Boolean(clusterPickerBeach)}
        beach={clusterPickerBeach}
        clusters={clusters}
        onClose={() => setClusterPickerBeach(null)}
        onCreateNew={handleCreateClusterFromPicker}
        onPick={(cluster) => {
          const beachToAdd = clusterPickerBeach;
          setClusterPickerBeach(null);
          handleAddBeachToCluster(cluster, beachToAdd);
        }}
      />
    </main>
  );
}
