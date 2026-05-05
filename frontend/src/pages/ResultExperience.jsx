import { Link } from "react-router-dom";

import BeachPlanTicket from "@/components/BeachPlanTicket";
import { useAuth } from "@/context/AuthContext";

export default function ResultExperience({ plan, visible = false }) {
  const { token } = useAuth();
  const showAuthNudge = !token || plan?.requiresAuthToSave;

  return (
    <main className={`result-experience ${visible ? "is-visible" : ""}`} aria-label="BeachPlease result">
      <BeachPlanTicket plan={plan} />
      {showAuthNudge && (
        <aside className="result-auth-nudge">
          <p>Like this one? Log in or sign up to save the plan properly.</p>
          <div>
            <Link to="/login">LOG IN</Link>
            <Link to="/register">SIGN UP</Link>
          </div>
        </aside>
      )}
    </main>
  );
}
