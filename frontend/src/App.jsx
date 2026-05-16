import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { Toaster } from "sonner";

import {
  prepareBeachAmbience,
  setBeachAmbienceEntered,
  startBeachAmbience,
} from "@/audio/beachAmbience";
import AppNavbar from "@/components/AppNavbar";
import AdminRoute from "@/components/AdminRoute";
import LandingIntro from "@/components/LandingIntro";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import Admin from "@/pages/Admin";
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

function GeneratedPlanRoute() {
  const location = useLocation();
  const state = location.state || {};

  if (!state.plan) {
    return <Navigate to="/explore/canvas" replace />;
  }

  return (
    <ResultExperience
      plan={state.plan}
      generationInput={state.generationInput}
      visible
    />
  );
}

function HomeExperience({ modeOverride = "" }) {
  const location = useLocation();
  const navigate = useNavigate();
  const startsInExperience = location.pathname.startsWith("/explore") || location.pathname.startsWith("/experience") || Boolean(modeOverride);
  const [showLanding, setShowLanding] = useState(true);
  const [isLandingExiting, setIsLandingExiting] = useState(false);
  const [hasEntered, setHasEntered] = useState(startsInExperience);
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
      navigate("/explore/canvas");
    }, splashDelay);

    window.setTimeout(() => {
      setShowLanding(false);
    }, removeDelay);
  }

  function handlePlanGenerated(plan, input) {
    setResultTransitioning(true);

    window.setTimeout(() => {
      navigate("/generated-plan", {
        state: {
          plan,
          generationInput: input || null,
        },
      });
      setResultTransitioning(false);
    }, TRANSITION_MS);
  }

  return (
    <div className="app-transition-frame">
      {hasEntered ? (
        <MainExperience
          visible={!resultTransitioning}
          modeOverride={modeOverride}
          onPlanGenerated={handlePlanGenerated}
        />
      ) : (
        <div className="pre-entry-app-shell" aria-hidden="true" />
      )}
      {showLanding && !startsInExperience && (
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
        <Toaster
          position="top-center"
          toastOptions={{
            className: "app-toast",
          }}
        />
        <AppNavbar />
        <Routes>
          <Route path="/" element={<HomeExperience />} />
          <Route path="/explore" element={<Navigate to="/explore/canvas" replace />} />
          <Route path="/explore/:mode" element={<HomeExperience />} />
          <Route path="/experience" element={<Navigate to="/explore/canvas" replace />} />
          <Route path="/experience/mood" element={<Navigate to="/explore/canvas" replace />} />
          <Route path="/experience/canvas" element={<Navigate to="/explore/canvas" replace />} />
          <Route path="/experience/map" element={<Navigate to="/explore/map" replace />} />
          <Route path="/experience/cluster" element={<Navigate to="/clusters" replace />} />
          <Route path="/experience/:mode" element={<HomeExperience />} />
          <Route path="/clusters" element={<HomeExperience modeOverride="cluster" />} />
          <Route path="/generated-plan" element={<GeneratedPlanRoute />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/saved-plans"
            element={(
              <ProtectedRoute>
                <Shelf />
              </ProtectedRoute>
            )}
          />
          <Route path="/shelf" element={<Navigate to="/saved-plans" replace />} />
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
          <Route
            path="/admin"
            element={(
              <AdminRoute>
                <Admin />
              </AdminRoute>
            )}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
