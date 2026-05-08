import { REGION_HIT_ZONE_GEOJSON } from "@/components/map/regionConfig";

function numericOrNull(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "n/a";
  return `${value}${suffix}`;
}

export function beachConditionsToGeoJSON(
  beaches = [],
  {
    selectedBeachSlug = "",
    preferredBeachSlug = "",
    candidateBeachSlugs = [],
    showCandidateLabels = false,
  } = {},
) {
  const candidateSet = new Set(candidateBeachSlugs);

  return {
    type: "FeatureCollection",
    features: beaches
      .filter((beach) => Number.isFinite(Number(beach.lng)) && Number.isFinite(Number(beach.lat)))
      .map((beach) => {
        const conditions = beach.conditions || {};
        const waveHeight = numericOrNull(conditions.wave_height_m);
        const uvIndex = numericOrNull(conditions.uv_index);
        const isSelected = beach.slug === selectedBeachSlug;
        const isPreferred = beach.slug === preferredBeachSlug;
        const isCandidate = candidateSet.has(beach.slug);
        const label = `${beach.name} · ${formatValue(waveHeight, "m")} · UV${formatValue(uvIndex)}`;

        return {
          id: beach.slug,
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [Number(beach.lng), Number(beach.lat)],
          },
          properties: {
            ...beach,
            slug: beach.slug,
            name: beach.name,
            conditions: JSON.stringify(conditions),
            crowd: JSON.stringify(beach.crowd || {}),
            label,
            wave_height_m: waveHeight,
            uv_index: uvIndex,
            is_selected: isSelected,
            is_preferred: isPreferred,
            is_candidate: isCandidate,
            show_candidate_label: showCandidateLabels && isCandidate,
            swim_suitability: beach.swim_suitability || "",
            surf_suitability: beach.surf_suitability || "",
            walk_suitability: beach.walk_suitability || "",
          },
        };
      }),
  };
}

export function getRegionHitZoneGeoJSON() {
  return REGION_HIT_ZONE_GEOJSON;
}
