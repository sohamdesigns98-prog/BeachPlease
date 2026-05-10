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
