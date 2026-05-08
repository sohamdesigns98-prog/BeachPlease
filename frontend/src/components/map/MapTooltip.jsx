function formatValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "n/a";
  return `${value}${suffix}`;
}

export default function MapTooltip({ beach, point }) {
  if (!beach || !point) return null;

  const conditions = beach.conditions || {};
  const crowd = beach.crowd || {};

  return (
    <aside
      className="map-tooltip"
      style={{
        transform: `translate(${point.x + 14}px, ${point.y - 18}px)`,
      }}
      aria-hidden="true"
    >
      <strong>{beach.name}</strong>
      <span>
        {formatValue(conditions.wave_height_m, "m")}
        {" · "}
        {formatValue(conditions.wind_kmh, "km/h")}
        {" · "}
        {formatValue(conditions.temperature, "°")}
        {" · "}
        UV{formatValue(conditions.uv_index)}
      </span>
      <small>
        {crowd.bars || "░░░░░░░░░░"} {crowd.label || "crowd n/a"}
      </small>
    </aside>
  );
}
