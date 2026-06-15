import { Pressable, StyleSheet, Text, View } from "react-native";
import type { SongSummary } from "@streaming/api-client";
import { useAuth } from "@/features/auth/model/auth-context";
import { usePlayer } from "@/features/player/model/player-context";
import { addFavorite } from "@/shared/api";
import { useState } from "react";

type Props = {
  song: SongSummary;
  showFavorite?: boolean;
};

export function SongRow({ song, showFavorite = false }: Props) {
  const { isAuthenticated } = useAuth();
  const { playSong, currentSong, isPlaying, isLoading } = usePlayer();
  const [favDone, setFavDone] = useState(false);
  const isCurrent = currentSong?.id === song.id;

  return (
    <View style={styles.card}>
      <View style={styles.info}>
        <Text style={styles.title}>{song.title}</Text>
        <Text style={styles.meta}>
          {song.artistName} · {song.albumTitle}
        </Text>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={styles.btn}
          onPress={() => playSong(song)}
          disabled={isLoading && isCurrent}
        >
          <Text style={styles.btnText}>
            {isCurrent && isPlaying ? "Sonando" : "Escuchar"}
          </Text>
        </Pressable>
        {showFavorite && isAuthenticated && (
          <Pressable
            style={[styles.btn, styles.btnSecondary]}
            onPress={async () => {
              try {
                await addFavorite(song.id);
                setFavDone(true);
              } catch {
                // ignore
              }
            }}
            disabled={favDone}
          >
            <Text style={styles.btnText}>{favDone ? "✓" : "♥"}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#1e293b",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  info: { marginBottom: 10 },
  title: { color: "#f8fafc", fontSize: 16, fontWeight: "600" },
  meta: { color: "#94a3b8", marginTop: 4, fontSize: 13 },
  actions: { flexDirection: "row", gap: 8 },
  btn: {
    backgroundColor: "#2563eb",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  btnSecondary: { backgroundColor: "#374151" },
  btnText: { color: "#fff", fontWeight: "600" },
});
