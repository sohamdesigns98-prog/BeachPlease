import { Navigate, useLocation } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <main className="auth-page"><p className="auth-muted">checking your beach pass…</p></main>;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
