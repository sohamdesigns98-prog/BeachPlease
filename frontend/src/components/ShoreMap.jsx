import { APP_COPY } from "@/content/voice";

const SIGNAL_BEACH_NAMES = new Set([
  "Palm Beach",
  "Manly Beach",
  "Shelly Beach",
  "Balmoral Beach",
  "Bondi Beach",
  "Tamarama Beach",
  "Bronte Beach",
  "Clovelly Beach",
  "Coogee Beach",
  "Maroubra Beach",
  "Cronulla Beach",
]);

const BEACH_DOTS = [
  ["Palm Beach", 82, 2],
  ["Manly Beach", 76, 34],
  ["Shelly Beach", 79, 35],
  ["Balmoral Beach", 68, 40],
  ["Bondi Beach", 73, 55],
  ["Tamarama Beach", 72, 57],
  ["Bronte Beach", 71, 58],
  ["Clovelly Beach", 70, 61],
  ["Coogee Beach", 69, 63],
  ["Maroubra Beach", 69, 69],
  ["Cronulla Beach", 47, 91],
];

function formatConditionValue(value, suffix = "") {
  if (value === null || value === undefined) return "n/a";
  return `${value}${suffix}`;
}

function formatWind(conditions = {}) {
  const wind = formatConditionValue(conditions.wind_kmh, "km/h");
  const direction = conditions.wind_direction;
  if (direction === null || direction === undefined) return wind;
  return `${direction} ${wind}`;
}

function normaliseBackendBeach(beach) {
  return {
    id: beach.slug,
    slug: beach.slug,
    name: beach.name,
    x: beach.map_x,
    y: beach.map_y,
    conditions: beach.conditions || {},
    crowd: beach.crowd,
    status: beach.status,
    raw: beach,
  };
}

function normaliseFallbackBeach([name, x, y]) {
  return {
    id: name,
    name,
    x,
    y,
    conditions: null,
    crowd: null,
    raw: { name, map_x: x, map_y: y },
  };
}

function BeachTooltip({ beach }) {
  const conditions = beach.conditions || {};
  const crowd = beach.crowd;

  return (
    <span className="beach-dot-tooltip">
      <strong>{beach.name}</strong>
      <span>wave {formatConditionValue(conditions.wave_height_m, "m")}</span>
      <span>wind {formatWind(conditions)}</span>
      <span>UV {formatConditionValue(conditions.uv_index)}</span>
      {crowd?.bars && <span>crowd {crowd.bars}</span>}
    </span>
  );
}

export default function ShoreMap({
  mapBeaches,
  isFallback = false,
  selectedBeachSlug,
  selectedBeachName,
  onBeachSelect,
}) {
  const copy = APP_COPY.home;
  const hasLiveBeaches = Boolean(mapBeaches?.length);
  const beaches = hasLiveBeaches
    ? mapBeaches.map(normaliseBackendBeach).filter((beach) => SIGNAL_BEACH_NAMES.has(beach.name))
    : BEACH_DOTS.map(normaliseFallbackBeach);
  const selectedVisible = selectedBeachSlug
    ? beaches.some((beach) => beach.slug === selectedBeachSlug)
    : true;

  return (
    <section className="minimal-map-area" aria-label="Sydney coastline map">
      <img className="sydney-coast-map" src="/sydney-coast.svg" alt={copy.mapAlt} />
      <div className="beach-dot-layer" aria-label="Sydney beach markers">
        {beaches.map((beach) => (
          <button
            key={beach.id}
            className={`beach-dot ${beach.slug === selectedBeachSlug ? "is-selected" : ""}`}
            type="button"
            style={{
              "--dot-x": `${beach.x}%`,
              "--dot-y": `${beach.y}%`,
            }}
            aria-label={beach.name}
            onClick={() => onBeachSelect?.(beach.raw)}
          >
            <BeachTooltip beach={beach} />
          </button>
        ))}
      </div>
      {(isFallback || !hasLiveBeaches) && (
        <p className="map-fallback-label">LIVE DATA UNAVAILABLE</p>
      )}
      {!selectedVisible && selectedBeachName && (
        <p className="map-selected-fallback-label">SELECTED // {selectedBeachName}</p>
      )}
    </section>
  );
}
