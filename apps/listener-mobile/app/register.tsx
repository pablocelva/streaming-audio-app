import { Link, router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { registerUser } from "@/shared/api";
import { useAuth } from "@/features/auth/model/auth-context";

export default function RegisterScreen() {
  const { setSession, refreshUser } = useAuth();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      const { user } = await registerUser({ fullName, email, password });
      setSession(user);
      await refreshUser();
      router.replace("/");
    } catch {
      setError("No se pudo crear la cuenta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <Text style={styles.sub}>Cuenta gratuita — escucha completa y favoritos</Text>
      <TextInput
        style={styles.input}
        value={fullName}
        onChangeText={setFullName}
        placeholder="Nombre"
        placeholderTextColor="#64748b"
      />
      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder="Email"
        placeholderTextColor="#64748b"
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        value={password}
        onChangeText={setPassword}
        placeholder="Contraseña (mín. 8)"
        placeholderTextColor="#64748b"
        secureTextEntry
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.btn} onPress={onSubmit} disabled={loading}>
        <Text style={styles.btnText}>{loading ? "..." : "Crear cuenta"}</Text>
      </Pressable>
      <Text style={styles.muted}>
        ¿Ya tienes cuenta? <Link href="/login">Iniciar sesión</Link>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0f172a", padding: 16 },
  sub: { color: "#94a3b8", marginBottom: 16 },
  input: {
    backgroundColor: "#1e293b",
    color: "#fff",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#334155",
  },
  btn: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  btnText: { color: "#fff", fontWeight: "600" },
  error: { color: "#fca5a5", marginBottom: 8 },
  muted: { color: "#94a3b8" },
});
