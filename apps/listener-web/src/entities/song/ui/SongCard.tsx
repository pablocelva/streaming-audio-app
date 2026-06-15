import type { SongSummary } from "@streaming/api-client";
import { usePlayer } from "@/features/player/model/player-context";
import { useAuth } from "@/features/auth/model/auth-context";
import { addFavorite } from "@/shared/api";
import { useState } from "react";

type Props = {
  song: SongSummary;
  showFavorite?: boolean;
};

export function SongCard({ song, showFavorite = false }: Props) {
  const { isAuthenticated } = useAuth();
  const { playSong, currentSong, isPlaying, isLoading } = usePlayer();
  const [favBusy, setFavBusy] = useState(false);
  const [favDone, setFavDone] = useState(false);
  const isCurrent = currentSong?.id === song.id;

  const onFavorite = async () => {
    setFavBusy(true);
    try {
      await addFavorite(song.id);
      setFavDone(true);
    } catch {
      // ignore duplicate or auth errors
    } finally {
      setFavBusy(false);
    }
  };

  return (
    <article className="song-card">
      <div>
        <h3>{song.title}</h3>
        <p className="muted">
          {song.artistName} · {song.albumTitle}
        </p>
      </div>
      <div className="song-card-actions">
        <button
          type="button"
          onClick={() => playSong(song)}
          disabled={isLoading && isCurrent}
        >
          {isCurrent && isPlaying ? "Sonando" : "Escuchar"}
        </button>
        {showFavorite && isAuthenticated && (
          <button
            type="button"
            className="secondary"
            disabled={favBusy || favDone}
            onClick={onFavorite}
          >
            {favDone ? "Guardado" : "Favorito"}
          </button>
        )}
      </div>
    </article>
  );
}
