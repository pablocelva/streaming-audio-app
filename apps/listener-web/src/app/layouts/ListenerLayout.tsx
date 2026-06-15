import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "@/features/auth/model/auth-context";
import { tierLabel } from "@/shared/lib/listener-tier";
import { PlayerBar } from "@/features/player/ui/PlayerBar";

export function ListenerLayout() {
  const { user, tier, isAuthenticated, logout } = useAuth();

  return (
    <div className="listener-layout">
      <header className="listener-header">
        <Link to="/" className="brand">
          Streaming Ético
        </Link>
        <nav>
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/search">Buscar</NavLink>
          <NavLink to="/library">Biblioteca</NavLink>
          <NavLink to="/premium">Premium</NavLink>
        </nav>
        <div className="header-actions">
          <span className="tier-badge">{tierLabel(tier)}</span>
          {isAuthenticated ? (
            <>
              <span className="muted user-email">{user?.email}</span>
              <button type="button" className="secondary" onClick={logout}>
                Salir
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Entrar</Link>
              <Link to="/register" className="btn-primary">
                Registro gratis
              </Link>
            </>
          )}
        </div>
      </header>
      <main className="listener-main">
        <Outlet />
      </main>
      <PlayerBar />
    </div>
  );
}
