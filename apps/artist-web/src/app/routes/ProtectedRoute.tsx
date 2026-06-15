import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth/model/auth-context";

export function ProtectedRoute() {
  const { isAuthenticated, isLoading, user, artist } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <p>Cargando...</p>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const isArtist = user?.roles.includes("ARTIST") ?? false;
  const needsDeclaration =
    isArtist && artist && !artist.declarationSigned && location.pathname !== "/declaration";

  if (needsDeclaration) {
    return <Navigate to="/declaration" replace />;
  }

  return <Outlet />;
}
