import { apiClient } from "@/api/client";

export async function createCluster(payload) {
  const { data } = await apiClient.post("/clusters", payload);
  return data;
}

export async function getClusters() {
  const { data } = await apiClient.get("/clusters");
  return data;
}

export async function getCluster(id) {
  const { data } = await apiClient.get(`/clusters/${id}`);
  return data;
}

export async function updateCluster(id, payload) {
  const { data } = await apiClient.patch(`/clusters/${id}`, payload);
  return data;
}

export async function deleteCluster(id) {
  const { data } = await apiClient.delete(`/clusters/${id}`);
  return data;
}
