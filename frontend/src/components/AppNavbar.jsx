import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { getClusters } from "@/api/clusters";
import { getCachedPlans, getPlans } from "@/api/plans";
import AudioToggle from "@/components/audio/AudioToggle";
import AccountPill from "@/components/AccountPill";
import ModeToggle from "@/components/ModeToggle";
import { useAuth } from "@/context/AuthContext";

export default function AppNavbar() {
  const { token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [savedCount, setSavedCount] = useState(0);
  const [clusterCount, setClusterCount] = useState(0);

  const activeMode = useMemo(() => {
    if (location.pathname.startsWith("/saved-plans")) return "saved";
    if (location.pathname.includes("/experience/cluster")) return "cluster";
    if (location.pathname.includes("/experience/map")) return "map";
    if (location.pathname.includes("/experience/mood") || location.pathname === "/experience") return "mood";
    return "";
  }, [location.pathname]);

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

  function handleModeChange(nextMode) {
    if (nextMode === "saved") {
      navigate("/saved-plans");
      return;
    }

    navigate(`/experience/${nextMode}`);
  }

  return (
    <header className="app-navbar">
      <div className="app-navbar__left">
        <button type="button" className="app-navbar__mark" onClick={() => navigate("/experience/mood")} aria-label="Go to mood">
          BeachPlease
        </button>
        <AudioToggle />
      </div>
      <div className="app-navbar__right">
        <ModeToggle
          activeMode={activeMode}
          savedCount={savedCount}
          clusterCount={clusterCount}
          onChange={handleModeChange}
        />
        <AccountPill />
      </div>
    </header>
  );
}
