import LeafletMapFilters from "./LeafletMapFilters";
import { formatMapValue } from "./leafletMapUtils";

export default function LeafletMapSidebar({
  beaches = [],
  query,
  activeFilter,
  selectedBeachSlug,
  sourceNote,
  onQueryChange,
  onFilterChange,
  onBeachSelect,
}) {
  return (
    <aside className="leaflet-map-sidebar" aria-label="Sydney beaches">
      <div className="leaflet-map-sidebar__header">
        <span>Map mode</span>
        <h2>Sydney coast</h2>
        <p>{sourceNote}</p>
      </div>

      <label className="leaflet-map-search">
        <span>Search beaches</span>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Find a beach"
          type="search"
        />
      </label>

      <LeafletMapFilters activeFilter={activeFilter} onFilterChange={onFilterChange} />

      <div className="leaflet-map-stats" aria-label="Map overview">
        <span>{beaches.length}</span>
        <p>beaches shown</p>
      </div>

      <div className="leaflet-map-list" role="list">
        {beaches.length ? beaches.map((beach) => (
          <button
            key={beach.slug}
            className={beach.slug === selectedBeachSlug ? "leaflet-map-list__item is-active" : "leaflet-map-list__item"}
            type="button"
            role="listitem"
            onClick={() => onBeachSelect(beach)}
          >
            <span className="leaflet-map-list__dot" style={{ "--marker-color": beach.mapColor }} />
            <span>
              <strong>{beach.name}</strong>
              <small>{beach.mapType} · {formatMapValue(beach.crowdLabel)}</small>
            </span>
          </button>
        )) : (
          <p className="leaflet-map-empty">No beaches match that filter.</p>
        )}
      </div>
    </aside>
  );
}
