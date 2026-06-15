import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAuth } from "@/features/auth/model/auth-context";
import { usePlayer } from "@/features/player/model/player-context";

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
      <View style={styles.bar}>
        <Text style={styles.muted}>Selecciona una canción</Text>
      </View>
    );
  }

  const maxTime = stream?.maxPlaySeconds ?? currentSong?.durationSeconds ?? 0;

  return (
    <View style={styles.bar}>
      {error && <Text style={styles.error}>{error}</Text>}
      {currentSong && (
        <>
          <Text style={styles.title}>{currentSong.title}</Text>
          <Text style={styles.muted}>
            {currentSong.artistName}
            {stream ? ` · ${stream.quality}` : ""}
          </Text>
          <View style={styles.controls}>
            <Pressable
              style={styles.playBtn}
              onPress={togglePlay}
              disabled={isLoading || previewEnded}
            >
              <Text style={styles.playText}>
                {isLoading ? "..." : isPlaying ? "Pausa" : "Play"}
              </Text>
            </Pressable>
            <Text style={styles.muted}>
              {formatTime(currentTime)} / {formatTime(maxTime)}
            </Text>
          </View>
          {previewEnded && tier === "guest" && (
            <Text style={styles.cta}>
              Vista previa terminada.{" "}
              <Link href="/register" style={styles.link}>
                Regístrate gratis
              </Link>
            </Text>
          )}
        </>
      )}
    </View>
  );
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  bar: {
    backgroundColor: "#1f2937",
    borderTopWidth: 1,
    borderTopColor: "#374151",
    padding: 12,
  },
  title: { color: "#f8fafc", fontWeight: "700" },
  muted: { color: "#94a3b8", fontSize: 13, marginTop: 2 },
  error: { color: "#fca5a5" },
  controls: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 8,
  },
  playBtn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  playText: { color: "#fff", fontWeight: "600" },
  cta: { color: "#cbd5e1", marginTop: 8, fontSize: 13 },
  link: { color: "#93c5fd" },
});
