import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { deletePlan, getCachedPlans, getPlan, getPlans } from "@/api/plans";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { useAuth } from "@/context/AuthContext";
import GeneratedPlanJournal from "@/components/GeneratedPlanJournal";

function getPlanId(plan) {
  return plan?._id || plan?.id;
}

export default function SavedModeShell({ onCountChange }) {
  const { token } = useAuth();
  const [plans, setPlans] = useState(() => getCachedPlans() || []);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(Boolean(token && !getCachedPlans()));
  const [detailLoading, setDetailLoading] = useState(false);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadPlans() {
      if (!token) {
        setPlans([]);
        setSelectedPlan(null);
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
        setSelectedPlan((currentPlan) => {
          if (!currentPlan) return null;
          const currentId = getPlanId(currentPlan);
          return nextPlans.find((plan) => getPlanId(plan) === currentId) || null;
        });
      } catch (caughtError) {
        if (!cancelled) setError(caughtError?.response?.data?.detail || "Couldn't load saved plans.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPlans();

    return () => {
      cancelled = true;
    };
  }, [onCountChange, token]);

  async function handleOpen(id) {
    setDetailLoading(true);
    setStatus("");
    setError("");
    try {
      setSelectedPlan(await getPlan(id));
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn't open that saved plan.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleDelete(id) {
    setStatus("");
    setError("");
    try {
      await deletePlan(id);
      setPlans((currentPlans) => {
        const nextPlans = currentPlans.filter((plan) => getPlanId(plan) !== id);
        onCountChange?.(nextPlans.length);
        return nextPlans;
      });
      setSelectedPlan((currentPlan) => (
        getPlanId(currentPlan) === id ? null : currentPlan
      ));
      setStatus("plan deleted.");
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn't delete that plan.");
    }
  }

  return (
    <section className="saved-mode-shell" aria-label="Saved plans">
      <div className="saved-mode-shell__heading">
        <p>Saved</p>
        <h1>Generated plans</h1>
        <span>Your saved beach days, ready to preview, revisit, or clear out.</span>
      </div>

      {!token && (
        <div className="saved-empty-state">
          <p>Log in to see saved plans //</p>
          <span>Generated plans are only stored when you choose save.</span>
          <Link to="/login">Log in</Link>
        </div>
      )}

      {token && loading && <p className="saved-muted">checking saved plans...</p>}
      {error && <p className="saved-error">{error}</p>}

      {token && !loading && plans.length === 0 && (
        <div className="saved-empty-state">
          <p>No saved plans yet //</p>
          <span>Generate a plan, then save it when it feels worth keeping.</span>
        </div>
      )}

      <div className={`saved-mode-layout ${selectedPlan ? "has-detail" : ""}`}>
        <div className="saved-plan-stage">
          {(selectedPlan || detailLoading) && (
            <aside className="saved-plan-detail" aria-label="Saved plan preview">
            <button
              type="button"
              className="saved-plan-detail__close"
              onClick={() => setSelectedPlan(null)}
              aria-label="Close saved plan"
            >
              x
            </button>

            {detailLoading && <p className="saved-muted">opening saved plan...</p>}
            {selectedPlan && <GeneratedPlanJournal plan={selectedPlan} className="generated-plan-journal--saved" />}
            </aside>
          )}
        </div>

        {token && !loading && plans.length > 0 && (
          <div className="saved-postcard-grid" aria-label="Saved plan dock">
            {plans.map((plan) => {
              const id = getPlanId(plan);
              if (!id) return null;
              const selected = selectedPlan ? getPlanId(selectedPlan) === id : false;
              return (
                <article className={`saved-postcard-row ${selected ? "is-selected" : ""}`} key={id}>
                  <button type="button" className="saved-postcard-row__main" onClick={() => handleOpen(id)}>
                    <img
                      className="saved-postcard-row__image"
                      src={plan.image_url || "/landing-scroll.jpg"}
                      alt={plan.selected_beach_name || "Saved beach plan"}
                      loading="lazy"
                      onError={(event) => {
                        event.currentTarget.src = "/landing-scroll.jpg";
                      }}
                    />
                    <h2>{plan.selected_beach_name || "Beach plan"}</h2>
                  </button>
                  <div className="saved-postcard-row__actions">
                    <Link to={`/plans/${id}`}>Details</Link>
                    <ConfirmDeleteDialog
                      title="Delete this saved plan?"
                      description="This removes the saved plan and its notes. You can generate another plan later."
                      confirmLabel="Delete plan"
                      onConfirm={() => handleDelete(id)}
                    >
                      <button type="button" className="danger-text-button">Delete</button>
                    </ConfirmDeleteDialog>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
