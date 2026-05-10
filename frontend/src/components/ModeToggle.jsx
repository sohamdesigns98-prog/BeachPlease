const MODES = ["cluster", "mood", "map", "saved"];

export default function ModeToggle({
  activeMode = "",
  savedCount = 0,
  clusterCount = 0,
  onChange,
}) {
  return (
    <nav className="mode-toggle" aria-label="BeachPlease modes">
      {MODES.map((mode) => (
        <button
          key={mode}
          type="button"
          className={activeMode === mode ? "is-active" : ""}
          aria-pressed={activeMode === mode}
          onClick={() => onChange?.(mode)}
        >
          {mode}
          {mode === "cluster" && clusterCount > 0 && (
            <span className="mode-toggle__badge">{clusterCount}</span>
          )}
          {mode === "saved" && savedCount > 0 && (
            <span className="mode-toggle__badge">{savedCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
