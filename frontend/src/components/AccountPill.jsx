import { Link } from "react-router-dom";

import { useAuth } from "@/context/AuthContext";

function initialForUser(user) {
  return (user?.email || "?").trim().charAt(0).toUpperCase();
}

export default function AccountPill() {
  const { user, token, logout } = useAuth();

  if (!token) {
    return (
      <Link className="account-pill" to="/login">
        log in
      </Link>
    );
  }

  return (
    <div className="account-pill account-pill--user">
      <Link to="/profile" aria-label="Open profile">
        <span>{initialForUser(user)}</span>
        <small>{user?.suburb || "profile"}</small>
      </Link>
      <button type="button" onClick={logout}>
        out
      </button>
    </div>
  );
}
