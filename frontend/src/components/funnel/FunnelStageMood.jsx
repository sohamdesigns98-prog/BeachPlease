import { useState } from "react";

import { Button } from "@/components/ui/button";

const MOOD_PLACEHOLDERS = [
  "I feel like some alone time",
  "big arvo energy, but not Bondi chaos",
  "proper swim, no nonsense",
];

export default function FunnelStageMood({ value, onChange, onGenerate }) {
  const [placeholderIndex] = useState(() => Math.floor(Math.random() * MOOD_PLACEHOLDERS.length));

  return (
    <section className="funnel-stage" aria-label="Optional mood note">
      <p className="funnel-kicker">STAGE 3</p>
      <h2>ANYTHING ELSE THE COAST SHOULD KNOW?</h2>
      <form
        className="funnel-mood-form"
        onSubmit={(event) => {
          event.preventDefault();
          onGenerate();
        }}
      >
        <input
          value={value}
          placeholder={MOOD_PLACEHOLDERS[placeholderIndex]}
          onChange={(event) => onChange(event.target.value)}
        />
        <Button type="submit" className="funnel-generate-button">
          SORT MY BEACH →
        </Button>
      </form>
    </section>
  );
}
