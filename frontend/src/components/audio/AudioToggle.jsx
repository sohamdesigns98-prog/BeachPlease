import { useEffect, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";

import {
  getBeachAmbienceMuted,
  prepareBeachAmbience,
  setBeachAmbienceMuted,
  startBeachAmbience,
  subscribeBeachAmbience,
} from "@/audio/beachAmbience";

export default function AudioToggle({ className = "" }) {
  const [isMuted, setIsMuted] = useState(getBeachAmbienceMuted);

  useEffect(() => {
    prepareBeachAmbience();
    return subscribeBeachAmbience(setIsMuted);
  }, []);

  function handleToggle() {
    const nextMuted = !isMuted;
    setBeachAmbienceMuted(nextMuted);
    if (!nextMuted) {
      startBeachAmbience({ fadeIn: true });
    }
  }

  return (
    <button
      type="button"
      className={`audio-toggle ${className}`}
      aria-pressed={!isMuted}
      aria-label={isMuted ? "Turn sound on" : "Turn sound off"}
      title={isMuted ? "Sound off" : "Sound on"}
      onClick={handleToggle}
    >
      {isMuted ? <VolumeX size={16} strokeWidth={1.8} /> : <Volume2 size={16} strokeWidth={1.8} />}
    </button>
  );
}
