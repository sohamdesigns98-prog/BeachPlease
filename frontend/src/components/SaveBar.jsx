import { Button } from "@/components/ui/button";

export default function SaveBar({
  isSaved = false,
  isSaving = false,
  error = "",
  onDismiss,
  onSave,
}) {
  return (
    <aside className={`save-bar ${isSaved ? "is-saved" : ""}`} aria-live="polite">
      <p>{isSaved ? "saved ✓" : "want to keep this? save your plan - free, takes 20 seconds."}</p>
      {error && <span>{error}</span>}
      {!isSaved && (
        <div>
          <Button
            type="button"
            variant="ghost"
            className="save-bar-button is-muted"
            onClick={onDismiss}
            disabled={isSaving}
          >
            not now
          </Button>
          <Button
            type="button"
            className="save-bar-button"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "saving..." : "save plan"}
          </Button>
        </div>
      )}
    </aside>
  );
}
