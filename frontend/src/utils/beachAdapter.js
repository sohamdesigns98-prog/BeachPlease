const WORLD_W = 2900;
const WORLD_H = 2000;

export const VIBE_COLORS = {
  solo: "#ADD0EE",
  social: "#032F98",
  calm: "#004724",
  adventure: "#FF3900",
  active: "#91C059",
  family: "#FEC200",
  artistic: "#ECBCEE",
};

export const VIBE_KEYWORDS = {
  solo: ["quiet", "alone", "solo", "read", "book", "private", "disappear", "secluded"],
  calm: ["calm", "protected", "snorkel", "float", "gentle", "reset", "soft"],
  social: ["social", "mates", "friends", "cafes", "energy", "busy", "iconic"],
  active: ["surf", "wave", "swell", "swim", "walk", "movement", "active"],
  adventure: ["wild", "dramatic", "destination", "escape", "lighthouse", "proper"],
  family: ["family", "kids", "shade", "easy", "facilities", "picnic", "netted"],
  artistic: ["sunset", "romantic", "date", "scenic", "golden", "views"],
};

const REGION_KEY_BY_SLUG = {
  "palm-beach": "northern",
  "whale-beach": "northern",
  "avalon-beach": "northern",
  "bilgola-beach": "northern",
  "newport-beach": "northern",
  "mona-vale-beach": "northern",
  "manly-beach": "manly",
  "shelly-beach-manly": "manly",
  "freshwater-beach": "manly",
  "balmoral-beach": "harbour",
  "chinamans-beach": "harbour",
  "milk-beach": "harbour",
  "camp-cove": "harbour",
  "bondi-beach": "eastern",
  "tamarama-beach": "eastern",
  "bronte-beach": "eastern",
  "clovelly-beach": "eastern",
  "coogee-beach": "eastern",
  "maroubra-beach": "south",
  "malabar-beach": "south",
  "la-perouse-beach": "south",
  "cronulla-beach": "cronulla",
  "wanda-beach": "cronulla",
  "elouera-beach": "cronulla",
  "north-cronulla-beach": "cronulla",
};

const UNSPLASH_IMAGES = [
  {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=640&q=80",
    attribution: "Photo from Unsplash",
    vibes: ["calm", "family"],
  },
  {
    url: "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=640&q=80",
    attribution: "Photo from Unsplash",
    vibes: ["active", "adventure"],
  },
  {
    url: "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=640&q=80",
    attribution: "Photo from Unsplash",
    vibes: ["solo", "calm"],
  },
  {
    url: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?auto=format&fit=crop&w=640&q=80",
    attribution: "Photo from Unsplash",
    vibes: ["artistic", "adventure"],
  },
  {
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=640&q=80",
    attribution: "Photo from Unsplash",
    vibes: ["family", "social"],
  },
  {
    url: "https://images.unsplash.com/photo-1520942702018-0862200e6873?auto=format&fit=crop&w=640&q=80",
    attribution: "Photo from Unsplash",
    vibes: ["social", "active"],
  },
  {
    url: "https://images.unsplash.com/photo-1505142468610-359e7d316be0?auto=format&fit=crop&w=640&q=80",
    attribution: "Photo from Unsplash",
    vibes: ["artistic", "solo"],
  },
  {
    url: "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?auto=format&fit=crop&w=640&q=80",
    attribution: "Photo from Unsplash",
    vibes: ["adventure", "artistic"],
  },
  {
    url: "https://images.unsplash.com/photo-1493558103817-58b2924bce98?auto=format&fit=crop&w=640&q=80",
    attribution: "Photo from Unsplash",
    vibes: ["social", "family"],
  },
  {
    url: "https://images.unsplash.com/photo-1509233725247-49e657c54213?auto=format&fit=crop&w=640&q=80",
    attribution: "Photo from Unsplash",
    vibes: ["active", "calm"],
  },
];

