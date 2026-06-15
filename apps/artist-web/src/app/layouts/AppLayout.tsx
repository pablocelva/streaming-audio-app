import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/model/auth-context";

export function AppLayout() {
  const { user, logout } = useAuth();
  const isAdmin = user?.roles.includes("ADMIN") ?? false;

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Portal Artista</h1>
        <p className="muted">{user?.fullName ?? user?.email}</p>
        <nav>
          <NavLink to="/dashboard">Estadísticas</NavLink>
          <NavLink to="/upload">Subir música</NavLink>
          {isAdmin && <NavLink to="/admin">Administración</NavLink>}
        </nav>
        {isAdmin && (
          <Link to="/admin" className="muted portal-link">
            Ir al panel admin
          </Link>
        )}
        <button type="button" onClick={logout}>
          Cerrar sesión
        </button>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
