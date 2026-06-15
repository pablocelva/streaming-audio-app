import { Link, router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { fetchFeatured } from "@/shared/api";
import type { FeaturedCatalog } from "@streaming/api-client";
import { SongRow } from "@/entities/song/ui/SongRow";
import { useAuth } from "@/features/auth/model/auth-context";
import { tierLabel } from "@/shared/lib/listener-tier";

export default function HomeScreen() {
  const { tier, isAuthenticated, logout } = useAuth();
  const [catalog, setCatalog] = useState<FeaturedCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFeatured()
      .then(setCatalog)
      .catch(() => setError("No se pudo cargar el catálogo."));
  }, []);

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Descubre música</Text>
      <View style={styles.authRow}>
        <Text style={styles.muted}>{tierLabel(tier)}</Text>
        {isAuthenticated ? (
          <Pressable onPress={async () => { await logout(); router.replace("/"); }}>
            <Text style={styles.link}>Salir</Text>
          </Pressable>
        ) : (
          <View style={styles.authLinks}>
            <Link href="/login" style={styles.link}>Entrar</Link>
            <Text style={styles.muted}> · </Text>
            <Link href="/register" style={styles.link}>Registro</Link>
          </View>
        )}
      </View>
      {!isAuthenticated && (
        <Text style={styles.banner}>
          Sin cuenta: preview 30s. <Link href="/register">Regístrate</Link> para escuchar completo.
        </Text>
      )}
      {error && <Text style={styles.error}>{error}</Text>}
      {!catalog ? (
        <Text style={styles.muted}>Cargando...</Text>
      ) : catalog.songs.length === 0 ? (
        <Text style={styles.muted}>Aún no hay canciones.</Text>
      ) : (
        catalog.songs.map((song) => <SongRow key={song.id} song={song} showFavorite />)
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16, paddingBottom: 32 },
  h1: { color: "#f8fafc", fontSize: 24, fontWeight: "700" },
  authRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  authLinks: { flexDirection: "row", alignItems: "center" },
  link: { color: "#93c5fd" },
  muted: { color: "#94a3b8", marginTop: 6, marginBottom: 12 },
  banner: { color: "#cbd5e1", backgroundColor: "#1e293b", padding: 12, borderRadius: 8, marginBottom: 12 },
  error: { color: "#fca5a5" },
});
