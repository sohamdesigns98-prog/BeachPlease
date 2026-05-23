const LOADING_IMAGE = "/loading.png";

export default function GeneratingOverlay({ isVisible = false }) {
  return (
    <div className={`generating-overlay ${isVisible ? "is-visible" : ""}`} aria-live="polite">
      <img src={LOADING_IMAGE} alt="" />
      <h2>Generating beach</h2>
    </div>
  );
}
