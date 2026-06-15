import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/model/auth-context";

export function ArtistRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (!user?.roles.includes("ARTIST")) {
    if (user?.roles.includes("ADMIN")) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
