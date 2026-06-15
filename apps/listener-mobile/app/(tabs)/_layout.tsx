import { Tabs } from "@/shared/ui/router";
import { View, StyleSheet } from "react-native";
import { PlayerBar } from "@/features/player/ui/PlayerBar";

export default function TabsLayout() {
  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: "#111827" },
          headerTintColor: "#f8fafc",
          tabBarStyle: { backgroundColor: "#111827", borderTopColor: "#1f2937" },
          tabBarActiveTintColor: "#60a5fa",
          tabBarInactiveTintColor: "#94a3b8",
        }}
      >
        <Tabs.Screen name="index" options={{ title: "Inicio" }} />
        <Tabs.Screen name="search" options={{ title: "Buscar" }} />
        <Tabs.Screen name="library" options={{ title: "Biblioteca" }} />
        <Tabs.Screen name="premium" options={{ title: "Premium" }} />
      </Tabs>
      <PlayerBar />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0f172a" },
});
