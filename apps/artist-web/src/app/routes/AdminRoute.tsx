import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/model/auth-context";

export function AdminRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (!user?.roles.includes("ADMIN")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
