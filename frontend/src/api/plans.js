import { apiClient } from "@/api/client";

export async function createPlan(payload) {
  const { data } = await apiClient.post("/plans", payload);
  return data;
}

export async function getPlans() {
  const { data } = await apiClient.get("/plans");
  return data;
}

export async function getPlan(id) {
  const { data } = await apiClient.get(`/plans/${id}`);
  return data;
}

export async function updatePlanNotes(id, user_notes) {
  const { data } = await apiClient.patch(`/plans/${id}`, { user_notes });
  return data;
}

export async function replayPlan(id) {
  const { data } = await apiClient.patch(`/plans/${id}/replay`);
  return data;
}

export async function deletePlan(id) {
  const { data } = await apiClient.delete(`/plans/${id}`);
  return data;
}
