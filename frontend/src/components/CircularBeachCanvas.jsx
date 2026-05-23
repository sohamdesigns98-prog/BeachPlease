import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import CircularBeachTile from "@/components/CircularBeachTile";
import {
  FALLBACK_BEACH_SEED,
  VIBE_KEYWORDS,
  hashString,
  normalizeBeachesForCanvas,
} from "@/utils/beachAdapter";

const FALLBACK_IMAGE = "/landing-scroll.jpg";
const VISIBLE_TILE_COUNT = 28;

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

function scatterForTile(tile, index) {
  const seed = hashString(`${tile.slug || tile.name}-${index}`);
  const side = seed % 4;
  const spreadX = 360 + (seed % 260);
  const spreadY = 230 + ((seed * 7) % 210);
  const x = side === 0 ? -spreadX : side === 1 ? spreadX : ((seed % 520) - 260);
  const y = side === 2 ? -spreadY : side === 3 ? spreadY : (((seed * 3) % 360) - 180);

  return {
    x,
    y,
    rotate: ((seed % 36) - 18) * 0.8,
  };
}

function circleLayout(index, total, phase = 0) {
  const angle = (index / total) * Math.PI * 2 - Math.PI / 2 + phase;
  const depth = Math.sin(angle);
  const radiusX = 330;
  const radiusY = 255;

  return {
    x: Math.cos(angle) * radiusX,
    y: Math.sin(angle) * radiusY * 0.92,
    rotate: 0,
    scale: 0.82 + ((depth + 1) * 0.14),
    zIndex: Math.round((depth + 1) * 40),
    shadow: `${Math.max(8, 18 + depth * 18)}px ${Math.max(18, 32 + depth * 24)}px ${Math.max(34, 58 + depth * 28)}px rgb(17 17 17 / ${0.08 + ((depth + 1) * 0.04)})`,
  };
}

function formatConditionLine(beach) {
  const parts = [];
  if (beach.temp !== null && beach.temp !== undefined) parts.push(`${beach.temp}°C`);
  if (beach.waves !== null && beach.waves !== undefined) parts.push(`${beach.waves}m`);
  if (beach.crowd?.label) parts.push(beach.crowd.label);
  return parts.length ? parts.join(" · ") : beach.region || "active · sydney";
}

