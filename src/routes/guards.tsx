// src/routes/guards.tsx
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export function RequireAuth() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // or a spinner
  if (!user) {
    return <Navigate to="/login" replace state={{ next: location.pathname }} />;
  }
  return <Outlet />;
}

export function RequireAdmin() {
  const { user, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" replace state={{ next: location.pathname }} />;
  }
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
}
