import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchFavorites, removeFavorite } from "@/shared/api";
import type { SongSummary } from "@streaming/api-client";
import { useAuth } from "@/features/auth/model/auth-context";
import { SongCard } from "@/entities/song/ui/SongCard";

export function LibraryPage() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<SongSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!isAuthenticated) return;
    fetchFavorites()
      .then(setFavorites)
      .catch(() => setError("No se pudo cargar favoritos."));
  }, [isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  const onRemove = async (songId: string) => {
    setBusyId(songId);
    try {
      await removeFavorite(songId);
      setFavorites((prev) => prev.filter((s) => s.id !== songId));
    } catch {
      setError("No se pudo quitar el favorito.");
    } finally {
      setBusyId(null);
    }
  };

  if (!isAuthenticated) {
    return (
      <section>
        <h1>Tu biblioteca</h1>
        <p className="info-banner">
          <Link to="/login">Inicia sesión</Link> o{" "}
          <Link to="/register">regístrate gratis</Link> para guardar favoritos.
        </p>
      </section>
    );
  }

  return (
    <section>
      <h1>Tu biblioteca</h1>
      <p className="muted">Favoritos</p>
      {error && <p className="error">{error}</p>}
      {favorites.length === 0 ? (
        <p className="muted">Aún no tienes favoritos.</p>
      ) : (
        <div className="song-grid">
          {favorites.map((song) => (
            <div key={song.id} className="library-item">
              <SongCard song={song} />
              <button
                type="button"
                className="secondary"
                disabled={busyId === song.id}
                onClick={() => onRemove(song.id)}
              >
                Quitar
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
