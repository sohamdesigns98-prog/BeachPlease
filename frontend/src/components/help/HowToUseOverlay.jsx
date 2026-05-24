import { useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function HowToUseOverlay({ onClose }) {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") onClose?.();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const motionProps = prefersReducedMotion
    ? { initial: false, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.28, ease: "easeOut" },
      };

  return (
    <motion.section
      className="how-to-use-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-use-title"
      {...motionProps}
    >
      <div className="how-to-use-overlay__content">
        <h1 id="how-to-use-title">G’day mate.</h1>
        <div className="how-to-use-overlay__body">
          <p>
            Start with the coast. Move around the beach canvas, hover over a tile for the quick read, and click any beach that catches your eye.
          </p>
          <p>
            If you already know the kind of day you want, use Create Plan. Tell us the mood, who’s coming, which part of Sydney you’re feeling, what you want to do, and whether coffee, lunch, or a drink after matters.
          </p>
          <p>
            We’ll check the live conditions, compare the beaches, and turn that into a proper plan. Not just “go here”, but when to go, why it fits, what to bring, and what to keep an eye on.
          </p>
        </div>
        <ol className="how-to-use-overlay__steps">
          <li>Explore the canvas.</li>
          <li>Click a beach for details.</li>
          <li>Create a plan with your mood and preferences.</li>
          <li>Save the good ones.</li>
          <li>Replay saved plans later with fresh conditions.</li>
        </ol>
        <button type="button" className="how-to-use-overlay__button" onClick={onClose} autoFocus>
          Got it
        </button>
      </div>
    </motion.section>
  );
}
