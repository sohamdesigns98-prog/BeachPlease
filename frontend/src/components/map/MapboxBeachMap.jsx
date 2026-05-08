import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

import ShoreMap from "@/components/ShoreMap";
import MapTooltip from "@/components/map/MapTooltip";
import {
  MAPBOX_INITIAL_CAMERA,
  MAPBOX_STYLE_URL,
} from "@/components/map/mapConstants";
import { beachConditionsToGeoJSON } from "@/components/map/mapData";
import {
  addBeachSourceAndLayers,
  addRegionHitZoneLayers,
  addSubtle3DContext,
  simplifyBaseStyle,
  updateBeachLayerState,
  updateBeachSource,
  updateRegionLayerState,
} from "@/components/map/mapLayers";
import {
  bindBeachInteractions,
  bindRegionInteractions,
} from "@/components/map/mapInteractions";
import { REGION_CONFIG } from "@/components/map/regionConfig";

export default function MapboxBeachMap({
  beaches = [],
  isFallback = false,
  region = null,
  activity = null,
  candidateBeachSlugs = [],
  preferredBeachSlug = "",
  selectedBeachSlug = "",
  selectedBeachName = "",
  onBeachPreview,
  onRegionSelect,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const onBeachPreviewRef = useRef(onBeachPreview);
  const onRegionSelectRef = useRef(onRegionSelect);
  const geojsonRef = useRef(null);
  const activityRef = useRef(activity);
  const regionRef = useRef(region);
  const cleanupInteractionsRef = useRef(null);
  const [mapError, setMapError] = useState("");
  const [tooltip, setTooltip] = useState(null);
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN?.trim();
  const geojson = useMemo(
    () => beachConditionsToGeoJSON(beaches, {
      selectedBeachSlug,
      preferredBeachSlug,
      candidateBeachSlugs,
      showCandidateLabels: Boolean(activity),
    }),
    [activity, beaches, candidateBeachSlugs, preferredBeachSlug, selectedBeachSlug],
  );

  useEffect(() => {
    if (!import.meta.env.DEV) return;

    console.log("Mapbox token exists:", Boolean(mapboxToken));
    console.log(
      "Mapbox token preview:",
      mapboxToken ? `${mapboxToken.slice(0, 8)}...` : "missing",
    );
  }, [mapboxToken]);

  useEffect(() => {
    onBeachPreviewRef.current = onBeachPreview;
  }, [onBeachPreview]);

  useEffect(() => {
    onRegionSelectRef.current = onRegionSelect;
  }, [onRegionSelect]);

  useEffect(() => {
    geojsonRef.current = geojson;
  }, [geojson]);

  useEffect(() => {
    activityRef.current = activity;
  }, [activity]);

  useEffect(() => {
    regionRef.current = region;
  }, [region]);

  useEffect(() => {
    if (!mapboxToken || !containerRef.current || mapRef.current) return undefined;

    mapboxgl.accessToken = mapboxToken;

    try {
      const map = new mapboxgl.Map({
        container: containerRef.current,
        style: MAPBOX_STYLE_URL,
        ...MAPBOX_INITIAL_CAMERA,
        attributionControl: false,
      });

      mapRef.current = map;
      map.scrollZoom.disable();
      map.dragRotate.disable();
      map.touchZoomRotate.disableRotation();
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

      map.on("load", () => {
        simplifyBaseStyle(map);
        addSubtle3DContext(map);
        addRegionHitZoneLayers(map, regionRef.current);
        addBeachSourceAndLayers(map, geojsonRef.current || geojson, activityRef.current);
        flyToRegionCamera(map, regionRef.current);
        const cleanupBeachInteractions = bindBeachInteractions(
          map,
          (beach) => onBeachPreviewRef.current?.(beach),
          (beach, point) => setTooltip({ beach, point }),
          () => setTooltip(null),
        );
        const cleanupRegionInteractions = bindRegionInteractions(
          map,
          (nextRegion) => onRegionSelectRef.current?.(nextRegion),
        );
        cleanupInteractionsRef.current = () => {
          cleanupBeachInteractions();
          cleanupRegionInteractions();
        };
      });

      map.on("error", (event) => {
        console.error("Mapbox error:", event?.error || event);
        setMapError(event?.error?.message || "Mapbox failed to load");
      });
    } catch (error) {
      setMapError(error.message || "Mapbox failed to initialise");
    }

    return () => {
      cleanupInteractionsRef.current?.();
      cleanupInteractionsRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [mapboxToken]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    updateBeachSource(map, geojson);
  }, [geojson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    updateBeachLayerState(map, activity);
  }, [activity]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded()) return;

    flyToRegionCamera(map, region);
    updateRegionLayerState(map, region);
  }, [region]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.loaded() || !selectedBeachSlug) return;

    const selectedBeach = beaches.find((beach) => beach.slug === selectedBeachSlug);
    if (!selectedBeach) return;

    map.flyTo({
      center: [Number(selectedBeach.lng), Number(selectedBeach.lat)],
      zoom: 13.2,
      pitch: 45,
      bearing: map.getBearing(),
      duration: 900,
      essential: true,
    });
  }, [beaches, selectedBeachSlug]);

  if (!mapboxToken || mapError) {
    return (
      <div className="mapbox-fallback-shell">
        <ShoreMap
          mapBeaches={beaches}
          isFallback={isFallback || Boolean(mapError)}
          selectedBeachSlug={selectedBeachSlug || preferredBeachSlug}
          selectedBeachName={selectedBeachName}
          onBeachSelect={onBeachPreview}
        />
        <p className="map-token-missing">
          {mapError ? (
            <>
              MAPBOX UNAVAILABLE //
              <br />
              {mapError}
            </>
          ) : (
            <>
              MAPBOX TOKEN MISSING //
              <br />
              Add VITE_MAPBOX_TOKEN to frontend/.env and restart npm run dev.
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <section className="mapbox-beach-map" aria-label="Interactive Sydney beach map">
      <div ref={containerRef} className="mapbox-beach-map__canvas" />
      <MapTooltip beach={tooltip?.beach} point={tooltip?.point} />
      {isFallback && <p className="map-token-missing">LIVE DATA UNAVAILABLE</p>}
    </section>
  );
}

function flyToRegionCamera(map, region) {
  const camera = region ? REGION_CONFIG[region]?.camera : MAPBOX_INITIAL_CAMERA;
  if (!camera) return;

  map.flyTo({
    ...camera,
    duration: 850,
    essential: true,
  });
}
