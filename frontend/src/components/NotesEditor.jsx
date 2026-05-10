import { useEffect, useRef, useState } from "react";

import { updatePlanNotes } from "@/api/plans";
import { Textarea } from "@/components/ui/textarea";

const SAVE_DELAY_MS = 1000;

export default function NotesEditor({
  planId,
  initialNotes = "",
  onSaved,
}) {
  const [notes, setNotes] = useState(initialNotes || "");
  const [status, setStatus] = useState("idle");
  const hasMountedRef = useRef(false);
  const lastSavedNotesRef = useRef(initialNotes || "");
  const onSavedRef = useRef(onSaved);
  const timerRef = useRef(null);

  useEffect(() => {
    onSavedRef.current = onSaved;
  }, [onSaved]);

  useEffect(() => {
    const nextNotes = initialNotes || "";
    setNotes(nextNotes);
    lastSavedNotesRef.current = nextNotes;
    setStatus("idle");
    hasMountedRef.current = false;
  }, [initialNotes, planId]);

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      return undefined;
    }

    if (notes === lastSavedNotesRef.current) {
      setStatus("idle");
      return undefined;
    }

    window.clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(async () => {
      setStatus("saving");

      try {
        const updatedPlan = await updatePlanNotes(planId, notes);
        lastSavedNotesRef.current = updatedPlan.user_notes || "";
        setStatus("saved");
        onSavedRef.current?.(updatedPlan);
      } catch {
        setStatus("error");
      }
    }, SAVE_DELAY_MS);

    return () => {
      window.clearTimeout(timerRef.current);
    };
  }, [notes, planId]);

  return (
    <div className="notes-editor">
      <Textarea
        value={notes}
        placeholder="Good spot near the rocks. Better after 5pm."
        onChange={(event) => setNotes(event.target.value)}
      />
      <p className={`notes-editor-status is-${status}`} aria-live="polite">
        {status === "saving" && "SAVING..."}
        {status === "saved" && "SAVED ✓"}
        {status === "error" && "COULDN’T SAVE"}
      </p>
    </div>
  );
}
