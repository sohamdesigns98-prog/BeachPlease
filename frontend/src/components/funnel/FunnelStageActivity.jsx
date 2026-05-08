import { Button } from "@/components/ui/button";

const ACTIVITY_OPTIONS = ["swim", "surf", "relax", "snorkel", "walk"];

export default function FunnelStageActivity({ value, onSelect }) {
  return (
    <section className="funnel-stage" aria-label="Choose activity">
      <p className="funnel-kicker">STAGE 1</p>
      <h2>WHAT ARE WE DOING?</h2>
      <div className="funnel-option-grid">
        {ACTIVITY_OPTIONS.map((activity) => (
          <Button
            key={activity}
            type="button"
            variant="outline"
            className={`funnel-option ${value === activity ? "is-selected" : ""}`}
            onClick={() => onSelect(activity)}
          >
            {activity}
          </Button>
        ))}
      </div>
    </section>
  );
}
