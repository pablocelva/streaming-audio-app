import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { SongSummary, StreamUrlResponse } from "@streaming/api-client";
import { fetchStreamUrl, registerPlayback } from "@/shared/api";
import { useAuth } from "@/features/auth/model/auth-context";

type PlayerState = {
  currentSong: SongSummary | null;
  stream: StreamUrlResponse | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  previewEnded: boolean;
  error: string | null;
};

type PlayerContextValue = PlayerState & {
  playSong: (song: SongSummary) => Promise<void>;
  togglePlay: () => void;
  stop: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

function validListenThreshold(durationSeconds: number, listened: number): boolean {
  const minByPercent = Math.floor(durationSeconds * 0.8);
  return listened >= 30 || listened >= minByPercent;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const listenedRef = useRef(0);
  const reportedRef = useRef(false);

  const [currentSong, setCurrentSong] = useState<SongSummary | null>(null);
  const [stream, setStream] = useState<StreamUrlResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [previewEnded, setPreviewEnded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reportPlayback = useCallback(
    async (song: SongSummary, listenedSeconds: number) => {
      if (!isAuthenticated || reportedRef.current) return;
      if (!validListenThreshold(song.durationSeconds, listenedSeconds)) return;
      reportedRef.current = true;
      try {
        await registerPlayback(song.id, listenedSeconds);
      } catch {
        reportedRef.current = false;
      }
    },
    [isAuthenticated],
  );

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.src = "";
    }
    setIsPlaying(false);
    setCurrentTime(0);
    listenedRef.current = 0;
  }, []);

  const playSong = useCallback(
    async (song: SongSummary) => {
      setError(null);
      setPreviewEnded(false);
      setIsLoading(true);
      reportedRef.current = false;
      listenedRef.current = 0;

      try {
        const streamInfo = await fetchStreamUrl(song.id);
        const audio = audioRef.current ?? new Audio();
        audioRef.current = audio;

        audio.onloadedmetadata = () => setCurrentTime(0);
        audio.ontimeupdate = () => {
          const time = Math.floor(audio.currentTime);
          setCurrentTime(time);
          listenedRef.current = Math.max(listenedRef.current, time);

          if (
            streamInfo.maxPlaySeconds != null
            && audio.currentTime >= streamInfo.maxPlaySeconds
          ) {
            audio.pause();
            setIsPlaying(false);
            setPreviewEnded(true);
          }
        };
        audio.onended = () => {
          setIsPlaying(false);
          void reportPlayback(song, listenedRef.current);
        };
        audio.onpause = () => {
          if (audio.currentTime >= (audio.duration || 0) - 0.5) return;
          void reportPlayback(song, listenedRef.current);
        };

        audio.src = streamInfo.url;
        setCurrentSong(song);
        setStream(streamInfo);
        await audio.play();
        setIsPlaying(true);
      } catch {
        setError("No se pudo reproducir la canción.");
        stop();
      } finally {
        setIsLoading(false);
      }
    },
    [reportPlayback, stop],
  );

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentSong) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      void reportPlayback(currentSong, listenedRef.current);
    } else if (!previewEnded) {
      void audio.play();
      setIsPlaying(true);
    }
  }, [currentSong, isPlaying, previewEnded, reportPlayback]);

  useEffect(() => () => stop(), [stop]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      currentSong,
      stream,
      isPlaying,
      isLoading,
      currentTime,
      previewEnded,
      error,
      playSong,
      togglePlay,
      stop,
    }),
    [
      currentSong,
      stream,
      isPlaying,
      isLoading,
      currentTime,
      previewEnded,
      error,
      playSong,
      togglePlay,
      stop,
    ],
  );

  return <PlayerContext.Provider value={value}>{children}</PlayerContext.Provider>;
}

export function usePlayer() {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer debe usarse dentro de PlayerProvider");
  return ctx;
}
