import { MAP_FILTERS } from "./leafletMapUtils";

export default function LeafletMapFilters({ activeFilter, onFilterChange }) {
  return (
    <div className="leaflet-map-filters" aria-label="Map filters">
      {MAP_FILTERS.map((filter) => (
        <button
          key={filter.id}
          className={activeFilter === filter.id ? "is-active" : ""}
          type="button"
          onClick={() => onFilterChange(filter.id)}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}
