import { useEffect, useState } from "react";
import { fetchArtistStats } from "@/shared/api";
import type { ArtistStats } from "@streaming/api-client";

export function DashboardPage() {
  const [stats, setStats] = useState<ArtistStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArtistStats()
      .then(setStats)
      .catch(() => setError("No se pudieron cargar las estadísticas."))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return <p>Cargando estadísticas...</p>;
  }

  if (error || !stats) {
    return <p className="error">{error ?? "Sin datos"}</p>;
  }

  return (
    <section className="panel">
      <h2>Estadísticas del artista</h2>
      <div className="stats-grid">
        <article className="stat-card">
          <h3>Reproducciones totales</h3>
          <p className="stat-value">{stats.totalPlays}</p>
        </article>
        <article className="stat-card">
          <h3>Premium</h3>
          <p className="stat-value">{stats.premiumPlays}</p>
        </article>
        <article className="stat-card">
          <h3>Gratuitas</h3>
          <p className="stat-value">{stats.freePlays}</p>
        </article>
        <article className="stat-card">
          <h3>Peso acumulado</h3>
          <p className="stat-value">{stats.totalWeight.toFixed(2)}</p>
          <p className="muted">Premium × 1.0 + Gratis × 0.25</p>
        </article>
      </div>

      <h3>Top canciones</h3>
      {stats.topSongs.length === 0 ? (
        <p className="muted">Aún no hay reproducciones registradas.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Canción</th>
              <th>Plays</th>
              <th>Peso</th>
            </tr>
          </thead>
          <tbody>
            {stats.topSongs.map((song) => (
              <tr key={song.songId}>
                <td>{song.title}</td>
                <td>{song.plays}</td>
                <td>{song.weight.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
