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
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose?.();
    }}>
      <DialogContent className="cluster-dialog">
        <DialogClose className="cluster-dialog__close" type="button" aria-label="Close cluster dialog">
          x
        </DialogClose>
        <p>NEW CLUSTER //</p>
        <DialogHeader>
          <DialogTitle>keep this little mood together</DialogTitle>
          <DialogDescription>
            {selectedBeach?.name
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

          {error && <strong>{error}</strong>}

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "saving..." : "create cluster"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
