import { apiClient } from "@/api/client";

let clustersCache = null;
let clustersRequest = null;

export async function createCluster(payload) {
  const { data } = await apiClient.post("/clusters", payload);
  const createdCluster = { ...payload, ...data, color: data.color || payload.color };
  clustersCache = Array.isArray(clustersCache) ? [createdCluster, ...clustersCache] : null;
  return createdCluster;
}

export async function getClusters() {
  if (clustersCache) return clustersCache;
  if (clustersRequest) return clustersRequest;

  clustersRequest = apiClient.get("/clusters")
    .then(({ data }) => {
      clustersCache = data;
      return data;
    })
    .finally(() => {
      clustersRequest = null;
    });

  return clustersRequest;
}

export async function refreshClusters() {
  const { data } = await apiClient.get("/clusters");
  clustersCache = data;
  return data;
}

export function getCachedClusters() {
  return clustersCache;
}

export function clearClustersCache() {
  clustersCache = null;
  clustersRequest = null;
}

export async function getCluster(id) {
  const { data } = await apiClient.get(`/clusters/${id}`);
  return data;
}

export async function updateCluster(id, payload) {
  const { data } = await apiClient.patch(`/clusters/${id}`, payload);
  const updatedCluster = { ...data, ...payload, _id: data._id || id, id: data.id || id };
  if (Array.isArray(clustersCache)) {
    clustersCache = clustersCache.map((cluster) => (
      (cluster._id || cluster.id) === id ? updatedCluster : cluster
    ));
  }
  return updatedCluster;
}

export async function deleteCluster(id) {
  const { data } = await apiClient.delete(`/clusters/${id}`);
  if (Array.isArray(clustersCache)) {
    clustersCache = clustersCache.filter((cluster) => (cluster._id || cluster.id) !== id);
  }
  return data;
}
