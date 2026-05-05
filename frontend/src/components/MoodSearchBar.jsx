import { useEffect, useState } from "react";
import { Search } from "lucide-react";

import { LOADING_COPY } from "@/content/voice";
import { getRandomPlaceholder } from "@/utils/voiceHelpers";

export default function MoodSearchBar({
  value,
  isLoading = false,
  moodRing,
  progressMessage,
  onChange,
  onSubmit,
}) {
  const [placeholder, setPlaceholder] = useState(() => getRandomPlaceholder());
  const displayValue = isLoading ? LOADING_COPY.moodSearch : value;
  const activePlaceholder = isLoading ? LOADING_COPY.moodSearch : placeholder;

  useEffect(() => {
    if (value || isLoading) return undefined;

    const interval = window.setInterval(() => {
      setPlaceholder(getRandomPlaceholder());
    }, 2400);

    return () => window.clearInterval(interval);
  }, [isLoading, value]);

  return (
    <div className="mood-search-wrap">
      <form
        className="mood-search-bar"
        aria-label="Mood search"
        style={{ "--mood-ring": moodRing?.color || "#8c8c8c" }}
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <Search className="mood-search-icon" aria-hidden="true" strokeWidth={1.5} />
        <input
          className="mood-search-input"
          value={displayValue}
          readOnly={isLoading}
          placeholder={activePlaceholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </form>

      <div className="mood-search-meta" aria-live="polite">
        <span
          className={`mood-ring-dot ${moodRing ? "is-active" : ""}`}
          style={{ backgroundColor: moodRing?.color || "transparent" }}
          aria-hidden="true"
        />
        <span>{moodRing?.label || progressMessage}</span>
      </div>
    </div>
  );
}
