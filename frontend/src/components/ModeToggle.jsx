const MODES = ["canvas", "map"];

export default function ModeToggle({
  activeMode = "",
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
        </button>
      ))}
    </nav>
  );
}
