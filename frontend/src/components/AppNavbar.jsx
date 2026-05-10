import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { getClusters } from "@/api/clusters";
import { getCachedPlans, getPlans } from "@/api/plans";
import AudioToggle from "@/components/audio/AudioToggle";
import AccountPill from "@/components/AccountPill";
import { useAuth } from "@/context/AuthContext";

export default function AppNavbar() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [savedCount, setSavedCount] = useState(0);
  const [clusterCount, setClusterCount] = useState(0);

  const isExploreActive = useMemo(
    () => location.pathname.startsWith("/explore") || location.pathname.startsWith("/experience"),
    [location.pathname],
  );

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
          const slugs = clusters.value.flatMap((cluster) => cluster.beach_slugs || []);
          setClusterCount(new Set(slugs.filter(Boolean)).size);
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

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <header className="app-navbar">
      <div className="app-navbar__left">
        <button type="button" className="app-navbar__mark" onClick={() => navigate("/explore/canvas")} aria-label="Go to explore">
          BeachPlease
        </button>
        <AudioToggle />
      </div>
      <div className="app-navbar__right">
        <nav className="app-navbar__page-links" aria-label="Saved beach pages">
          <Link className={isExploreActive ? "is-active" : ""} to="/explore/canvas">
            explore
          </Link>
          <Link className={location.pathname.startsWith("/clusters") ? "is-active" : ""} to="/clusters">
            cluster
            {clusterCount > 0 && <span>{clusterCount}</span>}
          </Link>
          <Link className={location.pathname.startsWith("/saved-plans") || location.pathname.startsWith("/plans/") ? "is-active" : ""} to="/saved-plans">
            saved
            {savedCount > 0 && <span>{savedCount}</span>}
          </Link>
        </nav>
        <AccountPill />
      </div>
    </header>
  );
}
