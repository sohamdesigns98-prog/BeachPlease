import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { CLUSTERS_CHANGED_EVENT, getClusters } from "@/api/clusters";
import { getCachedPlans, getPlans } from "@/api/plans";
import AudioToggle from "@/components/audio/AudioToggle";
import HowToUseOverlay from "@/components/help/HowToUseOverlay";
import AccountPill from "@/components/AccountPill";
import { useAuth } from "@/context/AuthContext";

export default function AppNavbar() {
  const { token, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [savedCount, setSavedCount] = useState(0);
  const [clusterCount, setClusterCount] = useState(0);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const isExploreActive = useMemo(
    () => location.pathname.startsWith("/explore") || location.pathname.startsWith("/experience"),
    [location.pathname],
  );
  const hasContrastNav = location.pathname.startsWith("/generated-plan") || location.pathname.startsWith("/plans/") || location.pathname.startsWith("/saved-plans");

  useEffect(() => {
    let cancelled = false;

    async function loadCounts() {
      if (!token) {
        setSavedCount(0);
        setClusterCount(0);
        return;
      }

      try {
        const cachedPlans = getCachedPlans();
        if (Array.isArray(cachedPlans)) {
          setSavedCount(cachedPlans.length);
        }

        const [plans, clusters] = await Promise.allSettled([getPlans(), getClusters()]);
        if (cancelled) return;

        setSavedCount(plans.status === "fulfilled" && Array.isArray(plans.value) ? plans.value.length : 0);
        if (clusters.status === "fulfilled" && Array.isArray(clusters.value)) {
          setClusterCount(clusters.value.length);
        } else {
          setClusterCount(0);
        }
      } catch {
        if (!cancelled) {
          setSavedCount(0);
          setClusterCount(0);
        }
      }
    }

    loadCounts();
    window.addEventListener(CLUSTERS_CHANGED_EVENT, loadCounts);

    return () => {
      cancelled = true;
      window.removeEventListener(CLUSTERS_CHANGED_EVENT, loadCounts);
    };
  }, [token]);

  return (
    <header className={`app-navbar ${hasContrastNav ? "app-navbar--contrast" : ""}`.trim()}>
      <div className="app-navbar__left">
        <button type="button" className="app-navbar__mark" onClick={() => navigate("/explore/canvas")} aria-label="Go to explore">
          BeachPlease
        </button>
        <div className="app-navbar__control-pair">
          <AudioToggle />
          <button
            type="button"
            className="audio-toggle help-toggle"
            aria-label="How to use BeachPlease"
            title="How to use BeachPlease"
            onClick={() => setIsHelpOpen(true)}
          >
            ?
          </button>
        </div>
      </div>
      <div className="app-navbar__right">
        <nav className="app-navbar__page-links" aria-label="Saved beach pages">
          <Link className={isExploreActive ? "is-active" : ""} to="/explore/canvas">
            Explore
          </Link>
          <Link className={location.pathname.startsWith("/clusters") ? "is-active" : ""} to="/clusters">
            Cluster
            {clusterCount > 0 && <span>{clusterCount}</span>}
          </Link>
          <Link className={location.pathname.startsWith("/saved-plans") || location.pathname.startsWith("/plans/") ? "is-active" : ""} to="/saved-plans">
            Saved
            {savedCount > 0 && <span>{savedCount}</span>}
          </Link>
          {user?.role === "admin" && (
            <Link className={location.pathname.startsWith("/admin") ? "is-active" : ""} to="/admin">
              Admin
            </Link>
          )}
        </nav>
        <AccountPill />
      </div>
      <AnimatePresence>
        {isHelpOpen && <HowToUseOverlay onClose={() => setIsHelpOpen(false)} />}
      </AnimatePresence>
    </header>
  );
}
