import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { deletePlan, getPlan, updatePlanNotes } from "@/api/plans";
import BeachPlanTicket from "@/components/BeachPlanTicket";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import NotesEditor from "@/components/NotesEditor";
import { Button } from "@/components/ui/button";
import { getPlanBody, listItems, planText } from "@/utils/planDisplay";

function getPlanId(plan) {
  return plan?._id || plan?.id;
}

function formatField(value) {
  if (!value) return "n/a";
  return String(value).replaceAll("_", " ");
}

function candidateScore(candidate) {
  if (candidate?.score === null || candidate?.score === undefined) return "";
  return `${Math.round(candidate.score)}%`;
}

export default function Plan() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlan() {
      setLoading(true);
      setError("");
      try {
        const loadedPlan = await getPlan(id);
        setPlan(loadedPlan);
        setNotes(loadedPlan.user_notes || "");
      } catch (caughtError) {
        setError(caughtError?.response?.data?.detail || "Couldn't load that plan.");
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, [id]);

  async function handleSaveNotes() {
    setStatus("");
    setError("");
    try {
      const updatedPlan = await updatePlanNotes(getPlanId(plan), notes);
      setPlan(updatedPlan);
      setNotes(updatedPlan.user_notes || "");
      setStatus("notes saved.");
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn't save notes.");
    }
  }

  async function handleDelete() {
    setStatus("");
    setError("");
    try {
      await deletePlan(getPlanId(plan));
      navigate("/saved-plans", { replace: true });
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn't delete that plan.");
    }
  }

  return (
    <main className="plan-detail-page">
      <div className="plan-detail-top">
        <Link to="/saved-plans">saved plans</Link>
        <h1>Saved plan</h1>
      </div>

      {loading && <p className="auth-muted">loading the ticket...</p>}
      {error && <p className="auth-error">{error}</p>}

      {plan && (
        <div className="plan-detail-grid">
          <BeachPlanTicket plan={plan} />

          <aside className="plan-notes-panel">
            {(() => {
              const planBody = getPlanBody(plan);
              const bringItems = listItems(planBody.bring);

              return (
                <>
            <section className="plan-metadata" aria-label="Plan metadata">
              <div>
                <span>Region //</span>
                <p>{formatField(plan.region)}</p>
              </div>
              <div>
                <span>Activity //</span>
                <p>{formatField(plan.activity)}</p>
              </div>
              <div>
                <span>Companion //</span>
                <p>{formatField(plan.companion)}</p>
              </div>
              <div>
                <span>Mood //</span>
                <p>{plan.mood_phrase || "n/a"}</p>
              </div>
            </section>

            <section className="plan-full-section">
              <p>Full plan //</p>
              <h2>{planText(planBody.where || plan.selected_beach_name, "No beach destination was included.")}</h2>
              <div>
                <span>When</span>
                <p>{planText(planBody.when, "No timing was included.")}</p>
              </div>
              <div>
                <span>Why</span>
                <p>{planText(planBody.why, "No reasoning was included.")}</p>
              </div>
              <div>
                <span>Conditions</span>
                <p>{planText(planBody.conditions_summary, "No condition summary was included.")}</p>
              </div>
              <div>
                <span>Heads up</span>
                <p>{planText(planBody.gentle_warning, "No warning was included.")}</p>
              </div>
              {bringItems.length > 0 && (
                <div>
                  <span>Bring</span>
                  <ul>
                    {bringItems.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
                </>
              );
            })()}

            {Array.isArray(plan.candidate_snapshot) && plan.candidate_snapshot.length > 0 && (
              <section className="plan-full-section">
                <p>Candidates //</p>
                <div className="plan-candidate-list">
                  {plan.candidate_snapshot.slice(0, 5).map((candidate) => (
                    <article key={candidate.slug || candidate.name}>
                      <strong>{candidate.name}</strong>
                      <span>{candidateScore(candidate)}</span>
                      <p>{listItems(candidate.matched_reasons).slice(0, 2).join(" · ") || "candidate beach"}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {Array.isArray(plan.rejected_beaches) && plan.rejected_beaches.length > 0 && (
              <section className="plan-full-section">
                <p>Why not the others //</p>
                <div className="plan-rejected-list">
                  {plan.rejected_beaches.map((item) => (
                    <article key={item.name}>
                      <strong>{item.name}</strong>
                      <p>{item.reason}</p>
                    </article>
                  ))}
                </div>
              </section>
            )}

            <div className="auth-heading">
              <p>Notes //</p>
              <h2>User notes</h2>
              <span>Autosaves after you stop typing.</span>
            </div>
            <NotesEditor
              planId={getPlanId(plan)}
              initialNotes={notes}
              onSaved={(updatedPlan) => {
                setPlan(updatedPlan);
                setNotes(updatedPlan.user_notes || "");
              }}
            />
            {status && <p className="auth-success">{status}</p>}
            <div className="profile-actions">
              <Button type="button" onClick={handleSaveNotes}>Save notes</Button>
              <ConfirmDeleteDialog
                title="Delete this saved plan?"
                description="This removes the saved postcard and its notes. You can generate another plan later."
                confirmLabel="Delete plan"
                onConfirm={handleDelete}
              >
                <Button type="button" variant="outline" className="danger-button">
                  DELETE PLAN
                </Button>
              </ConfirmDeleteDialog>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
