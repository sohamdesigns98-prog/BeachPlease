import { apiClient } from "@/api/client";

export async function getAdminDashboard() {
  const { data } = await apiClient.get("/admin/dashboard");
  return data;
}

export async function getAdminActivities() {
  const { data } = await apiClient.get("/admin/activities");
  return data;
}

export async function getAdminUsers() {
  const { data } = await apiClient.get("/admin/users");
  return data;
}

export async function updateAdminUserRole(id, role) {
  const { data } = await apiClient.patch(`/admin/users/${id}`, { role });
  return data;
}

export async function deleteAdminUser(id) {
  const { data } = await apiClient.delete(`/admin/users/${id}`);
  return data;
}

export async function getAdminPlans() {
  const { data } = await apiClient.get("/admin/plans");
  return data;
}

export async function deleteAdminPlan(id) {
  const { data } = await apiClient.delete(`/admin/plans/${id}`);
  return data;
}

export async function createAdminBeach(payload) {
  const { data } = await apiClient.post("/admin/beaches", payload);
  return data;
}

export async function updateAdminBeach(id, payload) {
  const { data } = await apiClient.patch(`/admin/beaches/${id}`, payload);
  return data;
}

export async function deleteAdminBeach(id) {
  const { data } = await apiClient.delete(`/admin/beaches/${id}`);
  return data;
}
