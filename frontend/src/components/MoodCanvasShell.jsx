import { useEffect, useMemo, useRef, useState } from "react";

import ParallaxBeachTile from "@/components/ParallaxBeachTile";
import {
  FALLBACK_BEACH_SEED,
  VIBE_KEYWORDS,
  hashString,
  normalizeBeachesForCanvas,
} from "@/utils/beachAdapter";

const FALLBACK_IMAGE = "/landing-scroll.jpg";
const WORLD_W = 2900;
const WORLD_H = 2000;
const MIN_ZOOM = 0.2;
const MAX_ZOOM = 5;
const DEFAULT_ZOOM = 1.16;
const DRAG_THRESHOLD = 6;
const TILE_POSITIONS_KEY = "beachplease_tile_positions";
const VIEWPORT_STATE_KEY = "beachplease_mood_canvas_viewport_v2";
const FOCUS_ANIMATION_MS = 520;

const ACTIVITY_TO_VIBES = {
  swim: ["calm", "active", "family"],
  surf: ["active", "adventure", "social"],
  relax: ["solo", "calm", "artistic"],
  snorkel: ["calm", "adventure"],
  walk: ["active", "artistic", "adventure"],
};

const COMPANION_TO_VIBES = {
  solo: ["solo", "calm"],
  partner: ["artistic", "calm"],
  family: ["family", "calm"],
  dog: ["adventure", "solo"],
  mates: ["social", "active"],
};

function rotationForSlug(slug = "") {
  return ((hashString(slug) % 13) - 6) * 0.42;
}

function imageToneForSlug(slug = "") {
  const index = hashString(slug) % 7;
  return [
    "saturate(0.92) contrast(0.98)",
    "saturate(0.72) sepia(0.18) brightness(0.88)",
    "saturate(1.12) contrast(1.04)",
    "saturate(0.82) hue-rotate(12deg) brightness(0.95)",
    "saturate(1.04) hue-rotate(-10deg)",
    "saturate(0.62) contrast(1.08) brightness(0.78)",
    "saturate(1.22) brightness(1.06)",
  ][index];
}

function imagePositionForSlug(slug = "") {
  const x = 25 + (hashString(slug) % 55);
  const y = 30 + (hashString(`${slug}-y`) % 45);
  return `${x}% ${y}%`;
}

function textMatches(text = "", keywords = []) {
  const normalized = text.toLowerCase();
  return keywords.some((keyword) => normalized.includes(keyword));
}

function getMatchScore(tile, moodPhrase, activityHint, companionHint) {
  const hasInput = Boolean(moodPhrase.trim() || activityHint || companionHint);
  if (!hasInput) return 1;

  let hits = 0;
  const tileText = [
    tile.name,
    tile.region,
    tile.suburb,
    tile.vibe,
    tile.exposure,
    tile.water_type,
    ...(tile.vibe_tags || []),
    ...(tile.best_for || []),
    ...(tile.facilities || []),
    ...(tile.access_tags || []),
  ].join(" ").toLowerCase();

  const words = moodPhrase.toLowerCase().split(/\s+/).filter((word) => word.length > 3);
  hits += words.filter((word) => tileText.includes(word)).length;

  if (activityHint && ACTIVITY_TO_VIBES[activityHint]?.includes(tile.vibe)) hits += 2;
  if (companionHint && COMPANION_TO_VIBES[companionHint]?.includes(tile.vibe)) hits += 2;
  if (textMatches(moodPhrase, VIBE_KEYWORDS[tile.vibe])) hits += 2;

  return hits;
}

function getClusteredPosition(tile, clusterIndex, totalMatches) {
  const seed = hashString(tile.slug || tile.name);
  const ring = Math.floor(clusterIndex / 10);
  const positionInRing = clusterIndex % 10;
  const itemsInRing = Math.min(10, Math.max(1, totalMatches - ring * 10));
  const angle = (positionInRing / itemsInRing) * Math.PI * 2 + (ring * 0.55);
  const radius = 150 + ring * 138 + (seed % 36);

  return {
    x: WORLD_W * 0.5 + Math.cos(angle) * radius,
    y: WORLD_H * 0.48 + Math.sin(angle) * radius * 0.78,
  };
}

