import { apiClient } from "@/api/client";

export async function getMapConditions() {
  const { data } = await apiClient.get("/conditions/map");
  return data;
}
