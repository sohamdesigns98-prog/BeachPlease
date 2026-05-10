import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

function loadGoogleScript() {
  const existing = document.getElementById(GOOGLE_SCRIPT_ID);
  if (existing) {
    return new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) resolve();
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Google script failed to load")), { once: true });
    });
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script failed to load"));
    document.head.appendChild(script);
  });
}

export default function GoogleOAuthButton({ onCredential, disabled = false }) {
  const containerRef = useRef(null);
  const onCredentialRef = useRef(onCredential);
  const [ready, setReady] = useState(false);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    let cancelled = false;

    async function setupGoogleButton() {
      if (!clientId || !containerRef.current) return;

      try {
        await loadGoogleScript();
        if (cancelled || !window.google?.accounts?.id || !containerRef.current) return;

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: (response) => {
            if (response?.credential) onCredentialRef.current?.(response.credential);
          },
        });

        containerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(containerRef.current, {
          theme: "outline",
          size: "large",
          shape: "pill",
          text: "continue_with",
          width: Math.min(392, containerRef.current.offsetWidth || 392),
        });
        setReady(true);
      } catch {
        if (!cancelled) toast.error("Couldn't load Google sign-in.");
      }
    }

    setupGoogleButton();

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (!clientId) {
    return (
      <button
        type="button"
        className="oauth-button"
        disabled={disabled}
        onClick={() => toast.message("Add VITE_GOOGLE_CLIENT_ID in frontend/.env and GOOGLE_CLIENT_ID in backend/.env.")}
      >
        Continue with Google
      </button>
    );
  }

  return (
    <div className={`google-oauth-slot ${ready ? "is-ready" : ""} ${disabled ? "is-disabled" : ""}`}>
      <div ref={containerRef} />
      {!ready && <span>loading google...</span>}
    </div>
  );
}
