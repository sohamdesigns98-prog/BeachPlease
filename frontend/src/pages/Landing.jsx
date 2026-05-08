import { Button } from "@/components/ui/button";
import { BUTTON_COPY, LANDING_COPY } from "@/content/voice";

export default function Landing({ isLeaving = false, onEnter }) {
  return (
    <main className={`landing-screen ${isLeaving ? "is-leaving" : ""}`}>
      <section className="landing-copy" aria-label="BeachPlease introduction">
        {LANDING_COPY.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}

        <div className="landing-action">
          <Button
            type="button"
            disabled={isLeaving}
            onClick={onEnter}
          >
            {BUTTON_COPY.enterExperience}
          </Button>
        </div>
      </section>
    </main>
  );
}
