import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { deletePlan, getCachedPlans, getPlan, getPlans } from "@/api/plans";
import BeachPlanTicket from "@/components/BeachPlanTicket";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import NotesEditor from "@/components/NotesEditor";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function getPlanId(plan) {
  return plan?._id || plan?.id;
}

function formatDate(value) {
  if (!value) return "unknown";
  return new Date(value).toLocaleDateString();
}

function formatField(value) {
  if (!value) return "n/a";
  return String(value).replaceAll("_", " ");
}

function listItems(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (!value) return [];
  return [String(value)];
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
        <p>SAVED</p>
        <h1>saved generated plans</h1>
        <span>Postcards you chose to keep, with notes and a stable detail page.</span>
      </div>

      {!token && (
        <div className="saved-empty-state">
          <p>LOG IN TO SEE SAVED PLANS //</p>
          <span>Generated plans are only stored when you choose save.</span>
          <Link to="/login">LOG IN</Link>
        </div>
      )}

      {token && loading && <p className="saved-muted">checking saved plans...</p>}
      {error && <p className="saved-error">{error}</p>}

      {token && !loading && plans.length === 0 && (
        <div className="saved-empty-state">
          <p>NO SAVED PLANS YET //</p>
          <span>Generate a plan, then save it when it feels worth keeping.</span>
        </div>
      )}

      <div className={`saved-mode-layout ${selectedPlan ? "has-detail" : ""}`}>
        <div className="saved-postcard-grid">
          {plans.map((plan) => {
            const id = getPlanId(plan);
            if (!id) return null;
            const selected = selectedPlan ? getPlanId(selectedPlan) === id : false;
            return (
              <article className={`saved-postcard-row ${selected ? "is-selected" : ""}`} key={id}>
                <img
                  className="saved-postcard-row__image"
                  src={plan.image_url || "/landing-scroll.jpg"}
                  alt={plan.selected_beach_name || "Saved beach plan"}
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.src = "/landing-scroll.jpg";
                  }}
                />
                <button type="button" className="saved-postcard-row__main" onClick={() => handleOpen(id)}>
                  <span>{formatDate(plan.created_at)}</span>
                  <h2>{plan.selected_beach_name || "Beach plan"}</h2>
                  <p>{plan.mood_phrase || "mood not logged"}</p>
                  <dl className="saved-postcard-meta">
                    <div>
                      <dt>REGION</dt>
                      <dd>{formatField(plan.region)}</dd>
                    </div>
                    <div>
                      <dt>ACTIVITY</dt>
                      <dd>{formatField(plan.activity)}</dd>
                    </div>
                    <div>
                      <dt>COMPANION</dt>
                      <dd>{formatField(plan.companion)}</dd>
                    </div>
                  </dl>
                </button>
                <div>
                  <button type="button" onClick={() => handleOpen(id)}>PREVIEW</button>
                  <Link to={`/plans/${id}`}>DETAILS</Link>
                  <ConfirmDeleteDialog
                    title="Delete this saved plan?"
                    description="This removes the saved postcard and its notes. You can generate another plan later."
                    confirmLabel="DELETE PLAN"
                    onConfirm={() => handleDelete(id)}
                  >
                    <button type="button" className="danger-text-button">DELETE</button>
                  </ConfirmDeleteDialog>
                </div>
              </article>
            );
          })}
        </div>

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

            {selectedPlan && (
              <>
                <BeachPlanTicket plan={selectedPlan} />

                <section className="saved-plan-detail__meta">
                  <div>
                    <span>REGION //</span>
                    <p>{formatField(selectedPlan.region)}</p>
                  </div>
                  <div>
                    <span>ACTIVITY //</span>
                    <p>{formatField(selectedPlan.activity)}</p>
                  </div>
                  <div>
                    <span>COMPANION //</span>
                    <p>{formatField(selectedPlan.companion)}</p>
                  </div>
                  <div>
                    <span>MOOD //</span>
                    <p>{selectedPlan.mood_phrase || "n/a"}</p>
                  </div>
                </section>

                <section className="saved-plan-detail__summary">
                  <p>PLAN //</p>
                  {selectedPlan.plan?.where && <strong>{selectedPlan.plan.where}</strong>}
                  {selectedPlan.plan?.when && (
                    <div>
                      <span>WHEN</span>
                      <p>{selectedPlan.plan.when}</p>
                    </div>
                  )}
                  {selectedPlan.plan?.why && (
                    <div>
                      <span>WHY</span>
                      <p>{selectedPlan.plan.why}</p>
                    </div>
                  )}
                  {selectedPlan.plan?.conditions_summary && (
                    <div>
                      <span>CONDITIONS</span>
                      <p>{selectedPlan.plan.conditions_summary}</p>
                    </div>
                  )}
                  {listItems(selectedPlan.plan?.bring).length > 0 && (
                    <div>
                      <span>BRING</span>
                      <p>{listItems(selectedPlan.plan?.bring).join(" / ")}</p>
                    </div>
                  )}
                  <Link to={`/plans/${getPlanId(selectedPlan)}`}>OPEN FULL DETAIL</Link>
                </section>

                <section className="saved-plan-detail__notes">
                  <p>NOTES //</p>
                  <NotesEditor
                    planId={getPlanId(selectedPlan)}
                    initialNotes={selectedPlan.user_notes || ""}
                    onSaved={(updatedPlan) => {
                      setSelectedPlan(updatedPlan);
                      setPlans((currentPlans) => currentPlans.map((plan) => (
                        getPlanId(plan) === getPlanId(updatedPlan) ? updatedPlan : plan
                      )));
                    }}
                  />
                </section>

                {status && <p className="saved-success">{status}</p>}

                <div className="saved-plan-detail__actions">
                  <ConfirmDeleteDialog
                    title="Delete this saved plan?"
                    description="This removes the saved postcard and its notes. You can generate another plan later."
                    confirmLabel="DELETE PLAN"
                    onConfirm={() => handleDelete(getPlanId(selectedPlan))}
                  >
                    <Button type="button" variant="outline" className="danger-button">
                      DELETE PLAN
                    </Button>
                  </ConfirmDeleteDialog>
                </div>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}
