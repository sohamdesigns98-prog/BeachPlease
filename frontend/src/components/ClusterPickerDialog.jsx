import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function clusterId(cluster) {
  return cluster?._id || cluster?.id;
}

export default function ClusterPickerDialog({
  isOpen = false,
  beach,
  clusters = [],
  onClose,
  onPick,
  onCreateNew,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) onClose?.();
    }}>
      <DialogContent className="cluster-dialog" aria-label="Choose cluster">
        <DialogClose className="cluster-dialog__close" type="button" aria-label="Close cluster picker">
          x
        </DialogClose>
        <p>ADD TO CLUSTER //</p>
        <DialogHeader>
          <DialogTitle>where should this beach go?</DialogTitle>
          <DialogDescription>
            {beach?.name
              ? `Choose a cluster for ${beach.name.toLowerCase()}, or start a new one.`
              : "Choose a cluster, or start a new one."}
          </DialogDescription>
        </DialogHeader>

        <div className="cluster-picker-list">
          {clusters.map((cluster) => {
            const id = clusterId(cluster);
            const beachCount = Array.isArray(cluster.beach_slugs) ? cluster.beach_slugs.length : 0;
            const alreadySaved = Boolean(beach?.slug && cluster.beach_slugs?.includes(beach.slug));
            return (
              <button
                key={id}
                type="button"
                disabled={alreadySaved}
                style={{ "--cluster-color": cluster.color || "#91C059" }}
                onClick={() => onPick?.(cluster)}
              >
                <strong>{cluster.name}</strong>
                <span>{alreadySaved ? "already saved" : `${beachCount} beaches`}</span>
              </button>
            );
          })}
        </div>

        <Button type="button" variant="outline" onClick={onCreateNew}>
          create new cluster
        </Button>
      </DialogContent>
    </Dialog>
  );
}