export default function CircularBeachCanvas({
  beaches = [],
  moodPhrase = "",
  activityHint = "",
  companionHint = "",
  selectedBeachSlug = "",
  isFocused = false,
  isGenerating = false,
  clusters = [],
  focusedClusterId = "",
  onBeachSelect,
  onBeachAddToCluster,
  onClusterFocus,
}) {
  const prefersReducedMotion = useReducedMotion();
  const [isAssembled, setIsAssembled] = useState(Boolean(prefersReducedMotion));
  const [hoveredSlug, setHoveredSlug] = useState("");
  const [rotationPhase, setRotationPhase] = useState(0);
  const phaseRef = useRef(0);
  const lastFrameRef = useRef(0);
  const lastPaintRef = useRef(0);

  const tiles = useMemo(
    () => (beaches.length ? beaches : normalizeBeachesForCanvas(FALLBACK_BEACH_SEED, [])).slice(0, VISIBLE_TILE_COUNT),
    [beaches],
  );

  const focusedCluster = useMemo(
    () => clusters.find((cluster) => (cluster._id || cluster.id || cluster.name) === focusedClusterId) || null,
    [clusters, focusedClusterId],
  );

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

  const scoredTiles = useMemo(() => {
    const focusedSlugs = new Set(focusedCluster?.beach_slugs || []);
    return tiles.map((tile, index) => {
      const score = getMatchScore(tile, moodPhrase, activityHint, companionHint);
      const focusedMatch = focusedCluster ? focusedSlugs.has(tile.slug) : true;
      return {
        tile,
        index,
        score: focusedMatch ? score : 0,
        matched: focusedMatch && score > 0,
        scattered: scatterForTile(tile, index),
        layout: circleLayout(index, tiles.length, rotationPhase),
      };
    });
  }, [activityHint, companionHint, focusedCluster, moodPhrase, rotationPhase, tiles]);

  const hasInput = Boolean(moodPhrase.trim() || activityHint || companionHint || focusedCluster);
  const loadingBeach = useMemo(() => {
    const matchedTiles = scoredTiles
      .filter(({ matched }) => matched)
      .sort((a, b) => b.score - a.score);
    return matchedTiles[0]?.tile || scoredTiles[0]?.tile || null;
  }, [scoredTiles]);

  useEffect(() => {
    if (prefersReducedMotion) {
      setIsAssembled(true);
      return undefined;
    }

    setIsAssembled(false);
    const timer = window.setTimeout(() => setIsAssembled(true), 260);
    return () => window.clearTimeout(timer);
  }, [prefersReducedMotion, tiles.length]);

  useEffect(() => {
    if (prefersReducedMotion || !isAssembled || isFocused) return undefined;

    let frameId = 0;
    const idleSpeed = (Math.PI * 2) / 92000;
    const loadingSpeed = (Math.PI * 2) / 4200;

    function tick(timestamp) {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp;
        lastPaintRef.current = timestamp;
      }

      const delta = timestamp - lastFrameRef.current;
      lastFrameRef.current = timestamp;
      phaseRef.current = (phaseRef.current + delta * (isGenerating ? loadingSpeed : idleSpeed)) % (Math.PI * 2);

      if (timestamp - lastPaintRef.current > 32) {
        lastPaintRef.current = timestamp;
        setRotationPhase(phaseRef.current);
      }

      frameId = window.requestAnimationFrame(tick);
    }

    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
      lastFrameRef.current = 0;
      lastPaintRef.current = 0;
    };
  }, [isAssembled, isFocused, isGenerating, prefersReducedMotion]);

  return (
    <section className={`circular-beach-canvas ${isFocused ? "is-focused" : ""} ${isGenerating ? "is-generating" : ""}`} aria-label="Circular beach mood canvas">
      <div className="circular-beach-canvas__center" aria-hidden="true">
        <span>{isGenerating ? "checking the coast" : isAssembled ? "Go touch sand, mate" : "assembling the coast"}</span>
        <p>{isGenerating ? "sorting the swell" : hasInput ? "mood signal active" : "hover to explore"}</p>
      </div>

      <div className="circular-beach-canvas__orbit">
        <div className="circular-beach-canvas__orbit-track">
          {scoredTiles.map(({ tile, index, score, matched, scattered, layout }) => {
            const isHovered = hoveredSlug === tile.slug;
            const isDimmed = Boolean(selectedBeachSlug && selectedBeachSlug !== tile.slug) || (hasInput && !matched);

            return (
              <CircularBeachTile
                key={tile.id || tile.slug}
                tile={tile}
                index={index}
                layout={layout}
                scattered={scattered}
                isAssembled={isAssembled}
                isHovered={isHovered}
                isDimmed={isDimmed}
                isMatched={!hasInput || matched}
                isSelected={selectedBeachSlug === tile.slug}
                imageUrl={tile.imageUrl || FALLBACK_IMAGE}
                conditionLine={score > 0 && hasInput ? `${Math.min(98, 55 + score * 14)}% match` : formatConditionLine(tile)}
                regionLabel={tile.region || "sydney"}
                onHover={setHoveredSlug}
                onSelect={onBeachSelect}
                onAddToCluster={onBeachAddToCluster}
              />
            );
          })}
        </div>
      </div>

      {isGenerating && loadingBeach && (
        <div className="circular-beach-canvas__postcard-loader" role="status" aria-live="polite">
          <img src={loadingBeach.imageUrl || FALLBACK_IMAGE} alt="" />
          <div>
            <span>generating plan</span>
            <strong>{loadingBeach.name?.toLowerCase() || "sydney beach"}</strong>
            <p>reading the wind · checking the coast</p>
          </div>
        </div>
      )}
    </section>
  );
}
