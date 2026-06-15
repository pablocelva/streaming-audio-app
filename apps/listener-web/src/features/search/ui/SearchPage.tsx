import { useState } from "react";
import { searchCatalog } from "@/shared/api";
import type { SearchResults } from "@streaming/api-client";
import { SongCard } from "@/entities/song/ui/SongCard";

export function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const onSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim().length < 2) {
      setError("Escribe al menos 2 caracteres.");
      return;
    }
    setError(null);
    setIsSearching(true);
    try {
      const data = await searchCatalog(query.trim());
      setResults(data);
    } catch {
      setError("Error en la búsqueda.");
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <section>
      <h1>Buscar</h1>
      <form onSubmit={onSearch} className="search-form">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Canciones o artistas..."
        />
        <button type="submit" disabled={isSearching}>
          Buscar
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {results && (
        <>
          {results.artists.length > 0 && (
            <div className="search-section">
              <h2>Artistas</h2>
              <ul>
                {results.artists.map((artist) => (
                  <li key={artist.id}>{artist.stageName}</li>
                ))}
              </ul>
            </div>
          )}
          {results.songs.length > 0 ? (
            <div className="song-grid">
              {results.songs.map((song) => (
                <SongCard key={song.id} song={song} showFavorite />
              ))}
            </div>
          ) : (
            <p className="muted">Sin canciones para esta búsqueda.</p>
          )}
        </>
      )}
    </section>
  );
}
