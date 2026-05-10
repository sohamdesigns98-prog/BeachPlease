import { apiClient } from "@/api/client";

let beachesCache = null;
let beachesRequest = null;

export async function getBeaches() {
  if (beachesCache) return beachesCache;
  if (beachesRequest) return beachesRequest;

  beachesRequest = apiClient.get("/beaches")
    .then(({ data }) => {
      beachesCache = data;
      return data;
    })
    .finally(() => {
      beachesRequest = null;
    });

  return beachesRequest;
}

export async function refreshBeaches() {
  const { data } = await apiClient.get("/beaches");
  beachesCache = data;
  return data;
}

export function getCachedBeaches() {
  return beachesCache;
}
