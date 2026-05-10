import { apiClient } from "@/api/client";

let plansCache = null;
let plansRequest = null;

function getPlanId(plan) {
  return plan?._id || plan?.id;
}

export async function createPlan(payload) {
  const { data } = await apiClient.post("/plans", payload);
  plansCache = Array.isArray(plansCache) ? [data, ...plansCache] : null;
  return data;
}

export async function generatePlanPreview(payload) {
  const { data } = await apiClient.post("/plans/preview", payload);
  return data;
}

export async function savePlanSnapshot(payload) {
  const { data } = await apiClient.post("/plans/save-snapshot", payload);
  plansCache = Array.isArray(plansCache) ? [data, ...plansCache] : null;
  return data;
}

export async function getPlans() {
  if (plansCache) return plansCache;
  if (plansRequest) return plansRequest;

  plansRequest = apiClient.get("/plans")
    .then(({ data }) => {
      plansCache = data;
      return data;
    })
    .finally(() => {
      plansRequest = null;
    });

  return plansRequest;
}

export async function refreshPlans() {
  const { data } = await apiClient.get("/plans");
  plansCache = data;
  return data;
}

export function getCachedPlans() {
  return plansCache;
}

export function clearPlansCache() {
  plansCache = null;
  plansRequest = null;
}

export async function getPlan(id) {
  const { data } = await apiClient.get(`/plans/${id}`);
  return data;
}

export async function updatePlanNotes(id, user_notes) {
  const { data } = await apiClient.patch(`/plans/${id}`, { user_notes });
  if (Array.isArray(plansCache)) {
    plansCache = plansCache.map((plan) => (
      getPlanId(plan) === id ? data : plan
    ));
  }
  return data;
}

export async function replayPlan(id) {
  const { data } = await apiClient.patch(`/plans/${id}/replay`);
  if (Array.isArray(plansCache)) {
    plansCache = plansCache.map((plan) => (
      getPlanId(plan) === id ? data : plan
    ));
  }
  return data;
}

export async function deletePlan(id) {
  const { data } = await apiClient.delete(`/plans/${id}`);
  if (Array.isArray(plansCache)) {
    plansCache = plansCache.filter((plan) => getPlanId(plan) !== id);
  }
  return data;
}
