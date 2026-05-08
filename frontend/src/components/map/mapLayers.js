import {
  BEACH_DOTS_LAYER_ID,
  BEACH_LABELS_LAYER_ID,
  BEACH_SELECTED_PULSE_LAYER_ID,
  BEACH_SOURCE_ID,
  CANDIDATE_LABELS_LAYER_ID,
  HIDDEN_LAYER_KEYWORDS,
  MAP_3D_BUILDINGS_LAYER_ID,
  MAP_TERRAIN_SOURCE_ID,
  REGION_FILL_LAYER_ID,
  REGION_LABELS_LAYER_ID,
  REGION_OUTLINE_LAYER_ID,
  REGION_SOURCE_ID,
} from "@/components/map/mapConstants";
import { getRegionHitZoneGeoJSON } from "@/components/map/mapData";

function hasLayer(map, layerId) {
  return Boolean(map.getLayer(layerId));
}

function setPaintSafely(map, layerId, property, value) {
  if (hasLayer(map, layerId)) {
    map.setPaintProperty(layerId, property, value);
  }
}

function addLayerSafely(map, layer, beforeLayerId) {
  if (beforeLayerId && hasLayer(map, beforeLayerId)) {
    map.addLayer(layer, beforeLayerId);
    return;
  }

  map.addLayer(layer);
}

function findFirstSymbolLayerId(map) {
  const layers = map.getStyle()?.layers || [];
  return layers.find((layer) => layer.type === "symbol")?.id;
}

export function simplifyBaseStyle(map) {
  const style = map.getStyle();
  const layers = style?.layers || [];

  layers.forEach((layer) => {
    const id = layer.id.toLowerCase();
    const shouldHide = HIDDEN_LAYER_KEYWORDS.some((keyword) => id.includes(keyword));
    if (shouldHide && hasLayer(map, layer.id)) {
      map.setLayoutProperty(layer.id, "visibility", "none");
    }
  });

  layers.forEach((layer) => {
    const id = layer.id.toLowerCase();
    if (layer.type === "background") {
      setPaintSafely(map, layer.id, "background-color", "#fdfefe");
    }
    if (layer.type === "fill" && id.includes("water")) {
      setPaintSafely(map, layer.id, "fill-color", "#edf4f6");
    }
    if (layer.type === "fill" && (id.includes("land") || id.includes("landuse"))) {
      setPaintSafely(map, layer.id, "fill-color", "#fdfefe");
    }
  });
}

export function addSubtle3DContext(map) {
  try {
    if (!map.getSource(MAP_TERRAIN_SOURCE_ID)) {
      map.addSource(MAP_TERRAIN_SOURCE_ID, {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
    }

    if (typeof map.setTerrain === "function") {
      map.setTerrain({
        source: MAP_TERRAIN_SOURCE_ID,
        exaggeration: 1.1,
      });
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Mapbox terrain unavailable:", error);
    }
  }

  try {
    const hasCompositeSource = Boolean(map.getSource("composite"));
    if (!hasCompositeSource || hasLayer(map, MAP_3D_BUILDINGS_LAYER_ID)) return;

    addLayerSafely(map, {
      id: MAP_3D_BUILDINGS_LAYER_ID,
      type: "fill-extrusion",
      source: "composite",
      "source-layer": "building",
      minzoom: 14,
      filter: ["==", ["get", "extrude"], "true"],
      paint: {
        "fill-extrusion-color": "#e9ebe8",
        "fill-extrusion-height": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14,
          0,
          15,
          ["coalesce", ["get", "height"], 10],
        ],
        "fill-extrusion-base": [
          "interpolate",
          ["linear"],
          ["zoom"],
          14,
          0,
          15,
          ["coalesce", ["get", "min_height"], 0],
        ],
        "fill-extrusion-opacity": 0.16,
      },
    }, findFirstSymbolLayerId(map));
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn("Mapbox building extrusion unavailable:", error);
    }
  }
}

function activitySuitabilityExpression(activity) {
  if (activity === "swim") return ["==", ["get", "swim_suitability"], "high"];
  if (activity === "surf") return ["==", ["get", "surf_suitability"], "high"];
  if (activity === "walk") return ["==", ["get", "walk_suitability"], "high"];
  return false;
}

