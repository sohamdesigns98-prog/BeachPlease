export const MAPBOX_STYLE_URL = import.meta.env.VITE_MAPBOX_STYLE_URL
  || "mapbox://styles/mapbox/light-v11";

export const MAPBOX_INITIAL_CAMERA = {
  center: [151.23, -33.86],
  zoom: 9.1,
  pitch: 0,
  bearing: 0,
};

export const BEACH_SOURCE_ID = "beach-conditions";
export const BEACH_DOTS_LAYER_ID = "beach-dots";
export const BEACH_LABELS_LAYER_ID = "beach-labels";
export const CANDIDATE_LABELS_LAYER_ID = "candidate-labels";
export const BEACH_SELECTED_PULSE_LAYER_ID = "beach-selected-pulse";
export const MAP_TERRAIN_SOURCE_ID = "beachplease-terrain";
export const MAP_3D_BUILDINGS_LAYER_ID = "beachplease-3d-buildings";
export const REGION_SOURCE_ID = "region-hit-zones";
export const REGION_FILL_LAYER_ID = "region-fill";
export const REGION_OUTLINE_LAYER_ID = "region-outline";
export const REGION_LABELS_LAYER_ID = "region-labels";

export const HIDDEN_LAYER_KEYWORDS = [
  "road",
  "label",
  "poi",
  "building",
  "transit",
  "admin",
  "settlement",
];
