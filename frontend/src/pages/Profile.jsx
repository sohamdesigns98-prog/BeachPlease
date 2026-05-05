import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

const COMPANION_OPTIONS = ["solo", "partner", "friends", "family", "dog"];
const TRAVEL_OPTIONS = ["walk", "public_transport", "drive"];

export default function Profile() {
  const { user, logout, updateProfile, deleteAccount } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    suburb: "",
    companions: "solo",
    travel_mode: "public_transport",
  });
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      suburb: user.suburb || "",
      companions: user.companions || "solo",
      travel_mode: user.travel_mode || "public_transport",
    });
  }, [user]);

  async function handleSave(event) {
    event.preventDefault();
    setStatus("");
    setError("");
    setSubmitting(true);

    try {
      await updateProfile(form);
      setStatus("Profile saved. Future beach picks just got less guessy.");
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn’t save profile.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm("Delete your account and saved plans? This cannot be undone.");
    if (!confirmed) return;

    try {
      await deleteAccount();
      navigate("/", { replace: true });
    } catch (caughtError) {
      setError(caughtError?.response?.data?.detail || "Couldn’t delete account.");
    }
  }

  return (
    <main className="auth-page">
      <form className="auth-panel profile-panel" onSubmit={handleSave}>
        <div className="auth-heading">
          <p>PROFILE</p>
          <h1>Your beach settings</h1>
          <span>Small details. Better recommendations.</span>
        </div>

        <label>
          Email
          <Input value={user?.email || ""} readOnly />
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

        {status && <p className="auth-success">{status}</p>}
        {error && <p className="auth-error">{error}</p>}

        <div className="profile-actions">
          <Button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? "saving…" : "SAVE PROFILE"}
          </Button>
          <Button type="button" variant="outline" onClick={logout}>
            LOG OUT
          </Button>
          <Button type="button" variant="outline" className="danger-button" onClick={handleDelete}>
            DELETE ACCOUNT
          </Button>
        </div>
      </form>
    </main>
  );
}
