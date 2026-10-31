import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingScreen from "./LoadingScreen";
import type { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children?: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children ? <>{children}</> : <Outlet />;
}

export function PublicRoute({ children }: { children?: ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to="/" replace />;
  return children ? <>{children}</> : <Outlet />;
}