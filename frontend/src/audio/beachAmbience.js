import { Howl, Howler } from "howler";

const MUTE_KEY = "beachplease_sound_muted";
const FADE_MS = 3600;
const COMFORT_VOLUME = 0.62;
const ENTERED_VOLUME_MULTIPLIER = 0.5;

const LAYERS = [
  { id: "waves", src: "/audio/waves.wav", volume: 0.28, stereo: -0.25 },
  { id: "people", src: "/audio/people.wav", volume: 0.045, stereo: 0.35 },
  { id: "wind", src: "/audio/wind.wav", volume: 0.075, stereo: 0.1 },
  { id: "gulls", src: "/audio/gulls.wav", volume: 0.035, stereo: 0.55 },
];

let sounds = [];
let hasPrepared = false;
let hasStarted = false;
let isMuted = readInitialMuted();
let volumeMultiplier = ENTERED_VOLUME_MULTIPLIER;
const listeners = new Set();

function readInitialMuted() {
  try {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(MUTE_KEY) === "true";
  } catch {
    return false;
  }
}

function persistMuted(nextMuted) {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(MUTE_KEY, String(nextMuted));
  } catch {
    // Sound preference is non-critical.
  }
}

function notify() {
  listeners.forEach((listener) => listener(isMuted));
}

function ensureSounds() {
  if (hasPrepared) return sounds;

  sounds = LAYERS.map((layer) => {
    const sound = new Howl({
      src: [layer.src],
      loop: true,
      volume: 0,
      preload: true,
      html5: false,
      onloaderror: (_id, error) => {
        console.warn(`Beach ambience failed to load ${layer.id}:`, error);
      },
      onplayerror: (_id, error) => {
        console.warn(`Beach ambience could not autoplay ${layer.id}:`, error);
      },
    });

    return { ...layer, sound };
  });

  Howler.mute(isMuted);
  hasPrepared = true;
  return sounds;
}

function targetVolumeFor(layerVolume) {
  return layerVolume * COMFORT_VOLUME * volumeMultiplier;
}

export function prepareBeachAmbience() {
  ensureSounds();
}

export function startBeachAmbience({ fadeIn = true } = {}) {
  const nextSounds = ensureSounds();

  if (isMuted) {
    Howler.mute(true);
    return;
  }

  Howler.mute(false);

  nextSounds.forEach(({ sound, volume, stereo }) => {
    if (!sound.playing()) {
      sound.volume(0);
      sound.play();
    }
    if (typeof sound.stereo === "function") {
      sound.stereo(stereo);
    }

    const targetVolume = targetVolumeFor(volume);
    if (fadeIn) {
      sound.fade(sound.volume(), targetVolume, FADE_MS);
    } else {
      sound.volume(targetVolume);
    }
  });

  hasStarted = true;
}

export function setBeachAmbienceEntered() {
  volumeMultiplier = ENTERED_VOLUME_MULTIPLIER;
  const nextSounds = ensureSounds();

  nextSounds.forEach(({ sound, volume }) => {
    sound.fade(sound.volume(), targetVolumeFor(volume), 900);
  });
}

export function setBeachAmbienceMuted(nextMuted) {
  isMuted = Boolean(nextMuted);
  persistMuted(isMuted);
  ensureSounds();
  Howler.mute(isMuted);

  if (!isMuted && !hasStarted) {
    startBeachAmbience({ fadeIn: true });
  }

  notify();
}

export function toggleBeachAmbience() {
  setBeachAmbienceMuted(!isMuted);
}

export function getBeachAmbienceMuted() {
  return isMuted;
}

export function subscribeBeachAmbience(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
