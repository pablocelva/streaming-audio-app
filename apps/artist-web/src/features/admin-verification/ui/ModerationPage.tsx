import { useCallback, useEffect, useState } from "react";
import {
  fetchAdminArtists,
  fetchAdminSongs,
  setArtistActive,
  setSongActive,
} from "@/shared/api/admin";
import type { AdminSong, ArtistProfile } from "@streaming/api-client";

export function ModerationPage() {
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [songs, setSongs] = useState<AdminSong[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(() => {
    Promise.all([fetchAdminArtists(), fetchAdminSongs()])
      .then(([artistList, songList]) => {
        setArtists(artistList);
        setSongs(songList);
      })
      .catch(() => setError("No se pudo cargar datos de moderación."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleArtist = async (artist: ArtistProfile) => {
    const key = `artist-${artist.id}`;
    setBusyKey(key);
    setError(null);
    try {
      const updated = await setArtistActive(artist.id, !artist.active);
      setArtists((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    } catch {
      setError("No se pudo actualizar el estado del artista.");
    } finally {
      setBusyKey(null);
    }
  };

  const toggleSong = async (song: AdminSong) => {
    const key = `song-${song.id}`;
    setBusyKey(key);
    setError(null);
    try {
      const updated = await setSongActive(song.id, !song.active);
      setSongs((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    } catch {
      setError("No se pudo actualizar el estado de la canción.");
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <section className="panel stack">
      <h2>Moderación</h2>
      {error && <p className="error">{error}</p>}

      <div>
        <h3>Artistas</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Verificado</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((artist) => (
              <tr key={artist.id}>
                <td>{artist.stageName}</td>
                <td>{artist.verified ? "Sí" : "No"}</td>
                <td>{artist.active ? "Activo" : "Suspendido"}</td>
                <td>
                  <button
                    type="button"
                    disabled={busyKey === `artist-${artist.id}`}
                    onClick={() => toggleArtist(artist)}
                  >
                    {artist.active ? "Suspender" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h3>Canciones</h3>
        <table className="data-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Artista</th>
              <th>Álbum</th>
              <th>Estado</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {songs.map((song) => (
              <tr key={song.id}>
                <td>{song.title}</td>
                <td>{song.artistName}</td>
                <td>{song.albumTitle}</td>
                <td>{song.active ? "Activa" : "Suspendida"}</td>
                <td>
                  <button
                    type="button"
                    disabled={busyKey === `song-${song.id}`}
                    onClick={() => toggleSong(song)}
                  >
                    {song.active ? "Suspender" : "Activar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
