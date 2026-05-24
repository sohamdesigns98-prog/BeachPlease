import { useEffect, useMemo, useState } from "react";

import { getMapConditions } from "@/api/conditions";
import LeafletBeachMap from "./LeafletBeachMap";
import LeafletMapDetailPanel from "./LeafletMapDetailPanel";
import LeafletMapSidebar from "./LeafletMapSidebar";
import {
  buildLeafletBeachData,
  filterLeafletBeaches,
} from "./leafletMapUtils";
import "./leafletMap.css";

export default function LeafletMapMode({
  beaches = [],
  isFallback = false,
  candidateBeachSlugs = [],
  preferredBeachSlug = "",
  selectedBeachSlug = "",
  onBeachPreview,
}) {
  const [query, setQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [localSelectedSlug, setLocalSelectedSlug] = useState(selectedBeachSlug || preferredBeachSlug || "");
  const [conditions, setConditions] = useState([]);
  const [conditionsError, setConditionsError] = useState("");
  const [mapError, setMapError] = useState("");

  useEffect(() => {
    setLocalSelectedSlug(selectedBeachSlug || preferredBeachSlug || "");
  }, [preferredBeachSlug, selectedBeachSlug]);

  useEffect(() => {
    let cancelled = false;

    async function loadMapConditions() {
      try {
        const data = await getMapConditions();
        if (!cancelled) {
          setConditions(Array.isArray(data) ? data : []);
          setConditionsError("");
        }
      } catch {
        if (!cancelled) {
          setConditions([]);
          setConditionsError("Live conditions unavailable");
        }
      }
    }

    loadMapConditions();

    return () => {
      cancelled = true;
    };
  }, []);

  const mapData = useMemo(
    () => buildLeafletBeachData(beaches, conditions),
    [beaches, conditions],
  );

  const filteredBeaches = useMemo(
    () => filterLeafletBeaches(mapData.beaches, query, activeFilter),
    [activeFilter, mapData.beaches, query],
  );

  const selectedBeach = useMemo(
    () => mapData.beaches.find((beach) => beach.slug === localSelectedSlug) || null,
    [localSelectedSlug, mapData.beaches],
  );

  function handleBeachSelect(beach) {
    setLocalSelectedSlug(beach.slug);
    onBeachPreview?.(beach);
  }

  const sourceNote = mapData.source === "fallback"
    ? "Fallback map data"
    : conditionsError || (isFallback ? "Beach data available" : mapData.note);

  if (!mapData.beaches.length) {
    return (
      <section className="leaflet-map-mode leaflet-map-mode--empty">
        <div className="leaflet-map-empty-state">
          <span>Map mode</span>
          <h2>Couldn’t load the coast.</h2>
          <p>Mood mode still works. Try Map again in a moment.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="leaflet-map-mode" aria-label="Sydney beach map mode">
      {mapError ? (
        <div className="leaflet-map-empty-state">
          <span>Map mode</span>
          <h2>Map view had a wobble.</h2>
          <p>{mapError}. Mood mode and planning are still available.</p>
        </div>
      ) : (
        <>
          <LeafletBeachMap
            beaches={filteredBeaches}
            selectedBeachSlug={localSelectedSlug}
            highlightedBeachSlugs={candidateBeachSlugs}
            onBeachSelect={handleBeachSelect}
            onMapError={setMapError}
          />
          <LeafletMapSidebar
            beaches={filteredBeaches}
            query={query}
            activeFilter={activeFilter}
            selectedBeachSlug={localSelectedSlug}
            sourceNote={sourceNote}
            onQueryChange={setQuery}
            onFilterChange={setActiveFilter}
            onBeachSelect={handleBeachSelect}
          />
          <LeafletMapDetailPanel
            beach={selectedBeach}
            onClose={() => setLocalSelectedSlug("")}
          />
        </>
      )}
    </section>
  );
}
