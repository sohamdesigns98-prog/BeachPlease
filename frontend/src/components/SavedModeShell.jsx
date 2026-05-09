import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { deletePlan, getPlan, getPlans, replayPlan } from "@/api/plans";
import BeachPlanTicket from "@/components/BeachPlanTicket";
import NotesEditor from "@/components/NotesEditor";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

function getPlanId(plan) {
  return plan._id || plan.id;
}

function formatDate(value) {
  if (!value) return "unknown";
  return new Date(value).toLocaleDateString();
}

function formatField(value) {
  if (!value) return "n/a";
  return String(value).replaceAll("_", " ");
}

export default function SavedModeShell({ onCountChange }) {
  const { token } = useAuth();
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));
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

  async function handleOpen(id) {
    setDetailLoading(true);
    setStatus("");
    setError("");
    try {
      setSelectedPlan(await getPlan(id));
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn’t open that postcard.");
    } finally {
      setDetailLoading(false);
    }
  }

  async function handleReplay(id) {
    setStatus("");
    setError("");
    try {
      const updatedPlan = await replayPlan(id);
      setPlans((currentPlans) => currentPlans.map((plan) => (
        getPlanId(plan) === id ? updatedPlan : plan
      )));
      setSelectedPlan((currentPlan) => (
        getPlanId(currentPlan) === id ? updatedPlan : currentPlan
      ));
      setStatus("same mood, fresh coast.");
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn’t replay that one.");
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
      setStatus("gone. probably for the best.");
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

      <div className={`saved-mode-layout ${selectedPlan ? "has-detail" : ""}`}>
        <div className="saved-postcard-grid">
          {plans.map((plan) => {
            const id = getPlanId(plan);
            const selected = getPlanId(selectedPlan) === id;
            return (
              <article className={`saved-postcard-row ${selected ? "is-selected" : ""}`} key={id}>
                <button type="button" className="saved-postcard-row__main" onClick={() => handleOpen(id)}>
                  <span>{formatDate(plan.created_at)}</span>
                  <h2>{plan.selected_beach_name || "Beach postcard"}</h2>
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
                  <button type="button" onClick={() => handleOpen(id)}>OPEN</button>
                  <button type="button" onClick={() => handleReplay(id)}>REPLAY</button>
                  <button type="button" onClick={() => handleDelete(id)}>DELETE</button>
                </div>
              </article>
            );
          })}
        </div>

        {(selectedPlan || detailLoading) && (
          <aside className="saved-plan-detail" aria-label="Saved postcard detail">
            <button
              type="button"
              className="saved-plan-detail__close"
              onClick={() => setSelectedPlan(null)}
              aria-label="Close saved postcard"
            >
              ×
            </button>

            {detailLoading && <p className="saved-muted">opening postcard…</p>}

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
                  <Button type="button" onClick={() => handleReplay(getPlanId(selectedPlan))}>
                    SAME MOOD · FRESH COAST
                  </Button>
                  <Button type="button" variant="outline" onClick={() => handleDelete(getPlanId(selectedPlan))}>
                    BIN IT
                  </Button>
                </div>
              </>
            )}
          </aside>
        )}
      </div>
    </section>
  );
}
