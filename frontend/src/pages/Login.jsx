import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

function getErrorMessage(error) {
  return error?.response?.data?.detail || "Couldn’t log you in. Check the details and try again.";
}

export default function Login() {
  const { login, token } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const from = location.state?.from?.pathname || "/profile";

  if (token) return <Navigate to={from} replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(form);
      navigate(from, { replace: true });
    } catch (caughtError) {
      setError(getErrorMessage(caughtError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-panel" onSubmit={handleSubmit}>
        <div className="auth-heading">
          <p>BEACHPLEASE</p>
          <h1>Log in</h1>
          <span>Back for another squiz at the coast.</span>
        </div>

        <label>
          Email
          <Input
            type="email"
            autoComplete="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>

        <label>
          Password
          <Input
            type="password"
            autoComplete="current-password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>

        {error && <p className="auth-error">{error}</p>}

        <Button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? "checking…" : "LOG IN"}
        </Button>

        <p className="auth-muted">
          No account yet? <Link to="/register">Sign up</Link>
        </p>
      </form>
    </main>
  );
}