function dotRadiusExpression(activity) {
  return [
    "case",
    ["==", ["get", "is_selected"], true],
    9,
    ["==", ["get", "is_preferred"], true],
    7,
    ["==", ["get", "is_candidate"], true],
    6,
    activitySuitabilityExpression(activity),
    4.5,
    3,
  ];
}

function dotColorExpression(activity) {
  return [
    "case",
    ["==", ["get", "is_selected"], true],
    "#f04a18",
    ["==", ["get", "is_preferred"], true],
    "#ff6a2a",
    ["==", ["get", "is_candidate"], true],
    "#f04a18",
    activitySuitabilityExpression(activity),
    "#5f5f5f",
    "#1f1f1f",
  ];
}

function dotOpacityExpression(activity) {
  return [
    "case",
    ["any", ["==", ["get", "is_selected"], true], ["==", ["get", "is_preferred"], true]],
    1,
    ["==", ["get", "is_candidate"], true],
    0.95,
    activitySuitabilityExpression(activity),
    0.62,
    0.35,
  ];
}

export function addBeachSourceAndLayers(map, geojson, activity = null) {
  if (!map.getSource(BEACH_SOURCE_ID)) {
    map.addSource(BEACH_SOURCE_ID, {
      type: "geojson",
      data: geojson,
      promoteId: "slug",
    });
  }

  if (!hasLayer(map, BEACH_SELECTED_PULSE_LAYER_ID)) {
    map.addLayer({
      id: BEACH_SELECTED_PULSE_LAYER_ID,
      type: "circle",
      source: BEACH_SOURCE_ID,
      filter: ["==", ["get", "is_selected"], true],
      paint: {
        "circle-radius": [
          "interpolate",
          ["linear"],
          ["zoom"],
          8,
          11,
          12,
          18,
        ],
        "circle-color": "#f04a18",
        "circle-opacity": 0.14,
        "circle-stroke-width": 0,
      },
    });
  }

  if (!hasLayer(map, BEACH_DOTS_LAYER_ID)) {
    map.addLayer({
      id: BEACH_DOTS_LAYER_ID,
      type: "circle",
      source: BEACH_SOURCE_ID,
      paint: {
        "circle-radius": dotRadiusExpression(activity),
        "circle-color": dotColorExpression(activity),
        "circle-opacity": dotOpacityExpression(activity),
        "circle-stroke-width": 0,
      },
    });
  }

  if (!hasLayer(map, BEACH_LABELS_LAYER_ID)) {
    map.addLayer({
      id: BEACH_LABELS_LAYER_ID,
      type: "symbol",
      source: BEACH_SOURCE_ID,
      minzoom: 8.7,
      layout: {
        "text-field": ["get", "name"],
        "text-size": [
          "case",
          ["==", ["get", "is_selected"], true],
          12,
          10,
        ],
        "text-font": ["DIN Offc Pro Regular", "Arial Unicode MS Regular"],
        "text-offset": [0, 1.15],
        "text-anchor": "top",
        "text-allow-overlap": false,
      },
      paint: {
        "text-color": "#333333",
        "text-opacity": [
          "case",
          ["==", ["get", "is_selected"], true],
          0.95,
          0.58,
        ],
        "text-halo-color": "#fdfefe",
        "text-halo-width": 1.5,
      },
    });
  }

  if (!hasLayer(map, CANDIDATE_LABELS_LAYER_ID)) {
    map.addLayer({
      id: CANDIDATE_LABELS_LAYER_ID,
      type: "symbol",
      source: BEACH_SOURCE_ID,
      filter: ["==", ["get", "show_candidate_label"], true],
      minzoom: 8.7,
      layout: {
        "text-field": ["get", "label"],
        "text-size": 10,
        "text-font": ["DIN Offc Pro Regular", "Arial Unicode MS Regular"],
        "text-offset": [0, 2.15],
        "text-anchor": "top",
        "text-allow-overlap": false,
        "text-letter-spacing": 0.03,
      },
      paint: {
        "text-color": "#f04a18",
        "text-opacity": 0.86,
        "text-halo-color": "#fdfefe",
        "text-halo-width": 1.7,
      },
    });
  }
}

