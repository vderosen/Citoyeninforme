import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export const unstable_settings = {
  initialRouteName: "cards",
};

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
        tabBarActiveTintColor: "#FFFFFF",
        tabBarInactiveTintColor: "rgba(255, 255, 255, 0.6)",
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: "Inter_500Medium",
          marginTop: 4,
        },
        tabBarStyle: {
          backgroundColor: "#DC2626", // Red background
          borderTopWidth: 0,
          height: 84,         // Reduced height
          paddingTop: 10,     // Push icons lower
          paddingBottom: 28,  // Control bottom spacing (home indicator area)
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
          headerShown: false,
          title: "Cartes Swipe",
          tabBarLabel: "Cartes Swipe",
          tabBarAccessibilityLabel: "Cartes Swipe",
          tabBarIcon: ({ focused, color, size }) => (
            <MaterialCommunityIcons name={focused ? "cards" : "cards-outline"} size={size + 2} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="matches"
        options={{
          headerShown: false,
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
            <Ionicons name={focused ? "chatbubbles" : "chatbubbles-outline"} size={size + 2} color={color} />
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
