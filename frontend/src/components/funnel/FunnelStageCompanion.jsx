import { Button } from "@/components/ui/button";

import CandidateBeachList from "@/components/funnel/CandidateBeachList";

const COMPANION_OPTIONS = ["solo", "partner", "family", "dog", "mates"];

export default function FunnelStageCompanion({
  value,
  candidates,
  preferredBeachSlug,
  onSelect,
  onSelectBeach,
}) {
  return (
    <section className="funnel-stage" aria-label="Choose companion">
      <p className="funnel-kicker">STAGE 2</p>
      <h2>WHO&apos;S GETTING DRAGGED ALONG?</h2>
      <CandidateBeachList
        candidates={candidates}
        preferredBeachSlug={preferredBeachSlug}
        onSelectBeach={onSelectBeach}
      />
      <div className="funnel-option-grid">
        {COMPANION_OPTIONS.map((companion) => (
          <Button
            key={companion}
            type="button"
            variant="outline"
            className={`funnel-option ${value === companion ? "is-selected" : ""}`}
            onClick={() => onSelect(companion)}
          >
            {companion}
          </Button>
        ))}
      </div>
    </section>
  );
}
