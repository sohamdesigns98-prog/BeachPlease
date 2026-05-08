import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { deletePlan, getPlans, replayPlan } from "@/api/plans";
import { Button } from "@/components/ui/button";

function getPlanId(plan) {
  return plan._id || plan.id;
}

function formatDate(value) {
  if (!value) return "unknown date";
  return new Date(value).toLocaleString();
}

function formatField(value) {
  if (!value) return "n/a";
  return String(value).replaceAll("_", " ");
}

export default function Shelf() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadPlans() {
    setLoading(true);
    setError("");
    try {
      setPlans(await getPlans());
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn’t load saved plans.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadPlans();
  }, []);

  async function handleReplay(id) {
    setError("");
    try {
      const updatedPlan = await replayPlan(id);
      setPlans((currentPlans) => currentPlans.map((plan) => (
        getPlanId(plan) === id ? updatedPlan : plan
      )));
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn’t replay that plan.");
    }
  }

  async function handleDelete(id) {
    setError("");
    try {
      await deletePlan(id);
      setPlans((currentPlans) => currentPlans.filter((plan) => getPlanId(plan) !== id));
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn’t delete that plan.");
    }
  }

  return (
    <main className="auth-page shelf-page">
      <section className="auth-panel shelf-panel">
        <div className="auth-heading">
          <p>SHELF</p>
          <h1>Saved beach plans</h1>
          <span>Little logbook of coastal decisions, good and questionable.</span>
        </div>

        {loading && <p className="auth-muted">loading the shelf…</p>}
        {error && <p className="auth-error">{error}</p>}

        {!loading && plans.length === 0 && (
          <div className="plan-empty-state">
            <p>NO PLANS YET //</p>
            <span>Go on. Tell the coast what you&apos;re after.</span>
          </div>
        )}

        <div className="plan-log-list">
          {plans.map((plan) => {
            const id = getPlanId(plan);
            return (
              <article className="plan-log-row" key={id}>
                <div>
                  <p>{plan.mood_phrase || "mood not logged"}</p>
                  <h2>{plan.selected_beach_name || plan.beach_name || "Beach plan"}</h2>
                  <dl className="plan-log-meta">
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
                    <div>
                      <dt>CREATED</dt>
                      <dd>{formatDate(plan.created_at)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="plan-log-actions">
                  <Link to={`/plans/${id}`}>OPEN</Link>
                  <button type="button" onClick={() => handleReplay(id)}>REPLAY</button>
                  <button type="button" onClick={() => handleDelete(id)}>DELETE</button>
                </div>
              </article>
            );
          })}
        </div>

        <Button asChild className="auth-submit">
          <Link to="/">MAKE ANOTHER PLAN</Link>
        </Button>
      </section>
    </main>
  );
}
