import { Audio, type AVPlaybackStatus } from "expo-av";
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

type PlayerContextValue = {
  currentSong: SongSummary | null;
  stream: StreamUrlResponse | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  previewEnded: boolean;
  error: string | null;
  playSong: (song: SongSummary) => Promise<void>;
  togglePlay: () => Promise<void>;
  stop: () => Promise<void>;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

function validListenThreshold(durationSeconds: number, listened: number): boolean {
  const minByPercent = Math.floor(durationSeconds * 0.8);
  return listened >= 30 || listened >= minByPercent;
}

export function PlayerProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const soundRef = useRef<Audio.Sound | null>(null);
  const listenedRef = useRef(0);
  const reportedRef = useRef(false);
  const maxPlayRef = useRef<number | null>(null);

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

  const unloadSound = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.unloadAsync();
      soundRef.current = null;
    }
  }, []);

  const stop = useCallback(async () => {
    if (soundRef.current) {
      await soundRef.current.stopAsync();
      await unloadSound();
    }
    setIsPlaying(false);
    setCurrentTime(0);
    listenedRef.current = 0;
  }, [unloadSound]);

  const onPlaybackStatus = useCallback(
    (song: SongSummary) => (status: AVPlaybackStatus) => {
      if (!status.isLoaded) return;

      const seconds = Math.floor(status.positionMillis / 1000);
      setCurrentTime(seconds);
      listenedRef.current = Math.max(listenedRef.current, seconds);

      if (
        maxPlayRef.current != null
        && seconds >= maxPlayRef.current
        && status.isPlaying
      ) {
        void soundRef.current?.pauseAsync();
        setIsPlaying(false);
        setPreviewEnded(true);
      }

      if (status.didJustFinish) {
        setIsPlaying(false);
        void reportPlayback(song, listenedRef.current);
      }
    },
    [reportPlayback],
  );

  const playSong = useCallback(
    async (song: SongSummary) => {
      setError(null);
      setPreviewEnded(false);
      setIsLoading(true);
      reportedRef.current = false;
      listenedRef.current = 0;

      try {
        await unloadSound();
        const streamInfo = await fetchStreamUrl(song.id);
        maxPlayRef.current = streamInfo.maxPlaySeconds ?? null;

        await Audio.setAudioModeAsync({
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });

        const { sound } = await Audio.Sound.createAsync(
          { uri: streamInfo.url },
          { shouldPlay: true },
          onPlaybackStatus(song),
        );

        soundRef.current = sound;
        setCurrentSong(song);
        setStream(streamInfo);
        setIsPlaying(true);
      } catch {
        setError("No se pudo reproducir la canción.");
        await stop();
      } finally {
        setIsLoading(false);
      }
    },
    [onPlaybackStatus, stop, unloadSound],
  );

  const togglePlay = useCallback(async () => {
    const sound = soundRef.current;
    if (!sound || !currentSong) return;

    const status = await sound.getStatusAsync();
    if (!status.isLoaded) return;

    if (status.isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
      void reportPlayback(currentSong, listenedRef.current);
    } else if (!previewEnded) {
      await sound.playAsync();
      setIsPlaying(true);
    }
  }, [currentSong, previewEnded, reportPlayback]);

  useEffect(() => () => {
    void unloadSound();
  }, [unloadSound]);

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
