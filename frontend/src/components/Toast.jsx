import { TOASTS } from "@/content/voice";

export default function Toast({ type = "error", message, isVisible = false }) {
  const toastMessage = message || TOASTS[type] || TOASTS.error;

  return (
    <div className={`voice-toast ${isVisible ? "is-visible" : ""}`} role="status" aria-live="polite">
      {toastMessage}
    </div>
  );
}
