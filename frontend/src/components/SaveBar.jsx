import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export default function SaveBar({
  isSaved = false,
  isSaving = false,
  error = "",
  savedPlanId = "",
  onDismiss,
  onSave,
}) {
  return (
    <aside className={`save-bar ${isSaved ? "is-saved" : ""}`} aria-live="polite">
      <div className="save-bar__copy">
        <strong>{isSaved ? "Plan saved" : "Keep this plan?"}</strong>
        <p>{isSaved ? "You can open it from your saved plans." : "Save it, add notes, and replay it later with fresh conditions."}</p>
        {error && <span>{error}</span>}
      </div>
      {isSaved && (
        <div>
          {savedPlanId && (
            <Button asChild className="save-bar-button">
              <Link to={`/plans/${savedPlanId}`}>open plan</Link>
            </Button>
          )}
          <Button asChild variant="ghost" className="save-bar-button is-muted">
            <Link to="/saved-plans">saved plans</Link>
          </Button>
        </div>
      )}
      {!isSaved && (
        <div>
          <Button
            type="button"
            variant="ghost"
            className="save-bar-button is-muted"
            onClick={onDismiss}
            disabled={isSaving}
          >
            Not now
          </Button>
          <Button
            type="button"
            className="save-bar-button"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : "Save plan"}
          </Button>
        </div>
      )}
    </aside>
  );
}
