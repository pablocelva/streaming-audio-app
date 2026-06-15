import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/model/auth-context";

export function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="layout admin-layout">
      <aside className="sidebar admin-sidebar">
        <h1>Admin</h1>
        <p className="muted">{user?.fullName ?? user?.email}</p>
        <nav>
          <NavLink to="/admin">Resumen</NavLink>
          <NavLink to="/admin/verification">Verificación</NavLink>
          <NavLink to="/admin/moderation">Moderación</NavLink>
        </nav>
        {user?.roles.includes("ARTIST") && (
          <Link to="/dashboard" className="muted portal-link">
            Ir al panel artista
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
