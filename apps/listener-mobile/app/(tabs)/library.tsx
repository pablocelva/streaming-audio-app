import { Link } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { fetchFavorites, removeFavorite } from "@/shared/api";
import type { SongSummary } from "@streaming/api-client";
import { useAuth } from "@/features/auth/model/auth-context";
import { SongRow } from "@/entities/song/ui/SongRow";

export default function LibraryScreen() {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<SongSummary[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!isAuthenticated) return;
    fetchFavorites()
      .then(setFavorites)
      .catch(() => setError("No se pudieron cargar favoritos."));
  }, [isAuthenticated]);

  useEffect(() => {
    load();
  }, [load]);

  if (!isAuthenticated) {
    return (
      <View style={styles.page}>
        <Text style={styles.h1}>Tu biblioteca</Text>
        <Text style={styles.banner}>
          <Link href="/login">Inicia sesión</Link> o <Link href="/register">regístrate</Link> para favoritos.
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Favoritos</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      {favorites.length === 0 ? (
        <Text style={styles.muted}>Sin favoritos aún.</Text>
      ) : (
        favorites.map((song) => (
          <View key={song.id}>
            <SongRow song={song} />
            <Pressable
              style={styles.removeBtn}
              onPress={async () => {
                await removeFavorite(song.id);
                setFavorites((prev) => prev.filter((s) => s.id !== song.id));
              }}
            >
              <Text style={styles.removeText}>Quitar de favoritos</Text>
            </Pressable>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0f172a", padding: 16 },
  content: { paddingBottom: 24 },
  h1: { color: "#f8fafc", fontSize: 22, fontWeight: "700", marginBottom: 12 },
  banner: { color: "#cbd5e1", lineHeight: 22 },
  muted: { color: "#94a3b8" },
  error: { color: "#fca5a5" },
  removeBtn: { marginBottom: 12, marginTop: -4 },
  removeText: { color: "#93c5fd", fontSize: 13 },
});
