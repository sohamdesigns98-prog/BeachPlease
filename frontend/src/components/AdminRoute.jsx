import { Navigate } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

export default function AdminRoute({ children }) {
  const { token, user, loading } = useAuth();

  if (loading) {
    return <main className="auth-page"><p className="auth-muted">checking admin access...</p></main>;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== "admin") {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <div className="auth-heading">
            <p>Admin //</p>
            <h1>Access needed</h1>
            <span>This area is only available for admin accounts.</span>
          </div>
        </section>
      </main>
    );
  }

  return children;
}
