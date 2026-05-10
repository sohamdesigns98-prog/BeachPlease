import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import {
  prepareBeachAmbience,
  setBeachAmbienceEntered,
  startBeachAmbience,
} from "@/audio/beachAmbience";
import LandingIntro from "@/components/LandingIntro";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import Login from "@/pages/Login";
import MainExperience from "@/pages/MainExperience";
import Plan from "@/pages/Plan";
import Profile from "@/pages/Profile";
import Register from "@/pages/Register";
import ResultExperience from "@/pages/ResultExperience";
import Shelf from "@/pages/Shelf";

const TRANSITION_MS = 250;
const SPLASH_FADE_MS = 500;
const MAIN_FADE_MS = 600;
const REDUCED_MOTION_TRANSITION_MS = 250;

function HomeExperience() {
  const [showLanding, setShowLanding] = useState(true);
  const [isLandingExiting, setIsLandingExiting] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [generationInput, setGenerationInput] = useState(null);
  const [resultVisible, setResultVisible] = useState(false);
  const [resultTransitioning, setResultTransitioning] = useState(false);

  useEffect(() => {
    prepareBeachAmbience();
  }, []);

  function handleEnterExperience() {
    prepareBeachAmbience();
    startBeachAmbience({ fadeIn: true });
    setBeachAmbienceEntered();
    setIsLandingExiting(true);

    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const splashDelay = prefersReduced ? REDUCED_MOTION_TRANSITION_MS : SPLASH_FADE_MS;
    const removeDelay = prefersReduced
      ? REDUCED_MOTION_TRANSITION_MS
      : SPLASH_FADE_MS + MAIN_FADE_MS;

    window.setTimeout(() => {
      setHasEntered(true);
    }, splashDelay);

    window.setTimeout(() => {
      setShowLanding(false);
    }, removeDelay);
  }

  function handlePlanGenerated(plan, input) {
    setResultTransitioning(true);

    window.setTimeout(() => {
      setGeneratedPlan(plan);
      setGenerationInput(input || null);
      setResultVisible(false);

      window.setTimeout(() => {
        setResultVisible(true);
        setResultTransitioning(false);
      }, 20);
    }, TRANSITION_MS);
  }

  return (
    <div className="app-transition-frame">
      {hasEntered && generatedPlan ? (
        <ResultExperience
          plan={generatedPlan}
          generationInput={generationInput}
          visible={resultVisible}
        />
      ) : hasEntered ? (
        <MainExperience
          visible={!resultTransitioning}
          onPlanGenerated={handlePlanGenerated}
        />
      ) : (
        <div className="pre-entry-app-shell" aria-hidden="true" />
      )}
      {showLanding && (
        <LandingIntro
          isExiting={isLandingExiting}
          onEnter={handleEnterExperience}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomeExperience />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/shelf"
            element={(
              <ProtectedRoute>
                <Shelf />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/plans/:id"
            element={(
              <ProtectedRoute>
                <Plan />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/profile"
            element={(
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            )}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
