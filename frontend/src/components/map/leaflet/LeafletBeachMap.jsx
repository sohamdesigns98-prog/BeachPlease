import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  createMarkerHtml,
  MAP_CENTER,
  SYDNEY_CENTER,
} from "./leafletMapUtils";

export default function LeafletBeachMap({
  beaches = [],
  selectedBeachSlug = "",
  highlightedBeachSlugs = [],
  onBeachSelect,
  onMapError,
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markerLayerRef = useRef(null);
  const onBeachSelectRef = useRef(onBeachSelect);
  const highlightedSet = new Set(highlightedBeachSlugs);

  useEffect(() => {
    onBeachSelectRef.current = onBeachSelect;
  }, [onBeachSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return undefined;

    try {
      const map = L.map(containerRef.current, {
        center: MAP_CENTER,
        zoom: 11,
        zoomControl: false,
        attributionControl: false,
        preferCanvas: true,
      });

      L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(map);

      L.circle(SYDNEY_CENTER, {
        radius: 100000,
        color: "#1f1f1f",
        weight: 1,
        opacity: 0.1,
        fill: true,
        fillColor: "#1f1f1f",
        fillOpacity: 0.015,
        dashArray: "6,6",
      }).addTo(map);

      L.circleMarker(SYDNEY_CENTER, {
        radius: 4,
        color: "#111111",
        weight: 2,
        fillOpacity: 0,
        opacity: 0.45,
      }).addTo(map);

      markerLayerRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;
    } catch (error) {
      onMapError?.(error?.message || "Leaflet map failed to initialise");
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerLayerRef.current = null;
    };
  }, [onMapError]);

  useEffect(() => {
    const markerLayer = markerLayerRef.current;
    if (!markerLayer) return;

    markerLayer.clearLayers();

    beaches.forEach((beach) => {
      if (!Number.isFinite(beach.lat) || !Number.isFinite(beach.lng)) return;

      const isSelected = beach.slug === selectedBeachSlug;
      const isHighlighted = highlightedSet.has(beach.slug);
      const marker = L.marker([beach.lat, beach.lng], {
        icon: L.divIcon({
          html: createMarkerHtml(beach, isSelected, isHighlighted),
          className: "leaflet-map-marker-icon",
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        }),
        keyboard: true,
        title: beach.name,
      });

      marker.on("click", () => onBeachSelectRef.current?.(beach));
      marker.addTo(markerLayer);
    });
  }, [beaches, highlightedSet, selectedBeachSlug]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedBeachSlug) return;

    const selectedBeach = beaches.find((beach) => beach.slug === selectedBeachSlug);
    if (!selectedBeach || !Number.isFinite(selectedBeach.lat) || !Number.isFinite(selectedBeach.lng)) return;

    map.flyTo([selectedBeach.lat, selectedBeach.lng], 13.2, {
      duration: 0.9,
      easeLinearity: 0.24,
    });
  }, [beaches, selectedBeachSlug]);

  return <div ref={containerRef} className="leaflet-map-canvas" aria-label="Interactive Sydney beach map" />;
}
