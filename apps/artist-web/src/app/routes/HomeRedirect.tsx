import { Navigate } from "react-router-dom";
import { useAuth } from "@/features/auth/model/auth-context";

export function HomeRedirect() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (user?.roles.includes("ADMIN")) {
    return <Navigate to="/admin" replace />;
  }

  if (user?.roles.includes("ARTIST")) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Navigate to="/login" replace />;
}
