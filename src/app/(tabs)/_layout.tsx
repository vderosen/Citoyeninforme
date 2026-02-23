import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

export default function TabLayout() {
  const { t } = useTranslation("common");

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#1E2A44" },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontFamily: "SpaceGrotesk_600SemiBold",
          fontSize: 18,
          color: "#FFFFFF",
        },
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerRight: undefined,
        lazy: true,
        tabBarActiveTintColor: "#1E2A44",
        tabBarInactiveTintColor: "#718096",
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter_500Medium",
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#F4F5F7",
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t("headers.lucide"),
          headerShown: false,
          tabBarLabel: "Accueil",
          tabBarAccessibilityLabel: "Accueil",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="cards"
        options={{
          title: "Cartes Swipe",
          tabBarLabel: "Cartes Swipe",
          tabBarAccessibilityLabel: "Cartes Swipe",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "albums" : "albums-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          title: "Résultats",
          tabBarLabel: "Résultats",
          tabBarAccessibilityLabel: "Résultats",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "trophy" : "trophy-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="assistant"
        options={{
          title: t("headers.assistant"),
          tabBarAccessibilityLabel: "Assistant",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={size} color={color} />
          ),
        }}
      />
      {/* Hide candidates tab — content moved to home page carousel */}
      <Tabs.Screen
        name="candidates"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
