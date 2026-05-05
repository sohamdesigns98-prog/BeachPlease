import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

const COMPANION_OPTIONS = ["solo", "partner", "friends", "family", "dog"];
const TRAVEL_OPTIONS = ["walk", "public_transport", "drive"];

function getErrorMessage(error) {
  return error?.response?.data?.detail || "Couldn’t create the account. Give it another go.";
}

export default function Register() {
  const { register, token } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    email: "",
    password: "",
    suburb: "",
    companions: "solo",
    travel_mode: "public_transport",
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (token) return <Navigate to="/profile" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await register(form);
      navigate("/profile", { replace: true });
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
          <h1>Sign up</h1>
          <span>Tell us enough to stop recommending nonsense.</span>
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
            autoComplete="new-password"
            minLength={6}
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>

        <label>
          Suburb
          <Input
            value={form.suburb}
            onChange={(event) => setForm({ ...form, suburb: event.target.value })}
            required
          />
        </label>

        <label>
          Companions
          <select
            value={form.companions}
            onChange={(event) => setForm({ ...form, companions: event.target.value })}
          >
            {COMPANION_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        <label>
          Travel mode
          <select
            value={form.travel_mode}
            onChange={(event) => setForm({ ...form, travel_mode: event.target.value })}
          >
            {TRAVEL_OPTIONS.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </label>

        {error && <p className="auth-error">{error}</p>}

        <Button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? "saving…" : "SIGN UP"}
        </Button>

        <p className="auth-muted">
          Already sorted? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
