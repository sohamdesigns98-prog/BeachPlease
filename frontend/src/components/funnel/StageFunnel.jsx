import FunnelStageActivity from "@/components/funnel/FunnelStageActivity";
import FunnelStageCompanion from "@/components/funnel/FunnelStageCompanion";
import FunnelStageMood from "@/components/funnel/FunnelStageMood";
import FunnelStageRegion from "@/components/funnel/FunnelStageRegion";

export default function StageFunnel({
  state,
  conditions,
  candidates,
  onChange,
  onGenerate,
}) {
  function update(nextState) {
    onChange({
      ...state,
      ...nextState,
    });
  }

  function buildGenerationPayload() {
    return {
      region: state.region,
      activity: state.activity,
      companion: state.companion,
      mood_phrase: state.mood_phrase?.trim() || undefined,
      preferred_beach_slug: state.preferredBeachSlug || undefined,
    };
  }

  return (
    <section className="stage-funnel" aria-label="Beach decision funnel">
      <div className="stage-funnel__intro">
        <span>BEACHPLEASE</span>
        <p>No filters. Just enough questions to stop you ending up somewhere cooked.</p>
      </div>

      <div className="stage-funnel__progress" aria-label="Funnel progress">
        {[0, 1, 2, 3].map((stage) => (
          <span
            key={stage}
            className={state.stage === stage ? "is-active" : ""}
            aria-label={`Stage ${stage}`}
          />
        ))}
      </div>

      {state.stage === 0 && (
        <FunnelStageRegion
          value={state.region}
          onSelect={(region) => update({ region, stage: 1 })}
        />
      )}

      {state.stage === 1 && (
        <FunnelStageActivity
          value={state.activity}
          onSelect={(activity) => update({ activity, stage: 2 })}
        />
      )}

      {state.stage === 2 && (
        <FunnelStageCompanion
          value={state.companion}
          conditions={conditions}
          candidates={candidates}
          preferredBeachSlug={state.preferredBeachSlug}
          onSelect={(companion) => update({ companion, stage: 3 })}
          onSelectBeach={(beach) => update({
            preferredBeachSlug: beach.slug,
          })}
        />
      )}

      {state.stage === 3 && (
        <FunnelStageMood
          value={state.mood_phrase}
          onChange={(moodPhrase) => update({ mood_phrase: moodPhrase })}
          onGenerate={() => onGenerate(buildGenerationPayload())}
        />
      )}

      {state.stage > 0 && (
        <button
          type="button"
          className="funnel-back-button"
          onClick={() => update({ stage: Math.max(0, state.stage - 1) })}
        >
          ← back a tick
        </button>
      )}
    </section>
  );
}
