import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const FALLBACK_IMAGE = "/landing-scroll.jpg";

export default function CircularBeachTile({
  tile,
  index = 0,
  layout,
  scattered,
  isAssembled = false,
  isHovered = false,
  isDimmed = false,
  isMatched = true,
  isSelected = false,
  imageUrl = "",
  conditionLine = "",
  regionLabel = "",
  clusterBadges = [],
  onHover,
  onSelect,
}) {
  const tileRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    if (!isHovered) setTilt({ rotateX: 0, rotateY: 0 });
  }, [isHovered]);

  function handlePointerMove(event) {
    if (prefersReducedMotion) return;

    const element = tileRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({
      rotateX: -y * 10,
      rotateY: x * 12,
    });
  }

  const target = prefersReducedMotion || isAssembled
    ? {
      x: layout.x,
      y: layout.y,
      rotate: layout.rotate,
      scale: isHovered ? layout.scale + 0.16 : layout.scale,
      opacity: isDimmed ? 0.28 : isMatched ? 1 : 0.16,
    }
    : {
      x: scattered.x,
      y: scattered.y,
      rotate: scattered.rotate,
      scale: 0.88,
      opacity: 0,
    };

  return (
    <motion.article
      ref={tileRef}
      role="button"
      tabIndex={0}
      className={`circular-beach-tile ${isHovered ? "is-hovered" : ""} ${isSelected ? "is-selected" : ""} ${isMatched ? "is-matched" : "is-muted"}`}
      initial={{
        x: prefersReducedMotion ? layout.x : scattered.x,
        y: prefersReducedMotion ? layout.y : scattered.y,
        rotate: prefersReducedMotion ? layout.rotate : scattered.rotate,
        scale: prefersReducedMotion ? layout.scale : 0.88,
        opacity: prefersReducedMotion ? 1 : 0,
      }}
      animate={target}
      transition={{
        duration: prefersReducedMotion ? 0 : isAssembled ? 0.62 : 1.25,
        ease: [0.19, 1, 0.22, 1],
        delay: prefersReducedMotion || isAssembled ? 0 : index * 0.035,
      }}
      style={{
        zIndex: isHovered || isSelected ? 80 : layout.zIndex,
        "--tile-accent": tile.accent || "#91C059",
        "--tile-depth-shadow": layout.shadow,
      }}
      onPointerEnter={() => onHover?.(tile.slug)}
      onPointerMove={handlePointerMove}
      onPointerLeave={() => {
        setTilt({ rotateX: 0, rotateY: 0 });
        onHover?.("");
      }}
      onClick={() => onSelect?.(tile)}
      onKeyDown={(event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        onSelect?.(tile);
      }}
    >
      {clusterBadges.length > 0 && (
        <div className="circular-beach-tile__clusters" aria-label="Saved clusters">
          {clusterBadges.slice(0, 2).map((cluster) => (
            <span key={cluster.id || cluster._id || cluster.name} style={{ "--cluster-color": cluster.color || "#91C059" }}>
              {cluster.name}
            </span>
          ))}
        </div>
      )}
      <motion.div
        className="circular-beach-tile__image"
        animate={{
          rotateX: isHovered ? tilt.rotateX : 0,
          rotateY: isHovered ? tilt.rotateY : 0,
          z: isHovered ? 36 : 0,
        }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.16, ease: "easeOut" }}
      >
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
      </motion.div>
      <div className="circular-beach-tile__meta">
        <strong>{tile.name?.toLowerCase()}</strong>
        <span>{conditionLine}</span>
        <small>{regionLabel || "sydney"}</small>
      </div>
    </motion.article>
  );
}
