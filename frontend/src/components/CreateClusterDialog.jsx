import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const CLUSTER_COLORS = ["#91C059", "#ADD0EE", "#FEC200", "#ECBCEE", "#FF8A65", "#004724"];

export default function CreateClusterDialog({
  isOpen = false,
  selectedBeach,
  cluster,
  moodPhrase = "",
  isSubmitting = false,
  error = "",
  onClose,
  onCreate,
  onUpdate,
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [clusterMood, setClusterMood] = useState("");
  const [color, setColor] = useState(CLUSTER_COLORS[0]);
  const isEditing = Boolean(cluster);

  useEffect(() => {
    if (!isOpen) return;
    setName(cluster?.name || (selectedBeach?.vibe ? `${selectedBeach.vibe} beaches` : ""));
    setDescription(cluster?.description || (selectedBeach?.name ? `starts with ${selectedBeach.name.toLowerCase()}` : ""));
    setClusterMood(cluster?.mood_phrase || moodPhrase);
    setColor(cluster?.color || CLUSTER_COLORS[0]);
  }, [cluster, isOpen, moodPhrase, selectedBeach]);

  function handleSubmit(event) {
    event.preventDefault();
    const payload = {
      name,
      description,
      mood_phrase: clusterMood,
      color,
      beach_slugs: selectedBeach?.slug ? [selectedBeach.slug] : [],
    };

    if (isEditing) {
      onUpdate?.(cluster, {
        name,
        description,
        mood_phrase: clusterMood,
        color,
      });
      return;
    }

    onCreate?.(payload);
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose?.();
    }}>
      <DialogContent className="cluster-dialog">
        <DialogClose className="cluster-dialog__close" type="button" aria-label="Close cluster dialog">
          x
        </DialogClose>
        <p>{isEditing ? "EDIT CLUSTER //" : "NEW CLUSTER //"}</p>
        <DialogHeader>
          <DialogTitle>{isEditing ? "tune this little mood" : "keep this little mood together"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Rename it, recolour it, or sharpen the mood it represents."
              : selectedBeach?.name
              ? `We'll start it with ${selectedBeach.name.toLowerCase()}.`
              : "Start a cluster now. Add beaches from their info cards later."}
          </DialogDescription>
        </DialogHeader>

        <form className="cluster-dialog__form" onSubmit={handleSubmit}>
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
          <fieldset className="cluster-color-field">
            <legend>COLOR</legend>
            <div>
              {CLUSTER_COLORS.map((option) => (
                <button
                  key={option}
                  type="button"
                  className={color === option ? "is-active" : ""}
                  style={{ "--cluster-color": option }}
                  aria-label={`Use cluster color ${option}`}
                  onClick={() => setColor(option)}
                />
              ))}
            </div>
          </fieldset>

          {error && <strong>{error}</strong>}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "saving..." : isEditing ? "save cluster" : "create cluster"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
