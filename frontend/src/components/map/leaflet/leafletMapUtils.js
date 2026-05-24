export const MAP_CENTER = [-33.88, 151.235];
export const SYDNEY_CENTER = [-33.8568, 151.2153];

export const MAP_FILTERS = [
  { id: "all", label: "All" },
  { id: "popular", label: "Popular" },
  { id: "surf", label: "Surf" },
  { id: "family", label: "Family" },
  { id: "quiet", label: "Quiet" },
];

const TYPE_COLORS = {
  popular: "#1a6bcc",
  surf: "#d9972f",
  family: "#16834f",
  quiet: "#1f1f1f",
};

export const LIGHT_MAP_FALLBACK_BEACHES = [
  { name: "Bondi Beach", lat: -33.8915, lng: 151.2767, type: "popular", crowd: 88, swell: 75, water: 19, guard: "patrolled", best: "big arvo, people watching, classic swim", park: "limited street parking" },
  { name: "Manly Beach", lat: -33.7972, lng: 151.2888, type: "popular", crowd: 76, swell: 62, water: 19, guard: "patrolled", best: "ferry day, swim, surf lesson", park: "paid parking nearby" },
  { name: "Coogee Beach", lat: -33.9205, lng: 151.2588, type: "family", crowd: 68, swell: 45, water: 19, guard: "patrolled", best: "family swim, coastal walk, easy lunch", park: "street parking" },
  { name: "Maroubra Beach", lat: -33.9506, lng: 151.2593, type: "surf", crowd: 48, swell: 82, water: 18, guard: "patrolled", best: "proper surf, long beach walk", park: "large beachside car park" },
  { name: "Cronulla Beach", lat: -34.0569, lng: 151.1532, type: "popular", crowd: 61, swell: 58, water: 18, guard: "patrolled", best: "train-friendly swim, long lunch", park: "paid and street parking" },
  { name: "Shelly Beach", lat: -33.8008, lng: 151.2988, type: "quiet", crowd: 43, swell: 22, water: 19, guard: "usually calm", best: "snorkel, gentle swim, solo reset", park: "limited parking" },
  { name: "Freshwater Beach", lat: -33.7798, lng: 151.2912, type: "surf", crowd: 48, swell: 64, water: 19, guard: "patrolled", best: "surf, swim, northern beaches day", park: "limited street parking" },
  { name: "Balmoral Beach", lat: -33.8269, lng: 151.2528, type: "family", crowd: 56, swell: 12, water: 19, guard: "calm harbour", best: "gentle swim, picnic, kids", park: "paid parking" },
  { name: "Clovelly Beach", lat: -33.9127, lng: 151.2665, type: "family", crowd: 58, swell: 18, water: 19, guard: "patrolled", best: "laps, snorkel, easy dip", park: "limited street parking" },
  { name: "Gordons Bay", lat: -33.9147, lng: 151.2647, type: "quiet", crowd: 36, swell: 18, water: 19, guard: "unpatrolled", best: "snorkel, quiet float", park: "walk in from nearby streets" },
  { name: "La Perouse Beach", lat: -33.9891, lng: 151.2312, type: "quiet", crowd: 32, swell: 15, water: 18, guard: "check signs", best: "low-pressure date, calm water, history nearby", park: "parking around the loop" },
  { name: "Dee Why Beach", lat: -33.7514, lng: 151.2971, type: "surf", crowd: 52, swell: 70, water: 19, guard: "patrolled", best: "surf, ocean pool, breakfast after", park: "paid parking" },
  { name: "Palm Beach", lat: -33.5967, lng: 151.3231, type: "quiet", crowd: 39, swell: 58, water: 19, guard: "patrolled seasonally", best: "day trip, lighthouse walk", park: "paid parking" },
  { name: "Bronte Beach", lat: -33.9012, lng: 151.2669, type: "family", crowd: 67, swell: 48, water: 19, guard: "patrolled", best: "picnic, ocean pool, walk", park: "limited parking" },
  { name: "Tamarama Beach", lat: -33.8981, lng: 151.2702, type: "surf", crowd: 54, swell: 71, water: 19, guard: "patrolled", best: "surf watching, quick dip", park: "very limited parking" },
];

