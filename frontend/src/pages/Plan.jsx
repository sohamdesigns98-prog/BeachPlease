import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { getPlan } from "@/api/plans";
import GeneratedPlanJournal from "@/components/GeneratedPlanJournal";

export default function Plan() {
  const { id } = useParams();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadPlan() {
      setLoading(true);
      setError("");
      try {
        setPlan(await getPlan(id));
      } catch (caughtError) {
        setError(caughtError?.response?.data?.detail || "Couldn't load that plan.");
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, [id]);

  return (
    <main className="plan-detail-page">
      {loading && <p className="auth-muted">loading plan...</p>}
      {error && <p className="auth-error">{error}</p>}
      {plan && <GeneratedPlanJournal plan={plan} />}
    </main>
  );
}
