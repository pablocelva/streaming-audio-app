import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { searchCatalog } from "@/shared/api";
import type { SearchResults } from "@streaming/api-client";
import { SongRow } from "@/entities/song/ui/SongRow";

export default function SearchScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSearch = async () => {
    if (query.trim().length < 2) {
      setError("Escribe al menos 2 caracteres.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      setResults(await searchCatalog(query.trim()));
    } catch {
      setError("Error en la búsqueda.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder="Canciones..."
          placeholderTextColor="#64748b"
        />
        <Pressable style={styles.btn} onPress={onSearch} disabled={loading}>
          <Text style={styles.btnText}>{loading ? "..." : "Buscar"}</Text>
        </Pressable>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {results?.artists.length ? (
        <View style={styles.section}>
          <Text style={styles.h2}>Artistas</Text>
          {results.artists.map((a) => (
            <Text key={a.id} style={styles.muted}>
              {a.stageName}
            </Text>
          ))}
        </View>
      ) : null}
      {results?.songs.map((song) => (
        <SongRow key={song.id} song={song} showFavorite />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16 },
  form: { flexDirection: "row", gap: 8, marginBottom: 12 },
  input: {
    flex: 1,
    backgroundColor: "#1e293b",
    color: "#fff",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  btn: { backgroundColor: "#2563eb", paddingHorizontal: 16, justifyContent: "center", borderRadius: 8 },
  btnText: { color: "#fff", fontWeight: "600" },
  error: { color: "#fca5a5" },
  section: { marginBottom: 12 },
  h2: { color: "#f8fafc", fontWeight: "600", marginBottom: 6 },
  muted: { color: "#94a3b8", marginBottom: 4 },
});
