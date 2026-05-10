import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { deletePlan, getPlan, updatePlanNotes } from "@/api/plans";
import BeachPlanTicket from "@/components/BeachPlanTicket";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import NotesEditor from "@/components/NotesEditor";
import { Button } from "@/components/ui/button";

function getPlanId(plan) {
  return plan?._id || plan?.id;
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
            <section className="plan-metadata" aria-label="Plan metadata">
              <div>
                <span>REGION //</span>
                <p>{formatField(plan.region)}</p>
              </div>
              <div>
                <span>ACTIVITY //</span>
                <p>{formatField(plan.activity)}</p>
              </div>
              <div>
                <span>COMPANION //</span>
                <p>{formatField(plan.companion)}</p>
              </div>
              <div>
                <span>MOOD //</span>
                <p>{plan.mood_phrase || "n/a"}</p>
              </div>
            </section>

            <section className="plan-full-section">
              <p>FULL PLAN //</p>
              <h2>{plan.plan?.where || plan.selected_beach_name}</h2>
              {plan.plan?.when && (
                <div>
                  <span>WHEN</span>
                  <p>{plan.plan.when}</p>
                </div>
              )}
              {plan.plan?.why && (
                <div>
                  <span>WHY</span>
                  <p>{plan.plan.why}</p>
                </div>
              )}
              {plan.plan?.conditions_summary && (
                <div>
                  <span>CONDITIONS</span>
                  <p>{plan.plan.conditions_summary}</p>
                </div>
              )}
              {plan.plan?.gentle_warning && (
                <div>
                  <span>HEADS UP</span>
                  <p>{plan.plan.gentle_warning}</p>
                </div>
              )}
              {listItems(plan.plan?.bring).length > 0 && (
                <div>
                  <span>BRING</span>
                  <ul>
                    {listItems(plan.plan?.bring).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </section>

            {Array.isArray(plan.candidate_snapshot) && plan.candidate_snapshot.length > 0 && (
              <section className="plan-full-section">
                <p>CANDIDATES //</p>
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
                <p>WHY NOT THE OTHERS //</p>
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
              <p>NOTES //</p>
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
              <Button type="button" onClick={handleSaveNotes}>SAVE NOTES</Button>
              <ConfirmDeleteDialog
                title="Delete this saved plan?"
                description="This removes the saved postcard and its notes. You can generate another plan later."
                confirmLabel="DELETE PLAN"
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
