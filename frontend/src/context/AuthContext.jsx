import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { TOKEN_KEY } from "@/api/client";
import * as authApi from "@/api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  async function refreshUser() {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setUser(null);
      setLoading(false);
      return null;
    }

    setLoading(true);
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      return currentUser;
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      throw error;
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    refreshUser().catch(() => {});
  }, [token]);

  async function register(payload) {
    const response = await authApi.register(payload);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    return response;
  }

  async function login(payload) {
    const response = await authApi.login(payload);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setToken(response.access_token);
    setUser(response.user);
    return response;
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }

  async function updateProfile(payload) {
    const updatedUser = await authApi.updateCurrentUser(payload);
    setUser(updatedUser);
    return updatedUser;
  }

  async function deleteAccount() {
    const response = await authApi.deleteCurrentUser();
    logout();
    return response;
  }

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      register,
      login,
      logout,
      refreshUser,
      updateProfile,
      deleteAccount,
    }),
    [user, token, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}
