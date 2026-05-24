import { formatMapValue } from "./leafletMapUtils";

export default function LeafletMapDetailPanel({ beach, onClose }) {
  if (!beach) return null;

  return (
    <aside className="leaflet-map-detail" aria-label={`${beach.name} details`}>
      <button className="leaflet-map-detail__close" type="button" onClick={onClose} aria-label="Close beach detail">
        x
      </button>
      <div className="leaflet-map-detail__title">
        <span className="leaflet-map-detail__dot" style={{ "--marker-color": beach.mapColor }} />
        <div>
          <span>{beach.mapType}</span>
          <h2>{beach.name}</h2>
        </div>
      </div>

      <dl className="leaflet-map-detail__conditions">
        <div>
          <dt>Water</dt>
          <dd>{formatMapValue(beach.waterTemp, typeof beach.waterTemp === "number" ? "°c" : "")}</dd>
        </div>
        <div>
          <dt>Waves</dt>
          <dd>{formatMapValue(beach.waves, typeof beach.waves === "number" ? "m" : "")}</dd>
        </div>
        <div>
          <dt>Wind</dt>
          <dd>{formatMapValue(beach.wind, typeof beach.wind === "number" ? "km/h" : "")}</dd>
        </div>
        <div>
          <dt>UV</dt>
          <dd>{formatMapValue(beach.uv)}</dd>
        </div>
      </dl>

      <div className="leaflet-map-detail__section">
        <span>Best for</span>
        <p>{beach.bestFor}</p>
      </div>
      <div className="leaflet-map-detail__section">
        <span>Patrol</span>
        <p>{beach.lifeguard}</p>
      </div>
      <div className="leaflet-map-detail__section">
        <span>Parking</span>
        <p>{beach.parking}</p>
      </div>
    </aside>
  );
}
