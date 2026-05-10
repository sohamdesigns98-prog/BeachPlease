import { apiClient } from "@/api/client";

export async function register(payload) {
  const { data } = await apiClient.post("/auth/register", payload);
  return data;
}

export async function login(payload) {
  const { data } = await apiClient.post("/auth/login", payload);
  return data;
}

export async function loginWithGoogle(credential) {
  const { data } = await apiClient.post("/auth/google", { credential });
  return data;
}

export async function getCurrentUser() {
  const { data } = await apiClient.get("/users/me");
  return data;
}

export async function updateCurrentUser(payload) {
  const { data } = await apiClient.patch("/users/me", payload);
  return data;
}

export async function deleteCurrentUser() {
  const { data } = await apiClient.delete("/users/me");
  return data;
}
