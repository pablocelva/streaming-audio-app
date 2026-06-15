import { Link } from "react-router-dom";
import { usePlayer } from "@/features/player/model/player-context";
import { useAuth } from "@/features/auth/model/auth-context";

export function PlayerBar() {
  const { tier } = useAuth();
  const {
    currentSong,
    stream,
    isPlaying,
    isLoading,
    currentTime,
    previewEnded,
    error,
    togglePlay,
  } = usePlayer();

  if (!currentSong && !error) {
    return (
      <footer className="listener-player-bar muted">
        Selecciona una canción para escuchar
      </footer>
    );
  }

  const maxTime = stream?.maxPlaySeconds ?? currentSong?.durationSeconds ?? 0;
  const progress = maxTime > 0 ? Math.min((currentTime / maxTime) * 100, 100) : 0;

  return (
    <footer className="listener-player-bar">
      {error && <p className="error">{error}</p>}
      {currentSong && (
        <div className="player-content">
          <div className="player-track">
            <strong>{currentSong.title}</strong>
            <span className="muted">
              {currentSong.artistName} · {currentSong.albumTitle}
            </span>
            {stream && (
              <span className="tier-pill">
                {stream.accessTier === "guest" && "Vista previa"}
                {stream.accessTier === "free" && "Calidad estándar"}
                {stream.accessTier === "premium" && "Alta calidad"}
              </span>
            )}
          </div>
          <div className="player-controls">
            <button type="button" onClick={togglePlay} disabled={isLoading || previewEnded}>
              {isLoading ? "..." : isPlaying ? "Pausa" : "Play"}
            </button>
            <div className="progress">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="muted time">
              {formatTime(currentTime)} / {formatTime(maxTime)}
            </span>
          </div>
          {previewEnded && tier === "guest" && (
            <p className="preview-cta">
              Vista previa terminada.{" "}
              <Link to="/register">Crea una cuenta gratis</Link> para escuchar completo.
            </p>
          )}
        </div>
      )}
    </footer>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
