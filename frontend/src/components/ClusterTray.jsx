import ConfirmDeleteDialog from "@/components/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";

function clusterId(cluster) {
  return cluster?._id || cluster?.id;
}

function beachNameForSlug(slug, beachesBySlug) {
  return beachesBySlug[slug]?.name || slug.replaceAll("-", " ");
}

export default function ClusterTray({
  clusters = [],
  beachesBySlug = {},
  selectedBeach,
  loading = false,
  error = "",
  requiresAuth = false,
  onLogin,
  onCreate,
  onDelete,
  onEdit,
  onAddBeach,
  onRemoveBeach,
}) {
  return (
    <section className="cluster-tray" aria-label="Mood clusters">
      <div className="cluster-tray__heading">
        <p>CLUSTERS</p>
        <h1>saved moods, not sorted files</h1>
        <span>Little constellations of beaches tied to your profile.</span>
      </div>

      <div className="cluster-tray__toolbar">
        <Button type="button" onClick={requiresAuth ? onLogin : onCreate}>
          {requiresAuth ? "log in to create" : "new cluster"}
        </Button>
        {selectedBeach && <span>selected // {selectedBeach.name.toLowerCase()}</span>}
      </div>

      {requiresAuth && (
        <div className="cluster-empty-state">
          <p>LOG IN TO USE CLUSTERS //</p>
          <span>Clusters are saved to your profile, so each account sees its own upcoming beaches.</span>
          <button type="button" onClick={onLogin}>LOG IN</button>
        </div>
      )}

      {loading && <p className="cluster-muted">loading clusters...</p>}
      {error && <p className="cluster-error">{error}</p>}

      {!requiresAuth && !loading && clusters.length === 0 && (
        <div className="cluster-empty-state">
          <p>NO CLUSTERS YET //</p>
          <span>Hit the plus on a beach tile and we'll start one for you. Tidy little chaos.</span>
        </div>
      )}

      {!requiresAuth && (
        <div className="cluster-list">
          {clusters.map((cluster) => {
            const id = clusterId(cluster);
            const slugs = Array.isArray(cluster.beach_slugs) ? cluster.beach_slugs : [];
            const hasSelectedBeach = Boolean(
              selectedBeach?.slug && slugs.includes(selectedBeach.slug),
            );

            return (
              <article className="cluster-card" key={id}>
                <span className="cluster-card__color" style={{ "--cluster-color": cluster.color || "#91C059" }} />
                <div className="cluster-card__top">
                  <div>
                    <span>{slugs.length} beaches</span>
                    <h2>{cluster.name}</h2>
                    {cluster.description && <p>{cluster.description}</p>}
                    {cluster.mood_phrase && <small>{cluster.mood_phrase}</small>}
                  </div>
                  <div className="cluster-card__actions">
                    <button type="button" onClick={() => onEdit?.(cluster)}>EDIT</button>
                    <ConfirmDeleteDialog
                      title={`Delete ${cluster.name}?`}
                      description="This removes the cluster. The beach data stays available."
                      confirmLabel="DELETE CLUSTER"
                      onConfirm={() => onDelete?.(cluster)}
                    >
                      <button type="button" className="danger-text-button">DELETE</button>
                    </ConfirmDeleteDialog>
                  </div>
                </div>

                <div className="cluster-beach-list">
                  {slugs.length === 0 && <em>no beaches yet</em>}
                  {slugs.map((slug) => (
                    <span key={slug}>
                      {beachNameForSlug(slug, beachesBySlug)}
                      <button type="button" onClick={() => onRemoveBeach?.(cluster, slug)} aria-label={`Remove ${slug}`}>
                        x
                      </button>
                    </span>
                  ))}
                </div>

                {selectedBeach && (
                  <button
                    type="button"
                    className="cluster-card__add"
                    disabled={hasSelectedBeach}
                    onClick={() => onAddBeach?.(cluster, selectedBeach)}
                  >
                    {hasSelectedBeach ? "already in here" : `add ${selectedBeach.name.toLowerCase()}`}
                  </button>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
