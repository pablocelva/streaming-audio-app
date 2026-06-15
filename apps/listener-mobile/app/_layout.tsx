import { Stack } from "@/shared/ui/router";
import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "@/features/auth/model/auth-context";
import { PlayerProvider } from "@/features/player/model/player-context";

export default function RootLayout() {
  return (
    <AuthProvider>
      <PlayerProvider>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerStyle: { backgroundColor: "#111827" }, headerTintColor: "#fff" }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="login" options={{ title: "Iniciar sesión" }} />
          <Stack.Screen name="register" options={{ title: "Registro gratis" }} />
        </Stack>
      </PlayerProvider>
    </AuthProvider>
  );
}
