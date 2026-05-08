export const REGION_CONFIG = {
  northern: {
    label: "Northern Beaches",
    camera: { center: [151.31, -33.66], zoom: 10.3, pitch: 30, bearing: -8 },
    slugs: ["palm-beach", "whale-beach", "avalon-beach", "bilgola-beach", "newport-beach", "mona-vale-beach"],
  },
  manly: {
    label: "Manly",
    camera: { center: [151.29, -33.79], zoom: 11.5, pitch: 35, bearing: -8 },
    slugs: ["manly-beach", "shelly-beach-manly", "freshwater-beach", "queenscliff-beach"],
  },
  harbour: {
    label: "Harbour",
    camera: { center: [151.26, -33.84], zoom: 11.3, pitch: 35, bearing: -10 },
    slugs: ["balmoral-beach", "chinamans-beach", "milk-beach", "camp-cove"],
  },
  eastern: {
    label: "Eastern Suburbs",
    camera: { center: [151.265, -33.91], zoom: 11.2, pitch: 35, bearing: -8 },
    slugs: ["bondi-beach", "tamarama-beach", "bronte-beach", "clovelly-beach", "coogee-beach"],
  },
  south: {
    label: "South",
    camera: { center: [151.18, -34.06], zoom: 10.5, pitch: 30, bearing: 5 },
    slugs: ["maroubra-beach", "malabar-beach", "la-perouse-beach"],
  },
  cronulla: {
    label: "Cronulla",
    camera: { center: [151.155, -34.055], zoom: 11.3, pitch: 35, bearing: 5 },
    slugs: ["cronulla-beach", "wanda-beach", "elouera-beach", "north-cronulla-beach"],
  },
};

export const REGION_HIT_ZONE_GEOJSON = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      id: "northern",
      properties: { region: "northern", label: "Northern" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [151.18, -33.50],
          [151.39, -33.50],
          [151.39, -33.74],
          [151.20, -33.78],
          [151.12, -33.68],
          [151.18, -33.50],
        ]],
      },
    },
    {
      type: "Feature",
      id: "manly",
      properties: { region: "manly", label: "Manly" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [151.21, -33.74],
          [151.34, -33.74],
          [151.34, -33.84],
          [151.24, -33.86],
          [151.18, -33.81],
          [151.21, -33.74],
        ]],
      },
    },
    {
      type: "Feature",
      id: "harbour",
      properties: { region: "harbour", label: "Harbour" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [151.13, -33.78],
          [151.30, -33.78],
          [151.32, -33.88],
          [151.17, -33.90],
          [151.08, -33.85],
          [151.13, -33.78],
        ]],
      },
    },
    {
      type: "Feature",
      id: "eastern",
      properties: { region: "eastern", label: "Eastern" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [151.22, -33.86],
          [151.33, -33.86],
          [151.34, -34.00],
          [151.24, -34.02],
          [151.18, -33.94],
          [151.22, -33.86],
        ]],
      },
    },
    {
      type: "Feature",
      id: "south",
      properties: { region: "south", label: "South" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [151.08, -33.98],
          [151.28, -33.98],
          [151.29, -34.13],
          [151.10, -34.15],
          [151.02, -34.07],
          [151.08, -33.98],
        ]],
      },
    },
    {
      type: "Feature",
      id: "cronulla",
      properties: { region: "cronulla", label: "Cronulla" },
      geometry: {
        type: "Polygon",
        coordinates: [[
          [151.08, -34.02],
          [151.23, -34.02],
          [151.24, -34.12],
          [151.12, -34.16],
          [151.02, -34.11],
          [151.08, -34.02],
        ]],
      },
    },
  ],
};
