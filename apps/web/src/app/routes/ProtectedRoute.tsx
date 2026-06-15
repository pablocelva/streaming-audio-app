import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/model/auth-context";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
