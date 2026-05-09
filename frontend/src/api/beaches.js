import { apiClient } from "@/api/client";

export async function getBeaches() {
  const { data } = await apiClient.get("/beaches");
  return data;
}
