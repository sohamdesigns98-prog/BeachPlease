import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { deletePlan, getPlans, replayPlan } from "@/api/plans";
import { useAuth } from "@/context/AuthContext";

function getPlanId(plan) {
  return plan._id || plan.id;
}

function formatDate(value) {
  if (!value) return "unknown";
  return new Date(value).toLocaleDateString();
}

export default function SavedModeShell({ onCountChange }) {
  const { token } = useAuth();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(Boolean(token));
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      if (!token) {
        setPlans([]);
        setLoading(false);
        onCountChange?.(0);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const nextPlans = await getPlans();
        if (cancelled) return;
        setPlans(nextPlans);
        onCountChange?.(nextPlans.length);
      } catch (caughtError) {
        if (cancelled) return;
        setError(caughtError?.response?.data?.detail || "Couldn’t load saved postcards.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, [onCountChange, token]);

  async function handleReplay(id) {
    setError("");
    try {
      const updatedPlan = await replayPlan(id);
      setPlans((currentPlans) => currentPlans.map((plan) => (
        getPlanId(plan) === id ? updatedPlan : plan
      )));
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn’t replay that one.");
    }
  }

  async function handleDelete(id) {
    setError("");
    try {
      await deletePlan(id);
      setPlans((currentPlans) => {
        const nextPlans = currentPlans.filter((plan) => getPlanId(plan) !== id);
        onCountChange?.(nextPlans.length);
        return nextPlans;
      });
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn’t delete that one.");
    }
  }

  return (
    <section className="saved-mode-shell" aria-label="Saved postcards">
      <div className="saved-mode-shell__heading">
        <p>SAVED</p>
        <h1>postcards you kept</h1>
        <span>Same coast, less memory work.</span>
      </div>

      {!token && (
        <div className="saved-empty-state">
          <p>LOG IN TO SEE SAVED POSTCARDS //</p>
          <span>Generated beaches can still appear first. Saving comes after.</span>
          <Link to="/login">LOG IN</Link>
        </div>
      )}

      {token && loading && <p className="saved-muted">checking the shelf…</p>}
      {error && <p className="saved-error">{error}</p>}

      {token && !loading && plans.length === 0 && (
        <div className="saved-empty-state">
          <p>NO POSTCARDS YET //</p>
          <span>Go on. Tell the coast what you’re after.</span>
        </div>
      )}

      <div className="saved-postcard-grid">
        {plans.map((plan) => {
          const id = getPlanId(plan);
          return (
            <article className="saved-postcard-row" key={id}>
              <div>
                <span>{formatDate(plan.created_at)}</span>
                <h2>{plan.selected_beach_name || "Beach postcard"}</h2>
                <p>{plan.mood_phrase || "mood not logged"}</p>
              </div>
              <div>
                <Link to={`/plans/${id}`}>OPEN</Link>
                <button type="button" onClick={() => handleReplay(id)}>REPLAY</button>
                <button type="button" onClick={() => handleDelete(id)}>DELETE</button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