export const FALLBACK_BEACH_SEED = [
  ["bondi-beach", "Bondi Beach", "Eastern Suburbs", ["iconic", "surf", "busy"]],
  ["shelly-beach-manly", "Shelly Beach", "Manly", ["protected", "snorkel", "calm"]],
  ["manly-beach", "Manly Beach", "Manly", ["surf", "social", "ferry"]],
  ["palm-beach", "Palm Beach", "Northern Beaches", ["destination", "scenic", "escape"]],
  ["balmoral-beach", "Balmoral Beach", "Harbour", ["family", "calm", "cafes"]],
  ["clovelly-beach", "Clovelly Beach", "Eastern Suburbs", ["protected", "swim", "snorkel"]],
  ["cronulla-beach", "Cronulla Beach", "Cronulla", ["surf", "train", "classic"]],
  ["maroubra-beach", "Maroubra Beach", "Eastern Suburbs", ["wide", "surf", "local"]],
  ["milk-beach", "Milk Beach", "Harbour", ["romantic", "views", "quiet"]],
  ["silver-beach", "Silver Beach", "Cronulla", ["dog", "calm", "bay"]],
  ["bronte-beach", "Bronte Beach", "Eastern Suburbs", ["family", "park", "ocean pool"]],
  ["tamarama-beach", "Tamarama Beach", "Eastern Suburbs", ["dramatic", "compact", "scenic"]],
  ["freshwater-beach", "Freshwater Beach", "Northern Beaches", ["surf", "family", "local"]],
  ["curl-curl-beach", "Curl Curl Beach", "Northern Beaches", ["wide", "surf", "space"]],
  ["dee-why-beach", "Dee Why Beach", "Northern Beaches", ["family", "cafes", "surf"]],
  ["camp-cove", "Camp Cove", "Harbour", ["sunset", "calm", "harbour"]],
  ["shark-beach", "Shark Beach", "Harbour", ["family", "netted", "calm"]],
  ["gordons-bay", "Gordons Bay", "Eastern Suburbs", ["snorkel", "quiet", "romantic"]],
  ["little-bay-beach", "Little Bay Beach", "Eastern Suburbs", ["protected", "quiet", "scenic"]],
  ["la-perouse-beach", "La Perouse Beach", "Eastern Suburbs", ["walk", "heritage", "calm"]],
  ["north-cronulla-beach", "North Cronulla Beach", "Cronulla", ["social", "surf", "cafes"]],
  ["wanda-beach", "Wanda Beach", "Cronulla", ["wild", "surf", "space"]],
  ["gunnamatta-bay-beach", "Gunnamatta Bay Beach", "Cronulla", ["family", "calm", "bay"]],
  ["avalon-beach", "Avalon Beach", "Northern Beaches", ["village", "surf", "relaxed"]],
  ["whale-beach", "Whale Beach", "Northern Beaches", ["scenic", "quiet", "surf"]],
  ["clifton-gardens", "Clifton Gardens", "Harbour", ["family", "picnic", "netted"]],
  ["chinamans-beach", "Chinamans Beach", "Harbour", ["quiet", "family", "harbour"]],
  ["long-reef-beach", "Long Reef Beach", "Northern Beaches", ["wild", "walk", "surf"]],
  ["narrabeen-beach", "Narrabeen Beach", "Northern Beaches", ["long", "surf", "space"]],
].map(([slug, name, region, vibe_tags]) => ({
  slug,
  name,
  region,
  suburb: region,
  vibe_tags,
  best_for: vibe_tags,
  facilities: [],
  access_tags: [],
}));

export function hashString(value = "") {
  return Array.from(value).reduce((total, char) => total + char.charCodeAt(0), 0);
}

export function getRegionKey(beach = {}) {
  if (beach.region_key) return beach.region_key;
  if (REGION_KEY_BY_SLUG[beach.slug]) return REGION_KEY_BY_SLUG[beach.slug];

  const region = String(beach.region || "").toLowerCase();
  if (region.includes("northern") || region.includes("palm")) return "northern";
  if (region.includes("manly")) return "manly";
  if (region.includes("harbour") || region.includes("mosman") || region.includes("vaucluse")) return "harbour";
  if (region.includes("eastern") || region.includes("bondi")) return "eastern";
  if (region.includes("cronulla") || region.includes("sutherland")) return "cronulla";
  if (region.includes("south") || region.includes("st george")) return "south";
  return "eastern";
}

export function inferBeachVibe(beach = {}) {
  const text = [
    beach.name,
    beach.region,
    beach.suburb,
    beach.exposure,
    beach.water_type,
    beach.dog_access,
    ...(beach.vibe_tags || []),
    ...(beach.best_for || []),
    ...(beach.facilities || []),
    ...(beach.access_tags || []),
  ].join(" ").toLowerCase();

  const scores = Object.entries(VIBE_KEYWORDS).map(([vibe, keywords]) => [
    vibe,
    keywords.reduce((score, keyword) => score + (text.includes(keyword) ? 1 : 0), 0),
  ]);

  return scores.sort((a, b) => b[1] - a[1])[0]?.[0] || "calm";
}

