import { useEffect, useRef, useState } from "react";

const FALLBACK_IMAGE = "/landing-scroll.jpg";

function usePrefersReducedMotion() {
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);

    function handleChange(event) {
      setPrefersReduced(event.matches);
    }

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReduced;
}

export default function ParallaxBeachTile({
  tile,
  className = "",
  style,
  imageUrl,
  matchLabel,
  conditionLine,
  regionLabel,
  clusterBadges = [],
  onPointerDown,
  onClick,
  onKeyDown,
  onAddToCluster,
}) {
  const tileRef = useRef(null);
  const prefersReducedMotion = usePrefersReducedMotion();

  function resetParallax() {
    const element = tileRef.current;
    if (!element) return;

    element.style.setProperty("--parallax-rotate-x", "0deg");
    element.style.setProperty("--parallax-rotate-y", "0deg");
    element.style.setProperty("--parallax-shift-x", "0px");
    element.style.setProperty("--parallax-shift-y", "0px");
  }

  function handlePointerMove(event) {
    if (prefersReducedMotion || event.buttons !== 0) return;

    const element = tileRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    element.style.setProperty("--parallax-rotate-x", `${(-y * 10).toFixed(2)}deg`);
    element.style.setProperty("--parallax-rotate-y", `${(x * 13).toFixed(2)}deg`);
    element.style.setProperty("--parallax-shift-x", `${(x * 12).toFixed(2)}px`);
    element.style.setProperty("--parallax-shift-y", `${(y * 10).toFixed(2)}px`);
    element.style.setProperty("--parallax-glow-x", `${((x + 0.5) * 100).toFixed(2)}%`);
    element.style.setProperty("--parallax-glow-y", `${((y + 0.5) * 100).toFixed(2)}%`);
  }

  return (
    <div
      ref={tileRef}
      role="button"
      tabIndex={0}
      className={className}
      style={style}
      onPointerDown={onPointerDown}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetParallax}
      onPointerCancel={resetParallax}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {clusterBadges.length > 0 && (
        <div className="beach-image-tile__clusters" aria-label="Saved clusters">
          {clusterBadges.slice(0, 2).map((cluster) => (
            <span key={cluster.id || cluster._id || cluster.name} style={{ "--cluster-color": cluster.color || "#91C059" }}>
              {cluster.name}
            </span>
          ))}
          {clusterBadges.length > 2 && <span style={{ "--cluster-color": "#111111" }}>+{clusterBadges.length - 2}</span>}
        </div>
      )}
      <button
        type="button"
        className="beach-tile-add-button"
        aria-label={`Add ${tile.name} to cluster`}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => {
          event.stopPropagation();
          onAddToCluster?.(tile);
        }}
      >
        +
      </button>
      <div className="beach-image-tile__parallax" aria-hidden="true">
        <img
          src={imageUrl || FALLBACK_IMAGE}
          alt=""
          draggable="false"
          onError={(event) => {
            if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
              event.currentTarget.src = FALLBACK_IMAGE;
            }
          }}
        />
      </div>
      <span className="beach-image-tile__label">{tile.name.toLowerCase()}</span>
      <span className="beach-image-tile__bubble">
        <strong>{matchLabel || tile.name.toLowerCase()}</strong>
        <small>{conditionLine}</small>
        <small>{regionLabel || "sydney"}</small>
      </span>
    </div>
  );
}
