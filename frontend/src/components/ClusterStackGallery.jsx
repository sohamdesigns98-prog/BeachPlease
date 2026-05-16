import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const FALLBACK_IMAGE = "/landing-scroll.jpg";

const STACK_PRESETS = [
  {
    id: "swim",
    label: "swim",
    tags: ["swim", "calm", "protected", "pool", "gentle", "float"],
    chips: ["ocean pool", "calm"],
  },
  {
    id: "surf",
    label: "surf",
    tags: ["surf", "wave", "swell", "break", "active", "wild"],
    chips: ["swell", "waves"],
  },
  {
    id: "relax",
    label: "relax",
    tags: ["relax", "quiet", "calm", "soft", "scenic", "reset"],
    chips: ["quiet", "slow"],
  },
  {
    id: "walk",
    label: "walk",
    tags: ["walk", "coastal", "track", "headland", "lighthouse", "scenic"],
    chips: ["coastal", "track"],
  },
  {
    id: "solo",
    label: "solo",
    tags: ["solo", "quiet", "read", "private", "secluded", "vanish"],
    chips: ["hideaway", "book"],
  },
  {
    id: "partner",
    label: "partner",
    tags: ["partner", "date", "romantic", "sunset", "views", "scenic"],
    chips: ["date", "sunset"],
  },
];
const REGION_OPTIONS = ["northern", "manly", "harbour", "eastern", "south", "cronulla"];
const ACTIVITY_OPTIONS = ["swim", "surf", "relax", "snorkel", "walk"];
const COMPANION_OPTIONS = ["solo", "partner", "family", "dog", "mates"];
const CREATE_OPTIONS = [
  {
    id: "plan",
    label: "create plan",
    description: "one beach day for today",
  },
  {
    id: "cluster",
    label: "create cluster",
    description: "save a group of beaches",
  },
  {
    id: "ritual",
    label: "create ritual",
    description: "repeatable beach routine",
  },
];

function beachMatchesPreset(beach, preset) {
  const haystack = [
    beach.name,
    beach.region,
    beach.suburb,
    beach.vibe,
    ...(beach.vibe_tags || []),
    ...(beach.best_for || []),
    ...(beach.facilities || []),
    ...(beach.access_tags || []),
  ].join(" ").toLowerCase();

  return preset.tags.some((tag) => haystack.includes(tag));
}

function stackBeachesForPreset(beaches, preset, presetIndex) {
  const matches = beaches.filter((beach) => beachMatchesPreset(beach, preset));
  const source = matches.length >= 3 ? matches : beaches;
  const start = source.length ? (presetIndex * 3) % source.length : 0;
  const ordered = [...source.slice(start), ...source.slice(0, start)];
  return ordered.slice(0, Math.min(5, Math.max(3, ordered.length)));
}

function prettyList(items = [], fallback = "low fuss") {
  const list = Array.isArray(items) ? items.filter(Boolean) : [];
  if (!list.length) return fallback;
  return list.slice(0, 3).map((item) => String(item).replaceAll("_", " ")).join(" · ");
}

function bestTime(beach) {
  return beach.bestTime || beach.ideal_times?.[0] || "morning or late arvo";
}

function ClusterBeachInfoCard({ beach, isExpanded, isActive, onToggle }) {
  return (
    <article className={`cluster-carousel-card ${isExpanded ? "is-expanded" : ""}`}>
      <button
        type="button"
        className="cluster-carousel-card__button"
        aria-expanded={isExpanded}
        onClick={onToggle}
        tabIndex={isActive ? 0 : -1}
      >
        <span className="cluster-carousel-card__image">
          <img
            src={beach.imageUrl || FALLBACK_IMAGE}
            alt=""
            draggable="false"
            onError={(event) => {
              if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
                event.currentTarget.src = FALLBACK_IMAGE;
              }
            }}
          />
          <span>
            <strong>{beach.name?.toLowerCase()}</strong>
            <small>{beach.region?.toLowerCase() || "sydney"}</small>
          </span>
        </span>
        <span className="cluster-carousel-card__chevron" aria-hidden="true">
          {isExpanded ? "⌃" : "⌄"}
        </span>
      </button>

      {isExpanded && (
        <div className="cluster-carousel-card__details">
          <dl>
            <div>
              <dt>temp</dt>
              <dd>{beach.temp ? `${beach.temp}°C` : "n/a"}</dd>
            </div>
            <div>
              <dt>waves</dt>
              <dd>{beach.waves ? `${beach.waves}m` : "n/a"}</dd>
            </div>
            <div>
              <dt>wind</dt>
              <dd>{beach.windKmh ? `${beach.windKmh}km/h` : "n/a"}</dd>
            </div>
          </dl>

          <section>
            <h3>best time</h3>
            <p>{bestTime(beach)}</p>
          </section>
          <section>
            <h3>facilities</h3>
            <p>{prettyList(beach.facilities, "bring your own everything")}</p>
          </section>
          <section>
            <h3>good for</h3>
            <p>{prettyList(beach.best_for || beach.vibe_tags, beach.vibe || "beach day")}</p>
          </section>
        </div>
      )}
    </article>
  );
}

