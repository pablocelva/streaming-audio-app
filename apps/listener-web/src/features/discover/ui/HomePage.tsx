import { useEffect, useState } from "react";
import { fetchFeatured } from "@/shared/api";
import type { FeaturedCatalog } from "@streaming/api-client";
import { SongCard } from "@/entities/song/ui/SongCard";
import { useAuth } from "@/features/auth/model/auth-context";
import { tierLabel } from "@/shared/lib/listener-tier";
import { Link } from "react-router-dom";

export function HomePage() {
  const { tier } = useAuth();
  const [catalog, setCatalog] = useState<FeaturedCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeatured()
      .then(setCatalog)
      .catch(() => setError("No se pudo cargar el catálogo."));
  }, []);

  return (
    <section>
      <h1>Descubre música</h1>
      <p className="muted">{tierLabel(tier)}</p>
      {tier === "guest" && (
        <p className="info-banner">
          Puedes escuchar <strong>30 segundos</strong> de cada canción sin cuenta.{" "}
          <Link to="/register">Regístrate gratis</Link> para escuchar completo.
        </p>
      )}
      {tier === "free" && (
        <p className="info-banner">
          Plan gratuito activo. <Link to="/premium">Premium</Link> (próximamente) = alta calidad.
        </p>
      )}
      {error && <p className="error">{error}</p>}
      {!catalog ? (
        <p>Cargando destacados...</p>
      ) : catalog.songs.length === 0 ? (
        <p className="muted">Aún no hay canciones publicadas.</p>
      ) : (
        <div className="song-grid">
          {catalog.songs.map((song) => (
            <SongCard key={song.id} song={song} showFavorite />
          ))}
        </div>
      )}
    </section>
  );
}