export function moodPositionForBeach(beach = {}, index = 0, vibe = "calm") {
  const seed = hashString(beach.slug || beach.name);
  const columns = 8;
  const cellW = 315;
  const cellH = 235;
  const column = index % columns;
  const row = Math.floor(index / columns);
  const jitterX = ((seed % 100) - 50) * 1.15;
  const jitterY = (((seed * 7) % 100) - 50) * 0.85;
  const rowOffset = row % 2 ? 120 : 0;

  return {
    x: Math.max(150, Math.min(WORLD_W - 220, 210 + column * cellW + rowOffset + jitterX)),
    y: Math.max(150, Math.min(WORLD_H - 180, 170 + row * cellH + jitterY)),
  };
}

function pickImage(beach = {}, vibe = "calm") {
  if (validImageUrl(beach.image_url)) {
    return {
      imageUrl: beach.image_url,
      imageAttribution: beach.image_attribution || beach.attribution || "Beach image",
    };
  }

  const vibeMatches = UNSPLASH_IMAGES.filter((image) => image.vibes.includes(vibe));
  const imagePool = vibeMatches.length ? vibeMatches : UNSPLASH_IMAGES;
  const image = imagePool[hashString(beach.slug || beach.name) % imagePool.length];

  return {
    imageUrl: image.url,
    imageAttribution: image.attribution,
  };
}

export function validImageUrl(value) {
  return Boolean(
    value
      && typeof value === "string"
      && value.trim()
      && !value.includes("source-404"),
  );
}

function crowdLabel(crowd) {
  if (!crowd) return "moderate";
  if (typeof crowd === "string") return crowd;
  return crowd.label || "moderate";
}

function crowdBars(crowd) {
  if (!crowd || typeof crowd === "string") return "";
  return crowd.bars || "";
}

function distanceEstimate(beach = {}) {
  const regionKey = getRegionKey(beach);
  return {
    northern: 82,
    manly: 32,
    harbour: 24,
    eastern: 28,
    south: 46,
    cronulla: 54,
  }[regionKey] || 35;
}

export function normalizeBeach(apiBeach = {}, conditionsBySlug = {}, index = 0) {
  const conditionRecord = conditionsBySlug[apiBeach.slug] || {};
  const conditions = conditionRecord.conditions || apiBeach.conditions || {};
  const crowd = conditionRecord.crowd || apiBeach.crowd || {};
  const merged = {
    ...apiBeach,
    ...conditionRecord,
    conditions,
    crowd,
  };
  const vibe = inferBeachVibe(merged);
  const pickedImage = pickImage(merged, vibe);

  return {
    ...merged,
    id: merged.slug,
    slug: merged.slug,
    name: merged.name,
    vibe,
    accent: VIBE_COLORS[vibe],
    moodPos: merged.moodPos || moodPositionForBeach(merged, index, vibe),
    mapPos: merged.mapPos || { x: merged.map_x, y: merged.map_y },
    temp: conditions.temperature ?? null,
    waves: conditions.wave_height_m ?? null,
    windKmh: conditions.wind_kmh ?? null,
    uv: conditions.uv_index ?? null,
    crowd: {
      ...crowd,
      label: crowdLabel(crowd),
      bars: crowdBars(crowd),
    },
    distanceMin: merged.distanceMin ?? distanceEstimate(merged),
    postcards: merged.postcards ?? 0,
    facilities: merged.facilities || [],
    bestTime: merged.ideal_times?.[0] || merged.bestTime || "",
    whatToBring: merged.whatToBring || [],
    region_key: getRegionKey(merged),
    ...pickedImage,
  };
}

export function normalizeBeachesForCanvas(beaches = [], conditions = []) {
  const sourceBeaches = beaches.length ? beaches : FALLBACK_BEACH_SEED;
  const conditionsBySlug = Object.fromEntries(
    conditions
      .filter((condition) => condition?.slug)
      .map((condition) => [condition.slug, condition]),
  );

  return sourceBeaches.map((beach, index) => normalizeBeach(beach, conditionsBySlug, index));
}
