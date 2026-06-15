import { useCallback, useEffect, useState } from "react";
import { fetchPendingArtists, verifyArtist } from "@/shared/api/admin";
import type { ArtistProfile } from "@streaming/api-client";

export function VerificationPage() {
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    fetchPendingArtists()
      .then(setArtists)
      .catch(() => setError("No se pudo cargar la cola de verificación."));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onVerify = async (artistId: string) => {
    setBusyId(artistId);
    setError(null);
    try {
      await verifyArtist(artistId);
      setArtists((prev) => prev.filter((a) => a.id !== artistId));
    } catch {
      setError("No se pudo verificar el artista.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="panel">
      <h2>Verificación de artistas</h2>
      {error && <p className="error">{error}</p>}
      {artists.length === 0 ? (
        <p className="muted">No hay artistas pendientes de verificación.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th>Nombre artístico</th>
              <th>Declaración firmada</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {artists.map((artist) => (
              <tr key={artist.id}>
                <td>{artist.stageName}</td>
                <td>{artist.declarationSigned ? "Sí" : "No"}</td>
                <td>
                  <button
                    type="button"
                    disabled={busyId === artist.id}
                    onClick={() => onVerify(artist.id)}
                  >
                    Verificar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
