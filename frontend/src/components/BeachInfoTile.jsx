import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

import { Button } from "@/components/ui/button";

const FALLBACK_IMAGE = "/landing-scroll.jpg";

function formatNumber(value, suffix = "") {
  if (value === null || value === undefined || value === "") return "n/a";
  return `${value}${suffix}`;
}

function prettyList(items = [], fallback = "not logged yet") {
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!list.length) return fallback;
  return list.map((item) => String(item).replaceAll("_", " ")).join(" · ");
}

function getBestTime(beach) {
  if (beach?.bestTime) return beach.bestTime;
  if (Array.isArray(beach?.ideal_times) && beach.ideal_times.length) {
    return beach.ideal_times[0];
  }
  if (beach?.vibe === "artistic") return "late arvo, when the light behaves";
  if (beach?.vibe === "active") return "morning before the wind gets ideas";
  return "morning or late arvo";
}

function getBringList(beach) {
  if (Array.isArray(beach?.whatToBring) && beach.whatToBring.length) {
    return beach.whatToBring;
  }

  const bring = ["water"];
  if ((beach?.uv ?? 0) >= 6) bring.push("spf 50");
  if (beach?.vibe === "active") bring.push("rashie");
  if (beach?.vibe === "solo") bring.push("book");
  if (beach?.vibe === "family") bring.push("shade");
  if (beach?.vibe === "calm") bring.push("goggles");

  return bring.slice(0, 4);
}

function getWarning(beach) {
  if ((beach?.uv ?? 0) >= 8) return "UV is high. Wear SPF 50 and avoid the middle of the day.";
  if ((beach?.windKmh ?? 0) >= 30) return "Wind is up. Expect chop, especially on exposed sand.";
  if ((beach?.waves ?? 0) >= 1.5 && beach?.swim_suitability !== "high") {
    return "Swell is solid. Swim between the flags and keep it sensible.";
  }
  if (Array.isArray(beach?.avoid_when) && beach.avoid_when.length) {
    return `Avoid when ${String(beach.avoid_when[0]).replaceAll("_", " ")}.`;
  }
  return "";
}

function ConditionValue({ children, loading }) {
  if (loading) {
    return <dd className="beach-info-tile__loading" aria-label="Loading condition" />;
  }

  return <dd>{children}</dd>;
}

export default function BeachInfoTile({
  beach,
  conditionLoading = false,
  isGenerating = false,
  onClose,
  onGenerate,
  onAddToCluster,
}) {
  const [imageSrc, setImageSrc] = useState(beach?.imageUrl || FALLBACK_IMAGE);

  useEffect(() => {
    setImageSrc(beach?.imageUrl || FALLBACK_IMAGE);
  }, [beach?.imageUrl]);

  if (!beach) return null;

  const warning = getWarning(beach);
  const bring = getBringList(beach);
  const drawer = (
    <aside
      className="beach-info-tile"
      style={{ "--beach-info-accent": beach.accent || "#91C059" }}
      aria-label={`${beach.name} beach information`}
    >
      <button className="beach-info-tile__close" type="button" onClick={onClose} aria-label="Close beach info">
        x
      </button>

      <header className="beach-info-tile__hero">
        <span className="beach-info-tile__accent" aria-hidden="true" />
        <div>
          <h2>{beach.name}</h2>
          <p>{beach.vibe || "coastal"} · {formatNumber(beach.distanceMin, " min away")}</p>
        </div>
      </header>

      <img
        className="beach-info-tile__image"
        src={imageSrc}
        alt={beach.name}
        onError={() => setImageSrc(FALLBACK_IMAGE)}
      />

      <section className="beach-info-tile__section">
        <h3>CONDITIONS</h3>
        <dl className="beach-info-tile__conditions">
          <div>
            <dt>TEMP</dt>
            <ConditionValue loading={conditionLoading}>{formatNumber(beach.temp, "°C")}</ConditionValue>
          </div>
          <div>
            <dt>WAVES</dt>
            <ConditionValue loading={conditionLoading}>{formatNumber(beach.waves, "m")}</ConditionValue>
          </div>
          <div>
            <dt>WIND</dt>
            <ConditionValue loading={conditionLoading}>{formatNumber(beach.windKmh, "km/h")}</ConditionValue>
          </div>
          <div>
            <dt>UV</dt>
            <ConditionValue loading={conditionLoading}>{formatNumber(beach.uv)}</ConditionValue>
          </div>
          <div>
            <dt>CROWD</dt>
            <ConditionValue loading={conditionLoading}>{beach.crowd?.label || "moderate"}</ConditionValue>
          </div>
        </dl>
      </section>

      <section className="beach-info-tile__section">
        <h3>FACILITIES</h3>
        <p>{prettyList(beach.facilities, "bring your own everything")}</p>
      </section>

      <section className="beach-info-tile__section">
        <h3>BEST TIME</h3>
        <p>{getBestTime(beach)}</p>
      </section>

      {warning && (
        <section className="beach-info-tile__section beach-info-tile__warning">
          <h3>HEADS UP</h3>
          <p>{warning}</p>
        </section>
      )}

      <section className="beach-info-tile__section">
        <h3>WHAT TO BRING</h3>
        <ul>
          {bring.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <Button
        className="beach-info-tile__cluster"
        type="button"
        variant="outline"
        onClick={onAddToCluster}
      >
        Add to Cluster
      </Button>

      <Button
        className="beach-info-tile__generate"
        type="button"
        onClick={onGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? "Generating..." : "Generate Plan"}
      </Button>
    </aside>
  );

  return createPortal(drawer, document.body);
}
