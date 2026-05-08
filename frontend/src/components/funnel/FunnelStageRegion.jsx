import { Button } from "@/components/ui/button";

const REGION_OPTIONS = ["northern", "manly", "harbour", "eastern", "south", "cronulla"];

export default function FunnelStageRegion({ value, onSelect }) {
  return (
    <section className="funnel-stage" aria-label="Choose coastal region">
      <p className="funnel-kicker">STAGE 0</p>
      <h2>PICK YOUR PATCH</h2>
      <div className="funnel-option-grid">
        {REGION_OPTIONS.map((region) => (
          <Button
            key={region}
            type="button"
            variant="outline"
            className={`funnel-option ${value === region ? "is-selected" : ""}`}
            onClick={() => onSelect(region)}
          >
            {region}
          </Button>
        ))}
      </div>
    </section>
  );
}
