import { useEffect, useMemo, useRef, useState } from "react";

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
const DRAG_THRESHOLD = 4;
const TILE_POSITIONS_KEY = "beachplease_tile_positions";

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

export default function MoodCanvasShell({
  beaches = [],
  moodPhrase = "",
  activityHint = "",
  companionHint = "",
  selectedBeachSlug = "",
  onBeachSelect,
  onBeachAddToCluster,
}) {
  const viewportRef = useRef(null);
  const dragRef = useRef(null);
  const tileDragRef = useRef(null);
  const suppressClickRef = useRef(false);
  const [tilePositions, setTilePositions] = useState(loadTilePositions);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  const tiles = useMemo(
    () => (beaches.length ? beaches : normalizeBeachesForCanvas(FALLBACK_BEACH_SEED, [])).slice(0, 50),
    [beaches],
  );

  const displayTiles = useMemo(() => {
    const scoredTiles = tiles.map((tile) => {
      const score = getMatchScore(tile, moodPhrase, activityHint, companionHint);
      return { tile, score };
    });
    const hasChipCluster = Boolean(activityHint || companionHint);
    const matchedTiles = hasChipCluster ? scoredTiles.filter(({ score }) => score > 0) : [];

    return scoredTiles.map(({ tile, score }) => {
      const clusterIndex = matchedTiles.findIndex((match) => match.tile.slug === tile.slug);
      const clusteredPosition = hasChipCluster && clusterIndex >= 0
        ? getClusteredPosition(tile, clusterIndex, matchedTiles.length)
        : null;

      return {
        tile,
        score,
        clusteredPosition,
        hasChipCluster,
      };
    });
  }, [activityHint, companionHint, moodPhrase, tiles]);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return undefined;

    function updateSize() {
      const rect = element.getBoundingClientRect();
      setPan({
        x: rect.width / 2 - WORLD_W * 0.46,
        y: rect.height / 2 - WORLD_H * 0.48,
      });
    }

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  function handlePointerDown(event) {
    if (event.button !== 0) return;
    if (event.target.closest(".beach-image-tile")) return;

    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
      active: false,
    };
    suppressClickRef.current = false;
  }

  function handlePointerMove(event) {
    if (tileDragRef.current) {
      const dx = (event.clientX - tileDragRef.current.startX) / zoom;
      const dy = (event.clientY - tileDragRef.current.startY) / zoom;

      if (!tileDragRef.current.active && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
        tileDragRef.current.active = true;
        setIsDragging(true);
        setHasInteracted(true);
      }

      if (tileDragRef.current.active) {
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
      setHasInteracted(true);
    }

    if (dragRef.current.active) {
      setPan({
        x: dragRef.current.panX + dx,
        y: dragRef.current.panY + dy,
      });
    }
  }

  function handlePointerUp(event) {
    if (tileDragRef.current) {
      const wasDragging = tileDragRef.current.active;
      if (tileDragRef.current.nextPositions) {
        saveTilePositions(tileDragRef.current.nextPositions);
      }
      tileDragRef.current = null;
      setIsDragging(false);

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
    setHasInteracted(true);

    const rect = viewportRef.current.getBoundingClientRect();
    const cursorX = event.clientX - rect.left;
    const cursorY = event.clientY - rect.top;
    const factor = event.deltaY < 0 ? 1.1 : 1 / 1.1;
    const nextZoom = clamp(zoom * factor, MIN_ZOOM, MAX_ZOOM);
    const worldX = (cursorX - pan.x) / zoom;
    const worldY = (cursorY - pan.y) / zoom;

    setZoom(nextZoom);
    setPan({
      x: cursorX - worldX * nextZoom,
      y: cursorY - worldY * nextZoom,
    });
  }

  function handleTileClick(tile, event) {
    if (suppressClickRef.current || dragRef.current?.active || tileDragRef.current?.active || isDragging) {
      event.preventDefault();
      return;
    }
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
      active: false,
      nextPositions: null,
    };
    suppressClickRef.current = false;
  }

  function handleTileKeyDown(tile, event) {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    onBeachSelect?.(tile);
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
      <div
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
            <div
              key={tile.id}
              role="button"
              tabIndex={0}
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
              onPointerDown={(event) => handleTilePointerDown(tile, tilePosition, event)}
              onClick={(event) => handleTileClick(tile, event)}
              onKeyDown={(event) => handleTileKeyDown(tile, event)}
            >
              <button
                type="button"
                className="beach-tile-add-button"
                aria-label={`Add ${tile.name} to cluster`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={(event) => {
                  event.stopPropagation();
                  onBeachAddToCluster?.(tile);
                }}
              >
                +
              </button>
              <img
                src={imageUrl}
                alt=""
                draggable="false"
                onError={(event) => {
                  if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
                    event.currentTarget.src = FALLBACK_IMAGE;
                  }
                }}
              />
              <span className="beach-image-tile__label">{tile.name.toLowerCase()}</span>
              <span className="beach-image-tile__bubble">
                <strong>{matchPercent ? `${matchPercent}% match` : tile.name.toLowerCase()}</strong>
                <small>{formatConditionLine(tile)}</small>
                <small>{tile.region || "sydney"}</small>
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
