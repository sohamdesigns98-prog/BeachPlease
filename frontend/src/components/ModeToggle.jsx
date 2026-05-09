const MODES = ["saved", "mood", "map"];

export default function ModeToggle({ activeMode = "mood", savedCount = 0, onChange }) {
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
          {mode === "saved" && savedCount > 0 && (
            <span className="mode-toggle__badge">{savedCount}</span>
          )}
        </button>
      ))}
    </nav>
  );
}