function formatConditionLine(beach) {
  const parts = [];

  if (beach.temp !== null && beach.temp !== undefined) {
    parts.push(`${beach.temp}°C`);
  }
  if (beach.waves !== null && beach.waves !== undefined) {
    parts.push(`${beach.waves}m`);
  }
  if (beach.crowd?.label) {
    parts.push(beach.crowd.label);
  }

  return parts.length ? parts.join(" · ") : beach.region || "active · sydney";
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function loadTilePositions() {
  try {
    if (typeof window === "undefined") return {};
    const stored = window.localStorage.getItem(TILE_POSITIONS_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveTilePositions(positions) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(TILE_POSITIONS_KEY, JSON.stringify(positions));
  } catch {
    // Position persistence is nice-to-have; the canvas still works without it.
  }
}

function loadViewportState() {
  try {
    if (typeof window === "undefined") return null;
    const stored = window.sessionStorage.getItem(VIEWPORT_STATE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

function saveViewportState(state) {
  try {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(VIEWPORT_STATE_KEY, JSON.stringify(state));
  } catch {
    // Viewport restore is only for polish.
  }
}

export default function MoodCanvasShell({
  beaches = [],
  moodPhrase = "",
  activityHint = "",
  companionHint = "",
  selectedBeachSlug = "",
  clusters = [],
  focusedClusterId = "",
  onBeachSelect,
  onBeachAddToCluster,
  onBeachDropToCluster,
  onClusterFocus,
}) {
  const viewportRef = useRef(null);
  const worldRef = useRef(null);
  const dragRef = useRef(null);
  const tileDragRef = useRef(null);
  const displayTilesRef = useRef([]);
  const suppressClickRef = useRef(false);
  const panAnimationRef = useRef(null);
  const initialViewportRef = useRef(loadViewportState());
  const panRef = useRef(initialViewportRef.current?.pan || { x: 0, y: 0 });
  const zoomRef = useRef(initialViewportRef.current?.zoom || DEFAULT_ZOOM);
  const [tilePositions, setTilePositions] = useState(loadTilePositions);
  const [pan, setPan] = useState(panRef.current);
  const [zoom, setZoom] = useState(zoomRef.current);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [draggingBeach, setDraggingBeach] = useState(null);
  const [hoveredClusterId, setHoveredClusterId] = useState("");

  const clusterBadgesBySlug = useMemo(() => {
    const nextBadges = {};
    clusters.forEach((cluster) => {
      const id = cluster._id || cluster.id || cluster.name;
      (cluster.beach_slugs || []).forEach((slug) => {
        if (!nextBadges[slug]) nextBadges[slug] = [];
        nextBadges[slug].push({
          id,
          name: cluster.name,
          color: cluster.color || "#91C059",
        });
      });
    });
    return nextBadges;
  }, [clusters]);

  const focusedCluster = useMemo(
    () => clusters.find((cluster) => (cluster._id || cluster.id || cluster.name) === focusedClusterId) || null,
    [clusters, focusedClusterId],
  );

  const tiles = useMemo(
    () => (beaches.length ? beaches : normalizeBeachesForCanvas(FALLBACK_BEACH_SEED, [])).slice(0, 50),
    [beaches],
  );

  const displayTiles = useMemo(() => {
    const scoredTiles = tiles.map((tile) => {
      const score = getMatchScore(tile, moodPhrase, activityHint, companionHint);
      return { tile, score };
    });
    const focusedSlugs = new Set(focusedCluster?.beach_slugs || []);
    const hasChipCluster = Boolean(activityHint || companionHint || focusedCluster);
    const matchedTiles = hasChipCluster
      ? scoredTiles.filter(({ score, tile }) => (focusedCluster ? focusedSlugs.has(tile.slug) : score > 0))
      : [];

    return scoredTiles.map(({ tile, score }) => {
      const clusterMatch = focusedCluster ? focusedSlugs.has(tile.slug) : score > 0;
      const clusterIndex = matchedTiles.findIndex((match) => match.tile.slug === tile.slug);
      const clusteredPosition = hasChipCluster && clusterIndex >= 0
        ? getClusteredPosition(tile, clusterIndex, matchedTiles.length)
        : null;

      return {
        tile,
        score: focusedCluster && !clusterMatch ? 0 : score,
        clusteredPosition,
        hasChipCluster,
      };
    });
  }, [activityHint, companionHint, focusedCluster, moodPhrase, tiles]);

  useEffect(() => {
    displayTilesRef.current = displayTiles;
  }, [displayTiles]);

  useEffect(() => {
    applyViewport(panRef.current, zoomRef.current);
  }, []);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return undefined;

    function updateSize() {
      if (initialViewportRef.current?.pan) return;
      const rect = element.getBoundingClientRect();
      applyViewport({
        x: rect.width / 2 - WORLD_W * 0.46 * zoomRef.current,
        y: rect.height / 2 - WORLD_H * 0.48 * zoomRef.current,
      }, zoomRef.current, { commitState: true });
    }

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (selectedBeachSlug) {
      focusBeachBySlug(selectedBeachSlug);
    }
  }, [selectedBeachSlug]);

  useEffect(() => () => cancelPanAnimation(), []);

  function markInteraction() {
    cancelPanAnimation();
    setHasInteracted(true);
  }

  function cancelPanAnimation() {
    if (panAnimationRef.current) {
      window.cancelAnimationFrame(panAnimationRef.current);
      panAnimationRef.current = null;
    }
  }

  function applyViewport(nextPan, nextZoom = zoomRef.current, options = {}) {
    const { commitState = false } = options;
    panRef.current = nextPan;
    zoomRef.current = nextZoom;

    if (worldRef.current) {
      worldRef.current.style.setProperty("--pan-x", `${nextPan.x}px`);
      worldRef.current.style.setProperty("--pan-y", `${nextPan.y}px`);
      worldRef.current.style.setProperty("--zoom", nextZoom);
    }

    saveViewportState({ pan: nextPan, zoom: nextZoom });

    if (commitState) {
      setPan(nextPan);
      setZoom(nextZoom);
    }
  }

  function animatePanTo(nextPan, options = {}) {
    const { immediate = false } = options;
    cancelPanAnimation();

    if (immediate) {
      applyViewport(nextPan, zoomRef.current, { commitState: true });
      return;
    }

    const startPan = { ...panRef.current };
    const startedAt = performance.now();
    const ease = (value) => 1 - Math.pow(1 - value, 3);

    function step(now) {
      const progress = clamp((now - startedAt) / FOCUS_ANIMATION_MS, 0, 1);
      const eased = ease(progress);

      const framePan = {
        x: startPan.x + (nextPan.x - startPan.x) * eased,
        y: startPan.y + (nextPan.y - startPan.y) * eased,
      };

      applyViewport(framePan, zoomRef.current, { commitState: progress >= 1 });

      if (progress < 1) {
        panAnimationRef.current = window.requestAnimationFrame(step);
        return;
      }

      panAnimationRef.current = null;
    }

    panAnimationRef.current = window.requestAnimationFrame(step);
  }

  function focusBeachBySlug(slug) {
    const match = displayTilesRef.current.find(({ tile }) => tile.slug === slug);
    if (!match || !viewportRef.current) return;

    const position = match.clusteredPosition || tilePositions[slug] || match.tile.moodPos;
    const rect = viewportRef.current.getBoundingClientRect();

    animatePanTo({
      x: rect.width / 2 - position.x * zoomRef.current,
      y: rect.height / 2 - position.y * zoomRef.current,
    });
  }

  function handlePointerDown(event) {
    if (event.button !== 0) return;
    if (event.target.closest(".beach-image-tile")) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
      active: false,
    };
    suppressClickRef.current = false;
    markInteraction();
  }

  function handlePointerMove(event) {
    if (tileDragRef.current) {
      const dx = (event.clientX - tileDragRef.current.startX) / zoomRef.current;
      const dy = (event.clientY - tileDragRef.current.startY) / zoomRef.current;

      if (!tileDragRef.current.active && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
        tileDragRef.current.active = true;
        setIsDragging(true);
        setDraggingBeach(tileDragRef.current.tile);
        markInteraction();
      }

      if (tileDragRef.current.active) {
        updateHoveredDropCluster(event);
        const nextPosition = {
          x: clamp(tileDragRef.current.originX + dx, 90, WORLD_W - 90),
          y: clamp(tileDragRef.current.originY + dy, 90, WORLD_H - 90),
        };

        setTilePositions((currentPositions) => {
          const nextPositions = {
            ...currentPositions,
            [tileDragRef.current.slug]: nextPosition,
          };
          tileDragRef.current.nextPositions = nextPositions;
          return nextPositions;
        });
      }
      return;
    }

    if (!dragRef.current) return;

    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;

    if (!dragRef.current.active && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
      dragRef.current.active = true;
      setIsDragging(true);
      markInteraction();
    }

    if (dragRef.current.active) {
      applyViewport({
        x: dragRef.current.panX + dx,
        y: dragRef.current.panY + dy,
      });
    }
  }

  function handlePointerUp(event) {
    if (tileDragRef.current) {
      const wasDragging = tileDragRef.current.active;
      const dropCluster = wasDragging ? getDropClusterFromPoint(event.clientX, event.clientY) : null;

      if (dropCluster) {
        const previousPositions = tileDragRef.current.previousPositions || {};
        setTilePositions(previousPositions);
        saveTilePositions(previousPositions);
        onBeachDropToCluster?.(dropCluster, tileDragRef.current.tile);
      } else if (tileDragRef.current.nextPositions) {
        const previousPositions = tileDragRef.current.previousPositions || {};
        setTilePositions(previousPositions);
        saveTilePositions(previousPositions);
      }
      tileDragRef.current = null;
      setIsDragging(false);
      setDraggingBeach(null);
      setHoveredClusterId("");

      if (wasDragging) {
        suppressClickRef.current = true;
        event.preventDefault();
        event.stopPropagation();
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 0);
      }
      return;
    }

    const wasDragging = dragRef.current?.active;
    dragRef.current = null;
    setIsDragging(false);

    if (wasDragging) {
      setPan(panRef.current);
      suppressClickRef.current = true;
      event.preventDefault();
      event.stopPropagation();
      window.setTimeout(() => {
        suppressClickRef.current = false;
      }, 0);
    }
  }

  function handleWheel(event) {
    event.preventDefault();
    markInteraction();

    const rect = viewportRef.current.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    const nextZoom = clamp(zoomRef.current * factor, MIN_ZOOM, MAX_ZOOM);
    const worldX = (cursorX - panRef.current.x) / zoomRef.current;
    const worldY = (cursorY - panRef.current.y) / zoomRef.current;

    applyViewport({
      x: cursorX - worldX * nextZoom,
      y: cursorY - worldY * nextZoom,
    }, nextZoom, { commitState: true });
  }

  function handleTileClick(tile, event) {
    if (suppressClickRef.current || dragRef.current?.active || tileDragRef.current?.active || isDragging) {
      event.preventDefault();
      return;
    }
    markInteraction();
    onBeachSelect?.(tile);
  }

  function handleTilePointerDown(tile, currentPosition, event) {
    if (event.button !== 0) return;
    if (event.target.closest(".beach-tile-add-button")) return;

    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);

    tileDragRef.current = {
      slug: tile.slug,
      startX: event.clientX,
      startY: event.clientY,
      originX: currentPosition.x,
      originY: currentPosition.y,
      tile,
      active: false,
      nextPositions: null,
      previousPositions: tilePositions,
    };
    suppressClickRef.current = false;
    markInteraction();
  }

  function handleTileKeyDown(tile, event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    markInteraction();
    onBeachSelect?.(tile);
  }

  function getDropClusterFromPoint(clientX, clientY) {
    const element = document.elementFromPoint(clientX, clientY);
    const dropTarget = element?.closest?.("[data-cluster-drop-id]");
    const clusterId = dropTarget?.getAttribute("data-cluster-drop-id");
    if (!clusterId) return null;
    return clusters.find((cluster) => (cluster._id || cluster.id || cluster.name) === clusterId) || null;
  }

  function updateHoveredDropCluster(event) {
    const dropCluster = getDropClusterFromPoint(event.clientX, event.clientY);
    setHoveredClusterId(dropCluster ? (dropCluster._id || dropCluster.id || dropCluster.name) : "");
  }

  return (
    <section
      ref={viewportRef}
      className={`mood-canvas-mode ${isDragging ? "is-dragging" : ""}`}
      aria-label="Mood beach canvas"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onWheel={handleWheel}
    >
      {!hasInteracted && <p className="mood-canvas-hint">drag to explore</p>}
      {clusters.length > 0 && (
        <div className="cluster-focus-strip" aria-label="Cluster filters">
          <button
            type="button"
            className={!focusedClusterId ? "is-active" : ""}
            onClick={() => onClusterFocus?.("")}
          >
            all
          </button>
          {clusters.map((cluster) => {
            const id = cluster._id || cluster.id || cluster.name;
            return (
              <button
                key={id}
                type="button"
                className={focusedClusterId === id ? "is-active" : ""}
                style={{ "--cluster-color": cluster.color || "#91C059" }}
                onClick={() => onClusterFocus?.(focusedClusterId === id ? "" : id)}
              >
                {cluster.name}
              </button>
            );
          })}
        </div>
      )}
      {draggingBeach && clusters.length > 0 && (
        <div className="cluster-drop-shelf" aria-label="Drop beach into a cluster">
          <p>drop {draggingBeach.name.toLowerCase()} into a cluster</p>
          <div>
            {clusters.map((cluster) => {
              const id = cluster._id || cluster.id || cluster.name;
              const alreadySaved = cluster.beach_slugs?.includes(draggingBeach.slug);
              return (
                <button
                  key={id}
                  type="button"
                  data-cluster-drop-id={id}
                  className={`${hoveredClusterId === id ? "is-hovered" : ""} ${alreadySaved ? "is-saved" : ""}`}
                  style={{ "--cluster-color": cluster.color || "#91C059" }}
                  onClick={() => onClusterFocus?.(id)}
                >
                  <strong>{cluster.name}</strong>
                  <span>{alreadySaved ? "already saved" : `${cluster.beach_slugs?.length || 0} beaches`}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div
        ref={worldRef}
        className="mood-canvas-world"
        style={{
          "--world-w": `${WORLD_W}px`,
          "--world-h": `${WORLD_H}px`,
          "--pan-x": `${pan.x}px`,
          "--pan-y": `${pan.y}px`,
          "--zoom": zoom,
        }}
      >
        {displayTiles.map(({ tile, score, clusteredPosition, hasChipCluster }) => {
          const hasInput = Boolean(moodPhrase.trim() || activityHint || companionHint);
          const matched = !hasInput || score > 0;
          const selected = tile.slug === selectedBeachSlug;
          const imageUrl = tile.imageUrl || FALLBACK_IMAGE;
          const matchPercent = hasInput && score > 0 ? Math.min(98, 55 + score * 14) : 0;
          const tilePosition = clusteredPosition || tilePositions[tile.slug] || tile.moodPos;

          return (
            <ParallaxBeachTile
              key={tile.id}
              tile={tile}
              className={`beach-image-tile ${selected ? "is-selected" : ""} ${matched ? "is-matched" : "is-muted"} ${hasInput && matched ? "is-highlighted" : ""} ${hasChipCluster && matched ? "is-clustered" : ""}`}
              style={{
                "--tile-x": `${tilePosition.x}px`,
                "--tile-y": `${tilePosition.y}px`,
                "--tile-rotate": `${rotationForSlug(tile.slug)}deg`,
                "--tile-accent": tile.accent,
                "--tile-glow": `${tile.accent}55`,
                "--tile-image-position": imagePositionForSlug(tile.slug),
                "--tile-image-filter": imageToneForSlug(tile.slug),
              }}
              imageUrl={imageUrl}
              matchLabel={matchPercent ? `${matchPercent}% match` : tile.name.toLowerCase()}
              conditionLine={formatConditionLine(tile)}
              regionLabel={tile.region || "sydney"}
              clusterBadges={clusterBadgesBySlug[tile.slug] || []}
              onPointerDown={(event) => handleTilePointerDown(tile, tilePosition, event)}
              onClick={(event) => handleTileClick(tile, event)}
              onKeyDown={(event) => handleTileKeyDown(tile, event)}
              onAddToCluster={onBeachAddToCluster}
            />
          );
        })}
      </div>
    </section>
  );
}