export function addRegionHitZoneLayers(map, selectedRegion = null) {
  if (!map.getSource(REGION_SOURCE_ID)) {
    map.addSource(REGION_SOURCE_ID, {
      type: "geojson",
      data: getRegionHitZoneGeoJSON(),
      promoteId: "region",
    });
  }

  if (!hasLayer(map, REGION_FILL_LAYER_ID)) {
    addLayerSafely(map, {
      id: REGION_FILL_LAYER_ID,
      type: "fill",
      source: REGION_SOURCE_ID,
      paint: {
        "fill-color": "#f04a18",
        "fill-opacity": [
          "case",
          ["boolean", ["feature-state", "hover"], false],
          0.09,
          ["==", ["get", "region"], selectedRegion || ""],
          0.055,
          0.018,
        ],
      },
    }, BEACH_SELECTED_PULSE_LAYER_ID);
  }

  if (!hasLayer(map, REGION_OUTLINE_LAYER_ID)) {
    addLayerSafely(map, {
      id: REGION_OUTLINE_LAYER_ID,
      type: "line",
      source: REGION_SOURCE_ID,
      paint: {
        "line-color": "#f04a18",
        "line-width": [
          "case",
          ["==", ["get", "region"], selectedRegion || ""],
          1.4,
          0.5,
        ],
        "line-opacity": [
          "case",
          ["==", ["get", "region"], selectedRegion || ""],
          0.55,
          0.14,
        ],
      },
    }, BEACH_SELECTED_PULSE_LAYER_ID);
  }

  if (!hasLayer(map, REGION_LABELS_LAYER_ID)) {
    addLayerSafely(map, {
      id: REGION_LABELS_LAYER_ID,
      type: "symbol",
      source: REGION_SOURCE_ID,
      layout: {
        "text-field": ["upcase", ["get", "label"]],
        "text-size": 10,
        "text-font": ["DIN Offc Pro Regular", "Arial Unicode MS Regular"],
        "text-letter-spacing": 0.12,
        "text-allow-overlap": false,
      },
      paint: {
        "text-color": "#1f1f1f",
        "text-opacity": [
          "case",
          ["==", ["get", "region"], selectedRegion || ""],
          0.58,
          0.28,
        ],
        "text-halo-color": "#fdfefe",
        "text-halo-width": 1.4,
      },
    }, BEACH_SELECTED_PULSE_LAYER_ID);
  }
}

export function updateRegionLayerState(map, selectedRegion = null) {
  if (hasLayer(map, REGION_FILL_LAYER_ID)) {
    map.setPaintProperty(REGION_FILL_LAYER_ID, "fill-opacity", [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      0.09,
      ["==", ["get", "region"], selectedRegion || ""],
      0.055,
      0.018,
    ]);
  }

  if (hasLayer(map, REGION_OUTLINE_LAYER_ID)) {
    map.setPaintProperty(REGION_OUTLINE_LAYER_ID, "line-width", [
      "case",
      ["==", ["get", "region"], selectedRegion || ""],
      1.4,
      0.5,
    ]);
    map.setPaintProperty(REGION_OUTLINE_LAYER_ID, "line-opacity", [
      "case",
      ["==", ["get", "region"], selectedRegion || ""],
      0.55,
      0.14,
    ]);
  }

  if (hasLayer(map, REGION_LABELS_LAYER_ID)) {
    map.setPaintProperty(REGION_LABELS_LAYER_ID, "text-opacity", [
      "case",
      ["==", ["get", "region"], selectedRegion || ""],
      0.58,
      0.28,
    ]);
  }
}

export function updateBeachSource(map, geojson) {
  const source = map.getSource(BEACH_SOURCE_ID);
  if (source) {
    source.setData(geojson);
  }
}

export function updateBeachLayerState(map, activity = null) {
  if (!hasLayer(map, BEACH_DOTS_LAYER_ID)) return;

  map.setPaintProperty(BEACH_DOTS_LAYER_ID, "circle-radius", dotRadiusExpression(activity));
  map.setPaintProperty(BEACH_DOTS_LAYER_ID, "circle-color", dotColorExpression(activity));
  map.setPaintProperty(BEACH_DOTS_LAYER_ID, "circle-opacity", dotOpacityExpression(activity));
}
