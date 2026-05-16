import { apiClient } from "@/api/client";

export async function searchSydneySuburbs(query, config = {}) {
  const { data } = await apiClient.get("/suburbs/search", {
    ...config,
    params: {
      q: query,
      state: "NSW",
      ...(config.params || {}),
    },
  });
  return data;
}
