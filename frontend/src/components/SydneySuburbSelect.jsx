import { useEffect, useMemo, useState } from "react";

import { getBeaches } from "@/api/beaches";
import { Input } from "@/components/ui/input";

const POSTCODE_API = "https://v0.postcodeapi.com.au/suburbs.json";

function normalizeSuburb(value = "") {
  return String(value)
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function titleCase(value = "") {
  return normalizeSuburb(value).replace(/\b[a-z]/g, (letter) => letter.toUpperCase());
}

function optionName(option) {
  return option?.name || option?.suburb || option?.l || "";
}

function optionPostcode(option) {
  return option?.postcode || option?.post_code || option?.p || "";
}

function optionState(option) {
  const state = option?.state;
  if (typeof state === "string") return state;
  return state?.abbreviation || option?.state_abbreviation || option?.s || "";
}

function optionLatitude(option) {
  const value = option?.latitude ?? option?.lat;
  return value === undefined || value === null ? null : Number(value);
}

function optionLongitude(option) {
  const value = option?.longitude ?? option?.lng ?? option?.lon;
  return value === undefined || value === null ? null : Number(value);
}

export default function SydneySuburbSelect({
  value = "",
  error = "",
  disabled = false,
  onChange,
  onSelectMeta,
  onBlur,
}) {
  const [query, setQuery] = useState(value);
  const [allowedSuburbs, setAllowedSuburbs] = useState([]);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiFailed, setApiFailed] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const allowedSuburbSet = useMemo(
    () => new Set(allowedSuburbs.map((suburb) => normalizeSuburb(suburb))),
    [allowedSuburbs],
  );

  const localOptions = useMemo(
    () => allowedSuburbs
      .filter((suburb) => normalizeSuburb(suburb).includes(normalizeSuburb(query)))
      .slice(0, 8)
      .map((suburb) => ({ name: suburb, postcode: "", state: "NSW", source: "beaches", latitude: null, longitude: null })),
    [allowedSuburbs, query],
  );

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    let cancelled = false;

    async function loadBeachSuburbs() {
      try {
        const beaches = await getBeaches();
        if (cancelled) return;

        const nextSuburbs = Array.from(
          new Set(
            (Array.isArray(beaches) ? beaches : [])
              .map((beach) => titleCase(beach.suburb))
              .filter(Boolean),
          ),
        ).sort((a, b) => a.localeCompare(b));

        setAllowedSuburbs(nextSuburbs);
      } catch {
        if (!cancelled) setAllowedSuburbs([]);
      }
    }

    loadBeachSuburbs();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const term = query.trim();
    if (term.length < 2 || value === term) {
      setOptions([]);
      return;
    }

    const controller = new AbortController();
    setLoading(true);

    fetch(`${POSTCODE_API}?q=${encodeURIComponent(term)}&state=NSW`, {
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : Promise.reject(response)))
      .then((results) => {
        const rawResults = Array.isArray(results) ? results : results?.value || results?.suburbs;
        const nextOptions = Array.isArray(rawResults)
          ? rawResults
            .filter((item) => optionState(item).toUpperCase() === "NSW")
            .slice(0, 8)
            .map((item) => ({
              name: titleCase(optionName(item)),
              postcode: optionPostcode(item),
              state: "NSW",
              source: "postcodeapi",
              latitude: optionLatitude(item),
              longitude: optionLongitude(item),
              isBeachSuburb: allowedSuburbSet.has(normalizeSuburb(optionName(item))),
            }))
          : [];
        setOptions(nextOptions);
        setApiFailed(false);
      })
      .catch((caughtError) => {
        if (caughtError.name !== "AbortError") {
          setApiFailed(true);
          setOptions([]);
        }
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [allowedSuburbSet, query, value]);

  const visibleOptions = (options.length ? options : localOptions);

  function handleInputChange(event) {
    const nextQuery = event.target.value;
    setIsOpen(true);
    setQuery(nextQuery);
    onChange("");
    onSelectMeta?.({ postcode: "", suburb_lat: null, suburb_lng: null });
  }

  function handleSelect(option) {
    const label = titleCase(option.name);
    setQuery(label);
    setOptions([]);
    setIsOpen(false);
    onChange(label);
    onSelectMeta?.({
      postcode: option.postcode ? String(option.postcode) : "",
      suburb_lat: Number.isFinite(option.latitude) ? option.latitude : null,
      suburb_lng: Number.isFinite(option.longitude) ? option.longitude : null,
    });
  }

  return (
    <div className="suburb-select">
      <Input
        value={query}
        placeholder="start typing a Sydney suburb"
        autoComplete="off"
        disabled={disabled}
        aria-invalid={Boolean(error)}
        onBlur={(event) => {
          setIsOpen(false);
          onBlur?.(event);
        }}
        onFocus={() => setIsOpen(true)}
        onChange={handleInputChange}
      />
      <span className="suburb-select__hint">
        {loading ? "checking postcode API..." : "choose a Sydney suburb from postcode data"}
      </span>
      {isOpen && visibleOptions.length > 0 && (
        <div className="suburb-select__menu">
          {visibleOptions.map((option) => (
            <button
              key={`${option.name}-${option.postcode || option.source}`}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(option)}
            >
              <span>{option.name.toLowerCase()}</span>
              <small>{option.postcode ? `NSW ${option.postcode}` : "in beach data"}</small>
            </button>
          ))}
        </div>
      )}
      {apiFailed && (
        <small className="suburb-select__fallback">postcode API unavailable, using beach database suburbs</small>
      )}
    </div>
  );
}