export function normaliseSlug(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function asFiniteNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function getLeafletCoordinates(beach) {
  const lat = asFiniteNumber(beach?.lat ?? beach?.latitude ?? beach?.coordinates?.lat ?? beach?.location?.lat);
  const lng = asFiniteNumber(beach?.lng ?? beach?.lon ?? beach?.longitude ?? beach?.coordinates?.lng ?? beach?.location?.lng);
  if (lat === null || lng === null) return null;
  return { lat, lng };
}

function getConditionValue(condition, keys) {
  for (const key of keys) {
    const value = condition?.[key] ?? condition?.conditions?.[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return null;
}

export function conditionsBySlug(conditions = []) {
  if (!Array.isArray(conditions)) return {};
  return conditions.reduce((map, item) => {
    const slug = item?.slug || item?.beach_slug || normaliseSlug(item?.name || item?.beach_name);
    if (slug) map[slug] = item;
    return map;
  }, {});
}

export function inferLeafletType(beach) {
  const haystack = [
    beach?.type,
    beach?.vibe,
    beach?.mood,
    beach?.region,
    beach?.crowd_level_default,
    ...(beach?.best_for || []),
    ...(beach?.vibe_tags || []),
    ...(beach?.facilities || []),
  ].join(" ").toLowerCase();

  if (haystack.includes("surf") || haystack.includes("swell")) return "surf";
  if (haystack.includes("family") || haystack.includes("kids") || haystack.includes("picnic")) return "family";
  if (haystack.includes("quiet") || haystack.includes("calm") || haystack.includes("solo") || haystack.includes("secluded")) return "quiet";
  if (haystack.includes("popular") || haystack.includes("busy") || haystack.includes("social")) return "popular";
  return Number(beach?.crowd?.bars || beach?.crowd) > 65 ? "popular" : "quiet";
}

export function normaliseLeafletBeach(beach, conditionMap = {}) {
  const slug = beach?.slug || normaliseSlug(beach?.name);
  const coords = getLeafletCoordinates(beach);
  const condition = conditionMap[slug] || {};
  const waterTemp = getConditionValue(condition, ["water_temp", "waterTemp", "temperature", "temp_c"]) ?? beach?.water ?? beach?.temp;
  const waves = getConditionValue(condition, ["wave_height_m", "waves_m", "waveHeight", "swell"]) ?? beach?.waves;
  const wind = getConditionValue(condition, ["wind_kmh", "windSpeed", "wind"]) ?? beach?.windKmh;
  const uv = getConditionValue(condition, ["uv_index", "uv"]) ?? beach?.uv;
  const crowdLabel = beach?.crowd?.label || beach?.crowd_level_default || condition?.crowd || "check live";
  const mapType = beach?.type || inferLeafletType(beach);

  return {
    ...beach,
    slug,
    name: beach?.name || "Sydney beach",
    lat: coords?.lat,
    lng: coords?.lng,
    mapType,
    mapColor: TYPE_COLORS[mapType] || TYPE_COLORS.quiet,
    crowdLabel,
    crowdScore: asFiniteNumber(beach?.crowd?.bars ?? beach?.crowd) ?? 45,
    swellScore: asFiniteNumber(waves) ? Math.min(100, Math.round(Number(waves) * 36)) : 40,
    waterTemp,
    waves,
    wind,
    uv,
    lifeguard: beach?.lifeguard || beach?.patrol || beach?.guard || "check signs",
    bestFor: beach?.best || beach?.best_for?.slice?.(0, 3)?.join(", ") || beach?.vibe || "a low-fuss beach day",
    parking: beach?.park || beach?.parking || beach?.access_notes || "check nearby streets",
  };
}

export function buildLeafletBeachData(beaches = [], conditions = []) {
  const conditionMap = conditionsBySlug(conditions);
  const apiBeaches = beaches
    .map((beach) => normaliseLeafletBeach(beach, conditionMap))
    .filter((beach) => Number.isFinite(beach.lat) && Number.isFinite(beach.lng));

  if (apiBeaches.length > 0) {
    return {
      beaches: apiBeaches,
      source: "api",
      note: conditions.length ? "Live beach data" : "Beach data",
    };
  }

  return {
    beaches: LIGHT_MAP_FALLBACK_BEACHES.map((beach) => normaliseLeafletBeach(beach, {})),
    source: "fallback",
    note: "Fallback beach map",
  };
}

export function filterLeafletBeaches(beaches = [], query = "", filter = "all") {
  const cleanQuery = query.trim().toLowerCase();
  return beaches.filter((beach) => {
    const matchesFilter = filter === "all" || beach.mapType === filter;
    if (!matchesFilter) return false;
    if (!cleanQuery) return true;
    return [
      beach.name,
      beach.region,
      beach.suburb,
      beach.bestFor,
      beach.mapType,
    ].join(" ").toLowerCase().includes(cleanQuery);
  });
}

export function createMarkerHtml(beach, isSelected = false, isHighlighted = false) {
  const selectedClass = isSelected ? " is-selected" : "";
  const highlightedClass = isHighlighted ? " is-highlighted" : "";
  return `
    <span class="leaflet-map-marker${selectedClass}${highlightedClass}" style="--marker-color: ${beach.mapColor}">
      <span class="leaflet-map-marker__dot"></span>
      <span class="leaflet-map-marker__label">${beach.name}</span>
    </span>
  `;
}

export function formatMapValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "n/a";
  return `${value}${suffix}`;
}
