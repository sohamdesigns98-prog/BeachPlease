import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { BUTTON_COPY, LANDING_COPY } from "@/content/voice";

const CLOUD_VIDEO_SRC = "/CloudAsset.mp4";
const CLOUD_PLAYBACK_RATE = 0.72;
const TYPE_SPEED_MS = 18;
const FIRST_PARAGRAPH_DELAY_MS = 600;
const BETWEEN_PARAGRAPHS_DELAY_MS = 400;

export default function LandingIntro({ isExiting = false, onEnter }) {
  const paragraphs = useMemo(() => {
    const copy = LANDING_COPY.paragraphs;

    return [
      `${copy[0]} ${copy[1]}`,
      `${copy[2]} ${copy[3]} ${copy[4]}`,
    ];
  }, []);
  const [isContentVisible, setIsContentVisible] = useState(false);
  const [typedCounts, setTypedCounts] = useState([0, 0]);
  const [activeParagraph, setActiveParagraph] = useState(-1);
  const [showButton, setShowButton] = useState(false);
  const timersRef = useRef([]);

  function slowCloudVideo(event) {
    event.currentTarget.playbackRate = CLOUD_PLAYBACK_RATE;
  }

  function clearTypingTimers() {
    timersRef.current.forEach((timer) => {
      window.clearTimeout(timer);
      window.clearInterval(timer);
    });
    timersRef.current = [];
  }

  function completeTyping() {
    clearTypingTimers();
    setTypedCounts(paragraphs.map((paragraph) => paragraph.length));
    setActiveParagraph(-1);
    setShowButton(true);
  }

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setIsContentVisible(true));

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    function typeParagraph(index) {
      setActiveParagraph(index);

      const interval = window.setInterval(() => {
        setTypedCounts((currentCounts) => {
          const nextCounts = [...currentCounts];
          const nextCount = Math.min(nextCounts[index] + 1, paragraphs[index].length);
          nextCounts[index] = nextCount;

          if (nextCount >= paragraphs[index].length) {
            window.clearInterval(interval);

            if (index === 0) {
              const nextTimer = window.setTimeout(() => {
                typeParagraph(1);
              }, BETWEEN_PARAGRAPHS_DELAY_MS);
              timersRef.current.push(nextTimer);
            } else {
              setActiveParagraph(-1);
              setShowButton(true);
            }
          }

          return nextCounts;
        });
      }, TYPE_SPEED_MS);

      timersRef.current.push(interval);
    }

    const firstTimer = window.setTimeout(() => {
      typeParagraph(0);
    }, FIRST_PARAGRAPH_DELAY_MS);
    timersRef.current.push(firstTimer);

    return clearTypingTimers;
  }, [paragraphs]);

  useEffect(() => {
    function handleDocumentClick() {
      if (!showButton && !isExiting) {
        completeTyping();
      }
    }

    document.addEventListener("click", handleDocumentClick);

    return () => document.removeEventListener("click", handleDocumentClick);
  }, [isExiting, paragraphs, showButton]);

  return (
    <section className={`landing-intro ${isExiting ? "landing-exiting" : ""}`}>
      <video
        className="landing-intro__video"
        src={CLOUD_VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        onLoadedMetadata={slowCloudVideo}
      />

      <div className="landing-intro__veil" aria-hidden="true" />

      <div
        className={`landing-intro__content ${isContentVisible ? "is-visible" : ""}`}
        aria-label="BeachPlease introduction"
      >
        {paragraphs.map((paragraph, index) => (
          <p key={paragraph}>
            {paragraph.slice(0, typedCounts[index])}
            {activeParagraph === index && <span className="typewriter-cursor">▋</span>}
          </p>
        ))}

        <Button
          type="button"
          className={`landing-intro__button ${showButton ? "is-visible" : ""}`}
          disabled={isExiting}
          onClick={(event) => {
            event.stopPropagation();
            if (showButton) onEnter();
          }}
        >
          {BUTTON_COPY.enterExperience}
        </Button>
      </div>
    </section>
  );
}
