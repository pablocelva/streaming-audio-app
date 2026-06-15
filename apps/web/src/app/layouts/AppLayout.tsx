import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/model/auth-context";

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Streaming Ético</h1>
        <p className="muted">{user?.fullName ?? user?.email}</p>
        <nav>
          <NavLink to="/dashboard">Estadísticas</NavLink>
          <NavLink to="/upload">Subir música</NavLink>
        </nav>
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
