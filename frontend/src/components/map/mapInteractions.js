import {
  BEACH_DOTS_LAYER_ID,
  REGION_FILL_LAYER_ID,
  REGION_LABELS_LAYER_ID,
  REGION_SOURCE_ID,
} from "@/components/map/mapConstants";

function parseJsonProperty(value, fallback) {
  if (!value || typeof value !== "string") return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function normaliseFeatureProperties(properties = {}) {
  return {
    ...properties,
    lat: Number(properties.lat),
    lng: Number(properties.lng),
    map_x: Number(properties.map_x),
    map_y: Number(properties.map_y),
    wave_height_m: Number.isFinite(Number(properties.wave_height_m))
      ? Number(properties.wave_height_m)
      : null,
    uv_index: Number.isFinite(Number(properties.uv_index))
      ? Number(properties.uv_index)
      : null,
    is_selected: properties.is_selected === true || properties.is_selected === "true",
    is_preferred: properties.is_preferred === true || properties.is_preferred === "true",
    is_candidate: properties.is_candidate === true || properties.is_candidate === "true",
    conditions: parseJsonProperty(properties.conditions, {}),
    crowd: parseJsonProperty(properties.crowd, {}),
  };
}

export function bindBeachInteractions(map, onBeachPreview, onBeachHover, onBeachLeave) {
  const handleMouseEnter = () => {
    map.getCanvas().style.cursor = "pointer";
  };

  const handleMouseLeave = () => {
    map.getCanvas().style.cursor = "";
    onBeachLeave?.();
  };

  const handleMouseMove = (event) => {
    const feature = event.features?.[0];
    if (!feature) return;

    onBeachHover?.(
      normaliseFeatureProperties(feature.properties),
      {
        x: event.point.x,
        y: event.point.y,
      },
    );
  };

  const handleClick = (event) => {
    const feature = event.features?.[0];
    if (!feature) return;

    onBeachPreview?.(normaliseFeatureProperties(feature.properties));
  };

  map.on("mouseenter", BEACH_DOTS_LAYER_ID, handleMouseEnter);
  map.on("mousemove", BEACH_DOTS_LAYER_ID, handleMouseMove);
  map.on("mouseleave", BEACH_DOTS_LAYER_ID, handleMouseLeave);
  map.on("click", BEACH_DOTS_LAYER_ID, handleClick);

  return () => {
    map.off("mouseenter", BEACH_DOTS_LAYER_ID, handleMouseEnter);
    map.off("mousemove", BEACH_DOTS_LAYER_ID, handleMouseMove);
    map.off("mouseleave", BEACH_DOTS_LAYER_ID, handleMouseLeave);
    map.off("click", BEACH_DOTS_LAYER_ID, handleClick);
  };
}

export function bindRegionInteractions(map, onRegionSelect) {
  let hoveredRegionId = null;

  const getRegionFeatureId = (feature) => feature?.id ?? feature?.properties?.region;

  const clearHoveredRegion = () => {
    if (!hoveredRegionId) return;

    map.setFeatureState(
      { source: REGION_SOURCE_ID, id: hoveredRegionId },
      { hover: false },
    );
    hoveredRegionId = null;
  };

  const handleMouseEnter = () => {
    map.getCanvas().style.cursor = "pointer";
  };

  const handleMouseMove = (event) => {
    const feature = event.features?.[0];
    if (!feature) return;

    const nextId = getRegionFeatureId(feature);
    if (!nextId) {
      console.warn("Feature missing id for feature-state:", feature);
      return;
    }

    if (nextId === hoveredRegionId) return;

    clearHoveredRegion();
    hoveredRegionId = nextId;
    map.setFeatureState(
      { source: REGION_SOURCE_ID, id: hoveredRegionId },
      { hover: true },
    );
  };

  const handleMouseLeave = () => {
    map.getCanvas().style.cursor = "";
    clearHoveredRegion();
  };

  const handleClick = (event) => {
    const feature = event.features?.[0];
    const region = feature?.properties?.region;
    if (region) {
      onRegionSelect?.(region);
    }
  };

  map.on("mouseenter", REGION_FILL_LAYER_ID, handleMouseEnter);
  map.on("mousemove", REGION_FILL_LAYER_ID, handleMouseMove);
  map.on("mouseleave", REGION_FILL_LAYER_ID, handleMouseLeave);
  map.on("click", REGION_FILL_LAYER_ID, handleClick);
  map.on("mouseenter", REGION_LABELS_LAYER_ID, handleMouseEnter);
  map.on("click", REGION_LABELS_LAYER_ID, handleClick);

  return () => {
    clearHoveredRegion();
    map.off("mouseenter", REGION_FILL_LAYER_ID, handleMouseEnter);
    map.off("mousemove", REGION_FILL_LAYER_ID, handleMouseMove);
    map.off("mouseleave", REGION_FILL_LAYER_ID, handleMouseLeave);
    map.off("click", REGION_FILL_LAYER_ID, handleClick);
    map.off("mouseenter", REGION_LABELS_LAYER_ID, handleMouseEnter);
    map.off("click", REGION_LABELS_LAYER_ID, handleClick);
  };
}
