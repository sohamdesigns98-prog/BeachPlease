import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthSheet({
  isOpen = false,
  isSubmitting = false,
  error = "",
  onClose,
  onLogin,
  onRegister,
}) {
  const [mode, setMode] = useState("register");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  if (!isOpen) return null;

  function handleSubmit(event) {
    event.preventDefault();
    const payload = { email, password };

    if (mode === "login") {
      onLogin?.(payload);
      return;
    }

    onRegister?.(payload);
  }

  return (
    <section className="auth-sheet" aria-label="Save your plan">
      <button
        type="button"
        className="auth-sheet-close"
        aria-label="Close save sheet"
        onClick={onClose}
      >
        ×
      </button>

      <div className="auth-sheet-copy">
        <p>SAVE THIS ONE</p>
        <h2>{mode === "login" ? "log in + save" : "make an account, keep the beach"}</h2>
        <span>No ceremony. Email, password, done.</span>
      </div>

      <form className="auth-sheet-form" onSubmit={handleSubmit}>
        <Input
          type="email"
          value={email}
          placeholder="email"
          autoComplete="email"
          required
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          type="password"
          value={password}
          placeholder="password"
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          minLength={6}
          required
          onChange={(event) => setPassword(event.target.value)}
        />

        {error && <p className="auth-sheet-error">{error}</p>}

        <Button type="submit" className="auth-sheet-primary" disabled={isSubmitting}>
          {isSubmitting
            ? "saving..."
            : mode === "login"
              ? "LOG IN + SAVE →"
              : "CREATE ACCOUNT + SAVE →"}
        </Button>
      </form>

      <button
        type="button"
        className="auth-sheet-mode"
        onClick={() => setMode((current) => (current === "login" ? "register" : "login"))}
      >
        {mode === "login"
          ? "need an account? create one"
          : "already have an account? log in"}
      </button>
    </section>
  );
}
