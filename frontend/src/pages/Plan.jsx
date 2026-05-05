import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { deletePlan, getPlan, replayPlan, updatePlanNotes } from "@/api/plans";
import BeachPlanTicket from "@/components/BeachPlanTicket";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

function getPlanId(plan) {
  return plan?._id || plan?.id;
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
        setError(caughtError?.response?.data?.detail || "Couldn’t load that plan.");
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
      setStatus("notes saved. tidy.");
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn’t save notes.");
    }
  }

  async function handleReplay() {
    setStatus("");
    setError("");
    try {
      const updatedPlan = await replayPlan(getPlanId(plan));
      setPlan(updatedPlan);
      setNotes(updatedPlan.user_notes || "");
      setStatus("same mood, fresh coast.");
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn’t replay that plan.");
    }
  }

  async function handleDelete() {
    setStatus("");
    setError("");
    try {
      await deletePlan(getPlanId(plan));
      navigate("/shelf", { replace: true });
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn’t delete that plan.");
    }
  }

  return (
    <main className="plan-detail-page">
      <div className="plan-detail-top">
        <Link to="/shelf">← shelf</Link>
        <h1>Saved plan</h1>
      </div>

      {loading && <p className="auth-muted">loading the ticket…</p>}
      {error && <p className="auth-error">{error}</p>}

      {plan && (
        <div className="plan-detail-grid">
          <BeachPlanTicket plan={plan} />

          <aside className="plan-notes-panel">
            <div className="auth-heading">
              <p>NOTES</p>
              <h2>User notes</h2>
              <span>Future you loves context. Occasionally.</span>
            </div>
            <Textarea
              value={notes}
              placeholder="Good spot near the rocks. Better after 5pm."
              onChange={(event) => setNotes(event.target.value)}
            />
            {status && <p className="auth-success">{status}</p>}
            <div className="profile-actions">
              <Button type="button" onClick={handleSaveNotes}>SAVE NOTES</Button>
              <Button type="button" variant="outline" onClick={handleReplay}>REPLAY</Button>
              <Button type="button" variant="outline" className="danger-button" onClick={handleDelete}>
                DELETE
              </Button>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
