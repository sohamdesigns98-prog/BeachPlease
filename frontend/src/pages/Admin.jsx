import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import {
  createAdminBeach,
  deleteAdminBeach,
  deleteAdminPlan,
  deleteAdminUser,
  getAdminActivities,
  getAdminDashboard,
  getAdminPlans,
  getAdminUsers,
  updateAdminBeach,
  updateAdminUserRole,
} from "@/api/admin";
import { getBeaches } from "@/api/beaches";
import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import SydneySuburbSelect from "@/components/SydneySuburbSelect";
import { Button } from "@/components/ui/button";
import { getApiErrorMessage } from "@/utils/apiError";

const REGION_OPTIONS = [
  "Eastern Suburbs",
  "Harbour",
  "Lower North Shore",
  "Northern Beaches",
  "Manly",
  "Cronulla",
  "South Sydney",
  "St George",
];
const WATER_TYPE_OPTIONS = ["ocean", "harbour", "bay", "rockpool"];
const EXPOSURE_OPTIONS = ["protected", "semi_protected", "exposed"];
const ACCESSIBILITY_OPTIONS = ["easy", "moderate", "difficult"];
const CROWD_OPTIONS = ["low", "medium", "high"];
const SUITABILITY_OPTIONS = ["low", "medium", "high"];
const DOG_ACCESS_OPTIONS = ["not_allowed", "restricted", "allowed", "off_leash"];
const SYDNEY_BOUNDS = {
  north: -33.55,
  south: -34.12,
  west: 150.95,
  east: 151.36,
};
const REQUIRED_BEACH_FIELDS = new Set([
  "name",
  "slug",
  "suburb",
  "region",
  "lat",
  "lng",
  "water_type",
  "exposure",
  "accessibility",
  "crowd_level_default",
]);
const TAG_SUGGESTIONS = {
  vibe_tags: ["calm", "social", "surf", "family", "quiet", "secluded", "cafes", "harbour", "walk", "snorkel", "views", "local"],
  best_for: ["surfing", "calm swims", "families", "solo reset", "long walks", "picnics", "snorkelling", "dates", "people watching", "coffee"],
  facilities: ["toilets", "showers", "lifeguards", "cafes", "parking", "park", "bbq", "playground", "nearby_toilets", "limited_facilities"],
};

const EMPTY_BEACH = {
  name: "",
  slug: "",
  suburb: "",
  region: "",
  lat: "",
  lng: "",
  image_url: "",
  water_type: "",
  exposure: "",
  accessibility: "",
  crowd_level_default: "",
  surf_suitability: "",
  swim_suitability: "",
  walk_suitability: "",
  dog_access: "",
  vibe_tags: "",
  best_for: "",
  facilities: "",
};

function getId(item) {
  return item?._id || item?.id;
}

