import { apiClient } from "@/api/client";

export async function getConditions() {
  const { data } = await apiClient.get("/conditions");
  return data;
}

export async function getMapConditions() {
  const { data } = await apiClient.get("/conditions/map");
  return data;
}

export async function getCondition(slug) {
  const { data } = await apiClient.get(`/conditions/${slug}`);
  return data;
}
