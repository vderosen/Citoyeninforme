import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Accueil",
          tabBarAccessibilityLabel: "Accueil",
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: "Assistant",
          tabBarAccessibilityLabel: "Assistant",
        }}
      />
      <Tabs.Screen
        name="candidates"
        options={{
          title: "Candidats",
          tabBarAccessibilityLabel: "Candidats",
        }}
      />
    </Tabs>
  );
}