function listFromText(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function textFromList(value) {
  return Array.isArray(value) ? value.join(", ") : "";
}

function slugify(value = "") {
  return String(value)
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueValues(items, field) {
  return Array.from(new Set(
    items
      .map((item) => item?.[field])
      .filter(Boolean)
      .map(String),
  )).sort((a, b) => a.localeCompare(b));
}

function uniqueListValues(items, field) {
  return Array.from(new Set(
    items.flatMap((item) => (Array.isArray(item?.[field]) ? item[field] : []))
      .filter(Boolean)
      .map(String),
  )).sort((a, b) => a.localeCompare(b));
}

function mergeOptions(primary, secondary) {
  return Array.from(new Set([...primary, ...secondary].filter(Boolean)));
}

function fieldLabel(label, required = false) {
  return (
    <>
      {label}
      {required && <strong className="admin-required" aria-label="required">*</strong>}
    </>
  );
}

function formatCoordinate(value) {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue.toFixed(5) : "";
}

function beachToForm(beach) {
  return {
    ...EMPTY_BEACH,
    ...beach,
    lat: beach?.lat ?? "",
    lng: beach?.lng ?? "",
    vibe_tags: textFromList(beach?.vibe_tags),
    best_for: textFromList(beach?.best_for),
    facilities: textFromList(beach?.facilities),
  };
}

function formToBeach(form) {
  return {
    name: form.name,
    slug: form.slug,
    suburb: form.suburb,
    region: form.region,
    lat: form.lat === "" ? null : Number(form.lat),
    lng: form.lng === "" ? null : Number(form.lng),
    image_url: form.image_url,
    water_type: form.water_type,
    exposure: form.exposure,
    accessibility: form.accessibility,
    crowd_level_default: form.crowd_level_default,
    surf_suitability: form.surf_suitability,
    swim_suitability: form.swim_suitability,
    walk_suitability: form.walk_suitability,
    dog_access: form.dog_access,
    vibe_tags: listFromText(form.vibe_tags),
    best_for: listFromText(form.best_for),
    facilities: listFromText(form.facilities),
  };
}

function includesQuery(item, query, fields) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;
  return fields.some((field) => String(item?.[field] || "").toLowerCase().includes(normalizedQuery));
}

function formatDateTime(value) {
  if (!value) return "n/a";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "n/a";
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatCard({ label, value, note }) {
  return (
    <article className="admin-stat-card">
      <span>{label}</span>
      <strong>{value ?? 0}</strong>
      {note && <small>{note}</small>}
    </article>
  );
}

function BarChart({ title, data = [] }) {
  const max = Math.max(1, ...data.map((item) => Number(item.count) || 0));
  return (
    <section className="admin-chart-card">
      <p>{title}</p>
      {data.length === 0 ? (
        <span>no data yet</span>
      ) : data.map((item) => (
        <div key={item.label} className="admin-bar-row">
          <small>{String(item.label).replaceAll("_", " ")}</small>
          <div>
            <i style={{ width: `${Math.max(8, ((Number(item.count) || 0) / max) * 100)}%` }} />
          </div>
          <b>{item.count}</b>
        </div>
      ))}
    </section>
  );
}

function ActivityList({ activities = [] }) {
  return (
    <div className="admin-activity-list">
      {activities.map((activity) => (
        <article key={getId(activity)}>
          <div>
            <strong>{activity.action?.replaceAll("_", " ")} {activity.entity_type}</strong>
            <span>{activity.label || activity.email || activity.entity_id || "system event"}</span>
          </div>
          <small>{activity.email || "anonymous"} / {formatDateTime(activity.created_at)}</small>
        </article>
      ))}
      {activities.length === 0 && <p className="admin-muted">no activity yet</p>}
    </div>
  );
}

function validateBeachForm(form) {
  const nextErrors = {};

  REQUIRED_BEACH_FIELDS.forEach((field) => {
    if (String(form[field] ?? "").trim() === "") {
      nextErrors[field] = "Required";
    }
  });

  if (form.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(form.slug)) {
    nextErrors.slug = "Use lowercase letters, numbers, and hyphens only";
  }

  const lat = Number(form.lat);
  const lng = Number(form.lng);
  if (form.lat !== "" && (!Number.isFinite(lat) || lat < -90 || lat > 90)) {
    nextErrors.lat = "Enter a valid latitude";
  }
  if (form.lng !== "" && (!Number.isFinite(lng) || lng < -180 || lng > 180)) {
    nextErrors.lng = "Enter a valid longitude";
  }

  if (
    Number.isFinite(lat)
    && Number.isFinite(lng)
    && (lat < SYDNEY_BOUNDS.south || lat > SYDNEY_BOUNDS.north || lng < SYDNEY_BOUNDS.west || lng > SYDNEY_BOUNDS.east)
  ) {
    nextErrors.lat = nextErrors.lat || "Looks outside Sydney coastal bounds";
    nextErrors.lng = nextErrors.lng || "Looks outside Sydney coastal bounds";
  }

  return nextErrors;
}

function FieldError({ message }) {
  if (!message) return null;
  return <small className="admin-field-error">{message}</small>;
}

function SelectField({ label, value, options, required = false, error = "", onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedLabel = value ? value.replaceAll("_", " ") : "";
  const filteredOptions = options.filter((option) => option.toLowerCase().includes(query.trim().toLowerCase()));

  function selectOption(option) {
    onChange(option);
    setQuery("");
    setIsOpen(false);
  }

  return (
    <label>
      <span>{fieldLabel(label, required)}</span>
      <div className="admin-combobox">
        <input
          value={isOpen ? query : selectedLabel}
          placeholder={`choose ${label}`}
          aria-invalid={Boolean(error)}
          onFocus={() => {
            setQuery(selectedLabel);
            setIsOpen(true);
          }}
          onBlur={() => setIsOpen(false)}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
        />
        {isOpen && (
          <div className="admin-combobox__menu">
            {filteredOptions.length > 0 ? filteredOptions.map((option) => (
              <button
                key={option}
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
              >
                {option.replaceAll("_", " ")}
              </button>
            )) : (
              <span>no matching option</span>
            )}
          </div>
        )}
      </div>
      <FieldError message={error} />
    </label>
  );
}

function TagSuggestionField({ label, value, suggestions, onChange }) {
  const selected = listFromText(value);

  function toggleTag(tag) {
    const nextTags = selected.includes(tag)
      ? selected.filter((item) => item !== tag)
      : [...selected, tag];
    onChange(nextTags.join(", "));
  }

  return (
    <label className="is-wide admin-tag-field">
      <span>{label}</span>
      <input value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder="comma separated, or click suggestions below" />
      <div>
        {suggestions.map((tag) => (
          <button
            key={tag}
            type="button"
            className={selected.includes(tag) ? "is-active" : ""}
            onClick={() => toggleTag(tag)}
          >
            {tag.replaceAll("_", " ")}
          </button>
        ))}
      </div>
    </label>
  );
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [activities, setActivities] = useState([]);
  const [users, setUsers] = useState([]);
  const [plans, setPlans] = useState([]);
  const [beaches, setBeaches] = useState([]);
  const [query, setQuery] = useState("");
  const [beachForm, setBeachForm] = useState(EMPTY_BEACH);
  const [beachFormErrors, setBeachFormErrors] = useState({});
  const [editingBeachId, setEditingBeachId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAdminData();
  }, []);

  async function loadAdminData() {
    setLoading(true);
    setError("");
    try {
      const [nextDashboard, nextActivities, nextUsers, nextPlans, nextBeaches] = await Promise.all([
        getAdminDashboard(),
        getAdminActivities(),
        getAdminUsers(),
        getAdminPlans(),
        getBeaches(),
      ]);
      setDashboard(nextDashboard || null);
      setActivities(Array.isArray(nextActivities) ? nextActivities : []);
      setUsers(Array.isArray(nextUsers) ? nextUsers : []);
      setPlans(Array.isArray(nextPlans) ? nextPlans : []);
      setBeaches(Array.isArray(nextBeaches) ? nextBeaches : []);
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Couldn't load admin data."));
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = useMemo(
    () => users.filter((user) => includesQuery(user, query, ["email", "suburb", "role"])),
    [query, users],
  );
  const filteredPlans = useMemo(
    () => plans.filter((plan) => includesQuery(plan, query, ["selected_beach_name", "mood_phrase", "activity", "region"])),
    [plans, query],
  );
  const filteredBeaches = useMemo(
    () => beaches.filter((beach) => includesQuery(beach, query, ["name", "slug", "suburb", "region"])),
    [beaches, query],
  );
  const filteredActivities = useMemo(
    () => activities.filter((activity) => includesQuery(activity, query, ["email", "action", "entity_type", "label"])),
    [activities, query],
  );
  const adminOptions = useMemo(() => ({
    regions: mergeOptions(REGION_OPTIONS, uniqueValues(beaches, "region")),
    waterTypes: mergeOptions(WATER_TYPE_OPTIONS, uniqueValues(beaches, "water_type")),
    exposure: mergeOptions(EXPOSURE_OPTIONS, uniqueValues(beaches, "exposure")),
    accessibility: mergeOptions(ACCESSIBILITY_OPTIONS, uniqueValues(beaches, "accessibility")),
    crowds: mergeOptions(CROWD_OPTIONS, uniqueValues(beaches, "crowd_level_default")),
    dogAccess: mergeOptions(DOG_ACCESS_OPTIONS, uniqueValues(beaches, "dog_access")),
    vibeTags: mergeOptions(TAG_SUGGESTIONS.vibe_tags, uniqueListValues(beaches, "vibe_tags")),
    bestFor: mergeOptions(TAG_SUGGESTIONS.best_for, uniqueListValues(beaches, "best_for")),
    facilities: mergeOptions(TAG_SUGGESTIONS.facilities, uniqueListValues(beaches, "facilities")),
  }), [beaches]);

  async function handleBeachSubmit(event) {
    event.preventDefault();
    const nextErrors = validateBeachForm(beachForm);
    setBeachFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      toast.error("Please fix the required beach fields before saving.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const payload = formToBeach(beachForm);
      const savedBeach = editingBeachId
        ? await updateAdminBeach(editingBeachId, payload)
        : await createAdminBeach(payload);
      setBeaches((currentBeaches) => {
        if (!editingBeachId) return [savedBeach, ...currentBeaches].sort((a, b) => a.name.localeCompare(b.name));
        return currentBeaches.map((beach) => (getId(beach) === editingBeachId ? savedBeach : beach));
      });
      setBeachForm(EMPTY_BEACH);
      setBeachFormErrors({});
      setEditingBeachId("");
      toast.success("Beach saved");
    } catch (caughtError) {
      setError(getApiErrorMessage(caughtError, "Couldn't save beach."));
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteBeach(id) {
    await deleteAdminBeach(id);
    setBeaches((currentBeaches) => currentBeaches.filter((beach) => getId(beach) !== id));
    toast.success("Beach deleted");
  }

  async function handleDeleteUser(id) {
    await deleteAdminUser(id);
    setUsers((currentUsers) => currentUsers.filter((user) => getId(user) !== id));
    toast.success("User deleted");
  }

  async function handleRoleChange(user, role) {
    const updatedUser = await updateAdminUserRole(getId(user), role);
    setUsers((currentUsers) => currentUsers.map((item) => (getId(item) === getId(user) ? updatedUser : item)));
    toast.success("Role updated");
  }

  async function handleDeletePlan(id) {
    await deleteAdminPlan(id);
    setPlans((currentPlans) => currentPlans.filter((plan) => getId(plan) !== id));
    toast.success("Plan deleted");
  }

  function updateBeachForm(field, value) {
    setBeachForm((currentForm) => {
      const nextForm = { ...currentForm, [field]: value };
      if (field === "name" && (!currentForm.slug || currentForm.slug === slugify(currentForm.name))) {
        nextForm.slug = slugify(value);
      }
      return nextForm;
    });
    setBeachFormErrors((currentErrors) => {
      if (!currentErrors[field]) return currentErrors;
      const nextErrors = { ...currentErrors };
      delete nextErrors[field];
      return nextErrors;
    });
  }

  return (
    <main className="admin-page">
      <section className="admin-hero">
        <p>Admin //</p>
        <h1>BeachPlease control room</h1>
        <span>Manage the data entities that support the explore, saved plan, and profile flows.</span>
      </section>

      <div className="admin-toolbar">
        <nav aria-label="Admin sections">
          {["dashboard", "beaches", "users", "plans", "activity"].map((tab) => (
            <button key={tab} type="button" className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </nav>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`search ${activeTab}`} />
      </div>

      {loading && <p className="admin-muted">loading admin data...</p>}
      {error && <p className="admin-error">{error}</p>}

      {activeTab === "dashboard" && dashboard && (
        <section className="admin-dashboard">
          <div className="admin-stat-grid">
            <StatCard label="users" value={dashboard.counts?.users} note={`${dashboard.counts?.new_users_today || 0} new today`} />
            <StatCard label="beaches" value={dashboard.counts?.beaches} note="admin-managed places" />
            <StatCard label="saved plans" value={dashboard.counts?.plans} note={`${dashboard.counts?.plans_today || 0} created today`} />
            <StatCard label="clusters" value={dashboard.counts?.clusters} note="saved beach groups" />
            <StatCard label="activities" value={dashboard.counts?.activities} note="tracked user actions" />
          </div>

          <div className="admin-chart-grid">
            <BarChart title="plans by region" data={dashboard.charts?.plans_by_region} />
            <BarChart title="plans by activity" data={dashboard.charts?.plans_by_activity} />
            <BarChart title="beaches by region" data={dashboard.charts?.beaches_by_region} />
            <BarChart title="activity types" data={dashboard.charts?.activities_by_action} />
          </div>

          <section className="admin-panel">
            <p>Recent activity //</p>
            <ActivityList activities={dashboard.recent_activities || []} />
          </section>
        </section>
      )}

      {activeTab === "beaches" && (
        <section className="admin-grid">
          <form className="admin-panel admin-form" onSubmit={handleBeachSubmit}>
            <p>{editingBeachId ? "Edit beach //" : "Create beach //"}</p>
            <span className="admin-form-help">
              Start with the beach name. Slug is generated automatically, suburb uses postcode data, and metadata fields use existing database values.
            </span>
            <div className="admin-form-grid">
              <label>
                <span>{fieldLabel("name", true)}</span>
                <input value={beachForm.name} aria-invalid={Boolean(beachFormErrors.name)} onChange={(event) => updateBeachForm("name", event.target.value)} placeholder="e.g. Bondi Beach" />
                <FieldError message={beachFormErrors.name} />
              </label>
              <label>
                <span>{fieldLabel("slug", true)}</span>
                <input value={beachForm.slug} aria-invalid={Boolean(beachFormErrors.slug)} onChange={(event) => updateBeachForm("slug", slugify(event.target.value))} placeholder="auto-generated" />
                <FieldError message={beachFormErrors.slug} />
              </label>
              <label className="admin-suburb-field">
                <span>{fieldLabel("suburb", true)}</span>
                <SydneySuburbSelect
                  value={beachForm.suburb}
                  onChange={(nextSuburb) => updateBeachForm("suburb", nextSuburb)}
                  error={beachFormErrors.suburb}
                  onSelectMeta={(meta) => {
                    if (!Number.isFinite(meta?.suburb_lat) || !Number.isFinite(meta?.suburb_lng)) return;
                    if (!beachForm.lat) updateBeachForm("lat", formatCoordinate(meta.suburb_lat));
                    if (!beachForm.lng) updateBeachForm("lng", formatCoordinate(meta.suburb_lng));
                  }}
                />
                <FieldError message={beachFormErrors.suburb} />
              </label>
              <SelectField label="region" required error={beachFormErrors.region} value={beachForm.region} options={adminOptions.regions} onChange={(value) => updateBeachForm("region", value)} />
              <label>
                <span>{fieldLabel("latitude", true)}</span>
                <input value={beachForm.lat} aria-invalid={Boolean(beachFormErrors.lat)} type="number" step="any" onChange={(event) => updateBeachForm("lat", event.target.value)} placeholder="-33.8915" />
                <FieldError message={beachFormErrors.lat} />
              </label>
              <label>
                <span>{fieldLabel("longitude", true)}</span>
                <input value={beachForm.lng} aria-invalid={Boolean(beachFormErrors.lng)} type="number" step="any" onChange={(event) => updateBeachForm("lng", event.target.value)} placeholder="151.2767" />
                <FieldError message={beachFormErrors.lng} />
              </label>
              <label className="is-wide">
                <span>image url</span>
                <input value={beachForm.image_url} onChange={(event) => updateBeachForm("image_url", event.target.value)} placeholder="licensed image URL" />
              </label>
              <SelectField label="water type" required error={beachFormErrors.water_type} value={beachForm.water_type} options={adminOptions.waterTypes} onChange={(value) => updateBeachForm("water_type", value)} />
              <SelectField label="exposure" required error={beachFormErrors.exposure} value={beachForm.exposure} options={adminOptions.exposure} onChange={(value) => updateBeachForm("exposure", value)} />
              <SelectField label="accessibility" required error={beachFormErrors.accessibility} value={beachForm.accessibility} options={adminOptions.accessibility} onChange={(value) => updateBeachForm("accessibility", value)} />
              <SelectField label="crowd level" required error={beachFormErrors.crowd_level_default} value={beachForm.crowd_level_default} options={adminOptions.crowds} onChange={(value) => updateBeachForm("crowd_level_default", value)} />
              <SelectField label="surf suitability" value={beachForm.surf_suitability} options={SUITABILITY_OPTIONS} onChange={(value) => updateBeachForm("surf_suitability", value)} />
              <SelectField label="swim suitability" value={beachForm.swim_suitability} options={SUITABILITY_OPTIONS} onChange={(value) => updateBeachForm("swim_suitability", value)} />
              <SelectField label="walk suitability" value={beachForm.walk_suitability} options={SUITABILITY_OPTIONS} onChange={(value) => updateBeachForm("walk_suitability", value)} />
              <SelectField label="dog access" value={beachForm.dog_access} options={adminOptions.dogAccess} onChange={(value) => updateBeachForm("dog_access", value)} />
              <TagSuggestionField label="vibe tags" value={beachForm.vibe_tags} suggestions={adminOptions.vibeTags} onChange={(value) => updateBeachForm("vibe_tags", value)} />
              <TagSuggestionField label="best for" value={beachForm.best_for} suggestions={adminOptions.bestFor} onChange={(value) => updateBeachForm("best_for", value)} />
              <TagSuggestionField label="facilities" value={beachForm.facilities} suggestions={adminOptions.facilities} onChange={(value) => updateBeachForm("facilities", value)} />
            </div>
            <div className="admin-form-actions">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : editingBeachId ? "Save beach" : "Create beach"}</Button>
              {editingBeachId && (
                <Button type="button" variant="outline" onClick={() => {
                  setBeachForm(EMPTY_BEACH);
                  setBeachFormErrors({});
                  setEditingBeachId("");
                }}>
                  CANCEL
                </Button>
              )}
            </div>
          </form>

          <div className="admin-panel">
            <p>BEACHES // {filteredBeaches.length}</p>
            <div className="admin-table-list">
              {filteredBeaches.map((beach) => (
                <article key={getId(beach)}>
                  <div>
                    <strong>{beach.name}</strong>
                    <span>{beach.suburb || "no suburb"} / {beach.region || "no region"}</span>
                  </div>
                  <div>
                    <button type="button" onClick={() => {
                      setEditingBeachId(getId(beach));
                      setBeachForm(beachToForm(beach));
                      setBeachFormErrors({});
                    }}>Edit</button>
                    <ConfirmDeleteDialog
                      title={`Delete ${beach.name}?`}
                      description="This removes the beach from explore and from saved cluster references."
                      confirmLabel="Delete beach"
                      onConfirm={() => handleDeleteBeach(getId(beach))}
                    >
                      <button type="button" className="danger-text-button">Delete</button>
                    </ConfirmDeleteDialog>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === "users" && (
        <section className="admin-panel">
          <p>USERS // {filteredUsers.length}</p>
          <div className="admin-table-list">
            {filteredUsers.map((user) => (
              <article key={getId(user)}>
                <div>
                  <strong>{user.email}</strong>
                  <span>{user.suburb || "profile incomplete"} / {user.auth_provider} / {user.role}</span>
                </div>
                <div>
                  <button type="button" disabled={user.role === "admin"} onClick={() => handleRoleChange(user, "admin")}>Make admin</button>
                  <button type="button" disabled={user.role === "user"} onClick={() => handleRoleChange(user, "user")}>Make user</button>
                  <ConfirmDeleteDialog
                    title={`Delete ${user.email}?`}
                    description="This deletes the user, saved plans, and clusters."
                    confirmLabel="Delete user"
                    onConfirm={() => handleDeleteUser(getId(user))}
                  >
                    <button type="button" className="danger-text-button">Delete</button>
                  </ConfirmDeleteDialog>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === "plans" && (
        <section className="admin-panel">
          <p>PLANS // {filteredPlans.length}</p>
          <div className="admin-table-list">
            {filteredPlans.map((plan) => (
              <article key={getId(plan)}>
                <div>
                  <strong>{plan.selected_beach_name || "beach plan"}</strong>
                  <span>{plan.mood_phrase || "no mood"} / {plan.activity || "activity n/a"}</span>
                </div>
                <div>
                  <ConfirmDeleteDialog
                    title="Delete this generated plan?"
                    description="This removes the saved plan from the database."
                    confirmLabel="Delete plan"
                    onConfirm={() => handleDeletePlan(getId(plan))}
                  >
                    <button type="button" className="danger-text-button">Delete</button>
                  </ConfirmDeleteDialog>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {activeTab === "activity" && (
        <section className="admin-panel">
          <p>ACTIVITY // {filteredActivities.length}</p>
          <ActivityList activities={filteredActivities} />
        </section>
      )}
    </main>
  );
}
