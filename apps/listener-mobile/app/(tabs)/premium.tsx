import { ScrollView, StyleSheet, Text } from "react-native";
import { useAuth } from "@/features/auth/model/auth-context";
import { tierLabel } from "@/shared/lib/listener-tier";

export default function PremiumScreen() {
  const { tier } = useAuth();

  return (
    <ScrollView style={styles.page} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>Premium</Text>
      <Text style={styles.muted}>Plan actual: {tierLabel(tier)}</Text>
      <Text style={styles.body}>
        La suscripción de pago llega en Fase 4 (Stripe). En desarrollo, un admin puede
        asignar plan premium en la base de datos.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#0f172a" },
  content: { padding: 16 },
  h1: { color: "#f8fafc", fontSize: 22, fontWeight: "700" },
  muted: { color: "#94a3b8", marginTop: 8 },
  body: { color: "#cbd5e1", marginTop: 16, lineHeight: 22 },
});
