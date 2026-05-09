import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";

export default function CreateClusterDialog({
  isOpen = false,
  selectedBeach,
  moodPhrase = "",
  isSubmitting = false,
  error = "",
  onClose,
  onCreate,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clusterMood, setClusterMood] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setName(selectedBeach?.vibe ? `${selectedBeach.vibe} beaches` : "");
    setDescription(selectedBeach?.name ? `starts with ${selectedBeach.name.toLowerCase()}` : "");
    setClusterMood(moodPhrase);
  }, [isOpen, moodPhrase, selectedBeach]);

  if (!isOpen) return null;

  function handleSubmit(event) {
    event.preventDefault();
    onCreate?.({
      name,
      description,
      mood_phrase: clusterMood,
      beach_slugs: selectedBeach?.slug ? [selectedBeach.slug] : [],
    });
  }

  return (
    <div className="cluster-dialog-backdrop" role="presentation">
      <form className="cluster-dialog" onSubmit={handleSubmit}>
        <button className="cluster-dialog__close" type="button" onClick={onClose} aria-label="Close cluster dialog">
          ×
        </button>
        <p>NEW CLUSTER //</p>
        <h2>keep this little mood together</h2>
        <span>
          {selectedBeach?.name
            ? `We’ll start it with ${selectedBeach.name.toLowerCase()}.`
            : "Start a cluster now. Add beaches from their info cards later."}
        </span>

        <label>
          <small>NAME</small>
          <input value={name} onChange={(event) => setName(event.target.value)} required />
        </label>
        <label>
          <small>DESCRIPTION</small>
          <input value={description} onChange={(event) => setDescription(event.target.value)} />
        </label>
        <label>
          <small>MOOD PHRASE</small>
          <textarea value={clusterMood} onChange={(event) => setClusterMood(event.target.value)} />
        </label>

        {error && <strong>{error}</strong>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "saving..." : "create cluster"}
        </Button>
      </form>
    </div>
  );
}