function CreateChoiceMenu({ onCreateCluster, onCreatePlan, onCreateRitual }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeForm, setActiveForm] = useState("");
  const [planForm, setPlanForm] = useState({
    mood: "",
    companion: "solo",
    locality: "eastern",
    activity: "swim",
    food: "",
    notes: "",
  });
  const [ritualForm, setRitualForm] = useState({
    name: "",
    mood: "",
    preferredTime: "",
    companion: "solo",
    locality: "eastern",
    activity: "swim",
    food: "",
    linkedCluster: "",
    notes: "",
  });

  function updatePlan(field, value) {
    setPlanForm((current) => ({ ...current, [field]: value }));
  }

  function updateRitual(field, value) {
    setRitualForm((current) => ({ ...current, [field]: value }));
  }

  function closeForm() {
    setActiveForm("");
  }

  return (
    <>
      <div className="cluster-create-menu">
        <motion.button
          type="button"
          className="cluster-create-menu__button"
          layout
          onClick={() => setIsOpen((current) => !current)}
          aria-expanded={isOpen}
        >
          create
        </motion.button>

        {isOpen && (
          <motion.div
            className="cluster-create-menu__panel"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 180, damping: 22 }}
          >
            {CREATE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  if (option.id === "cluster") {
                    onCreateCluster?.();
                    return;
                  }
                  setActiveForm(option.id);
                }}
              >
                <strong>{option.label}</strong>
                <span>{option.description}</span>
              </button>
            ))}
          </motion.div>
        )}
      </div>

      <Dialog open={activeForm === "plan"} onOpenChange={(open) => {
        if (!open) closeForm();
      }}>
        <DialogContent className="cluster-create-dialog">
          <DialogClose className="cluster-dialog__close" type="button" aria-label="Close create plan">
            x
          </DialogClose>
          <p>CREATE PLAN //</p>
          <DialogHeader>
            <DialogTitle>one beach day for today</DialogTitle>
            <DialogDescription>
              Direct the mood, company, coast, activity, food stops, and extra notes.
            </DialogDescription>
          </DialogHeader>
          <form
            className="cluster-create-form"
            onSubmit={(event) => {
              event.preventDefault();
              onCreatePlan?.(planForm);
              closeForm();
            }}
          >
            <label>
              <small>MOOD</small>
              <input value={planForm.mood} onChange={(event) => updatePlan("mood", event.target.value)} required />
            </label>
            <div className="cluster-create-form__grid">
              <label>
                <small>COMPANION</small>
                <select value={planForm.companion} onChange={(event) => updatePlan("companion", event.target.value)}>
                  {COMPANION_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label>
                <small>LOCALITY</small>
                <select value={planForm.locality} onChange={(event) => updatePlan("locality", event.target.value)}>
                  {REGION_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>
            <div className="cluster-create-form__grid">
              <label>
                <small>ACTIVITY</small>
                <select value={planForm.activity} onChange={(event) => updatePlan("activity", event.target.value)}>
                  {ACTIVITY_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label>
                <small>FOOD / CAFE / BAR</small>
                <input value={planForm.food} onChange={(event) => updatePlan("food", event.target.value)} />
              </label>
            </div>
            <label>
              <small>EXTRA NOTES</small>
              <textarea value={planForm.notes} onChange={(event) => updatePlan("notes", event.target.value)} />
            </label>
            <Button type="submit">create plan</Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={activeForm === "ritual"} onOpenChange={(open) => {
        if (!open) closeForm();
      }}>
        <DialogContent className="cluster-create-dialog">
          <DialogClose className="cluster-dialog__close" type="button" aria-label="Close create ritual">
            x
          </DialogClose>
          <p>CREATE RITUAL //</p>
          <DialogHeader>
            <DialogTitle>repeatable beach routine</DialogTitle>
            <DialogDescription>
              Save the routine once, then rerun it later with fresh conditions.
            </DialogDescription>
          </DialogHeader>
          <form
            className="cluster-create-form"
            onSubmit={(event) => {
              event.preventDefault();
              onCreateRitual?.(ritualForm);
              closeForm();
            }}
          >
            <label>
              <small>NAME</small>
              <input value={ritualForm.name} onChange={(event) => updateRitual("name", event.target.value)} required />
            </label>
            <label>
              <small>MOOD PHRASE</small>
              <input value={ritualForm.mood} onChange={(event) => updateRitual("mood", event.target.value)} required />
            </label>
            <div className="cluster-create-form__grid">
              <label>
                <small>PREFERRED TIME</small>
                <input value={ritualForm.preferredTime} onChange={(event) => updateRitual("preferredTime", event.target.value)} placeholder="sunday morning" />
              </label>
              <label>
                <small>COMPANION</small>
                <select value={ritualForm.companion} onChange={(event) => updateRitual("companion", event.target.value)}>
                  {COMPANION_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>
            <div className="cluster-create-form__grid">
              <label>
                <small>LOCALITY</small>
                <select value={ritualForm.locality} onChange={(event) => updateRitual("locality", event.target.value)}>
                  {REGION_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
              <label>
                <small>ACTIVITY</small>
                <select value={ritualForm.activity} onChange={(event) => updateRitual("activity", event.target.value)}>
                  {ACTIVITY_OPTIONS.map((option) => <option key={option}>{option}</option>)}
                </select>
              </label>
            </div>
            <label>
              <small>FOOD / DRINK</small>
              <input value={ritualForm.food} onChange={(event) => updateRitual("food", event.target.value)} />
            </label>
            <label>
              <small>LINKED CLUSTER</small>
              <input value={ritualForm.linkedCluster} onChange={(event) => updateRitual("linkedCluster", event.target.value)} placeholder="optional" />
            </label>
            <label>
              <small>EXTRA PREFERENCES</small>
              <textarea value={ritualForm.notes} onChange={(event) => updateRitual("notes", event.target.value)} />
            </label>
            <Button type="submit">create ritual</Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default function ClusterStackGallery({
  beaches = [],
  onCreateCluster,
  onCreatePlan,
  onCreateRitual,
}) {
  const stacks = useMemo(
    () => STACK_PRESETS.map((preset, presetIndex) => ({
      ...preset,
      beaches: stackBeachesForPreset(beaches, preset, presetIndex),
    })),
    [beaches],
  );
  const [activePresetId, setActivePresetId] = useState("");
  const [activeBeachIndex, setActiveBeachIndex] = useState(0);
  const [expandedBeachSlug, setExpandedBeachSlug] = useState("");
  const activePreset = stacks.find((preset) => preset.id === activePresetId);

  function openPreset(presetId) {
    setActivePresetId(presetId);
    setActiveBeachIndex(0);
    setExpandedBeachSlug("");
  }

  function moveBeach(direction) {
    if (!activePreset?.beaches.length) return;
    setExpandedBeachSlug("");
    setActiveBeachIndex((currentIndex) => (
      (currentIndex + direction + activePreset.beaches.length) % activePreset.beaches.length
    ));
  }

  if (activePreset) {
    return (
      <section className="cluster-stack-gallery cluster-stack-gallery--carousel" aria-label={`${activePreset.label} beach carousel`}>
        <div className="cluster-carousel-heading">
          <button
            type="button"
            onClick={() => {
              setActivePresetId("");
              setExpandedBeachSlug("");
            }}
          >
            all stacks
          </button>
          <div>
            <p>{activePreset.label}</p>
            <h1>{activePreset.label} beaches</h1>
          </div>
        </div>

        <div className="cluster-coverflow" aria-label={`${activePreset.label} beach coverflow`}>
          <button
            type="button"
            className="cluster-coverflow__control cluster-coverflow__control--prev"
            aria-label="Previous beach"
            onClick={() => moveBeach(-1)}
          >
            ‹
          </button>

          <div className="cluster-coverflow__stage">
            {activePreset.beaches.map((beach, beachIndex) => {
              const offset = beachIndex - activeBeachIndex;
              const wrappedOffset = offset > activePreset.beaches.length / 2
                ? offset - activePreset.beaches.length
                : offset < -activePreset.beaches.length / 2
                  ? offset + activePreset.beaches.length
                  : offset;
              const isActive = wrappedOffset === 0;
              const isVisible = Math.abs(wrappedOffset) <= 2;

              return (
                <motion.div
                  key={beach.slug || beach.name}
                  className="cluster-coverflow__item"
                  animate={{
                    x: wrappedOffset * 178,
                    z: isActive ? 80 : -Math.abs(wrappedOffset) * 90,
                    rotateY: wrappedOffset * -34,
                    scale: isActive ? 1 : 0.82 - (Math.abs(wrappedOffset) * 0.04),
                    opacity: isVisible ? 1 - (Math.abs(wrappedOffset) * 0.24) : 0,
                  }}
                  transition={{ type: "spring", stiffness: 130, damping: 22, mass: 0.8 }}
                  style={{
                    zIndex: 20 - Math.abs(wrappedOffset),
                    pointerEvents: isVisible ? "auto" : "none",
                  }}
                  onClick={() => {
                    if (!isActive) {
                      setExpandedBeachSlug("");
                      setActiveBeachIndex(beachIndex);
                    }
                  }}
                >
                  <ClusterBeachInfoCard
                    beach={beach}
                    isActive={isActive}
                    isExpanded={isActive && expandedBeachSlug === beach.slug}
                    onToggle={() => {
                      if (!isActive) {
                        setExpandedBeachSlug("");
                        setActiveBeachIndex(beachIndex);
                        return;
                      }
                      setExpandedBeachSlug((current) => (current === beach.slug ? "" : beach.slug));
                    }}
                  />
                </motion.div>
              );
            })}
          </div>

          <button
            type="button"
            className="cluster-coverflow__control cluster-coverflow__control--next"
            aria-label="Next beach"
            onClick={() => moveBeach(1)}
          >
            ›
          </button>
        </div>

        <div className="cluster-coverflow__dots" aria-label="Choose beach">
          {activePreset.beaches.map((beach, beachIndex) => (
            <button
              key={beach.slug || beach.name}
              type="button"
              className={beachIndex === activeBeachIndex ? "is-active" : ""}
              aria-label={`Show ${beach.name}`}
              onClick={() => {
                setExpandedBeachSlug("");
                setActiveBeachIndex(beachIndex);
              }}
            />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="cluster-stack-gallery" aria-label="Beach mood stacks">
      <div className="cluster-stack-gallery__intro">
        <p>cluster</p>
        <h1>pick the pile that feels right</h1>
        <CreateChoiceMenu
          onCreateCluster={onCreateCluster}
          onCreatePlan={onCreatePlan}
          onCreateRitual={onCreateRitual}
        />
      </div>

      <div className="cluster-stack-grid">
        {STACK_PRESETS.map((preset, presetIndex) => {
          const stack = stackBeachesForPreset(beaches, preset, presetIndex);

          return (
            <article className="cluster-stack-card" key={preset.id}>
              <button
                type="button"
                className="cluster-stack-card__stack"
                aria-label={`Open ${preset.label} beach stack`}
                onClick={() => {
                  openPreset(preset.id);
                }}
              >
                {stack.map((beach, beachIndex) => (
                  <span
                    className="cluster-stack-card__tile"
                    key={`${preset.id}-${beach.slug || beach.name}-${beachIndex}`}
                    style={{
                      "--stack-index": beachIndex,
                      "--stack-rotate": `${[-7, 5, -2, 8, -4][beachIndex] || 0}deg`,
                      "--stack-x": `${[-18, 12, 0, 22, -8][beachIndex] || 0}px`,
                      "--stack-y": `${[-6, -16, 0, 12, 18][beachIndex] || 0}px`,
                    }}
                  >
                    <img
                      src={beach.imageUrl || FALLBACK_IMAGE}
                      alt=""
                      draggable="false"
                      onError={(event) => {
                        if (!event.currentTarget.src.endsWith(FALLBACK_IMAGE)) {
                          event.currentTarget.src = FALLBACK_IMAGE;
                        }
                      }}
                    />
                  </span>
                ))}
              </button>

              <div className="cluster-stack-card__copy">
                <h2>{preset.label}</h2>
                <div>
                  {preset.chips.map((chip) => (
                    <span key={chip}>{chip}</span>
                  ))}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
