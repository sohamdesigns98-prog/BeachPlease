import { GENERATING_STEPS } from "@/content/voice";
import { getGeneratingCopy } from "@/utils/voiceHelpers";

export default function GeneratingOverlay({ mood = "", isVisible = false }) {
  const copy = getGeneratingCopy(mood);

  return (
    <div className={`generating-overlay ${isVisible ? "is-visible" : ""}`} aria-live="polite">
      <h2>{copy.title}</h2>
      <p>{copy.subtitle}</p>
      <div className="generating-step-list">
        {GENERATING_STEPS.map((step) => (
          <span key={step}>{step}</span>
        ))}
      </div>
    </div>
  );
}
