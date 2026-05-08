function formatValue(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "n/a";
  return `${value}${suffix}`;
}

export default function CandidateBeachList({
  candidates = [],
  preferredBeachSlug,
  onSelectBeach,
}) {
  if (!candidates.length) {
    return (
      <div className="candidate-beach-list is-empty">
        <p>Pick a patch and activity. We’ll show a few likely suspects.</p>
      </div>
    );
  }

  return (
    <section className="candidate-beach-list" aria-label="Candidate beaches">
      {candidates.slice(0, 3).map((beach) => {
        const conditions = beach.conditions || {};
        const crowd = beach.crowd || {};
        const isSelected = beach.slug === preferredBeachSlug;

        return (
          <button
            key={beach.slug}
            type="button"
            className={`candidate-beach ${isSelected ? "is-selected" : ""}`}
            onClick={() => onSelectBeach(beach)}
          >
            <span>{beach.name}</span>
            <small>
              {formatValue(conditions.wave_height_m, "m")}
              {" · "}
              wind {formatValue(conditions.wind_kmh, "kmh")}
              {" · "}
              UV{formatValue(conditions.uv_index)}
              {" · "}
              {crowd.label || "crowd n/a"} {crowd.bars || ""}
              {beach.candidateReason ? ` · ${beach.candidateReason}` : ""}
            </small>
          </button>
        );
      })}
    </section>
  );
}
