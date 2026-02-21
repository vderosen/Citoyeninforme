import { Tabs } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { CandidateFeedbackHeaderAction } from "../../components/candidates/CandidateFeedbackHeaderAction";

export default function TabLayout() {
  const { t } = useTranslation("common");

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#1B2A4A" },
        headerTintColor: "#FAFAF8",
        headerTitleStyle: {
          fontFamily: "SpaceGrotesk_600SemiBold",
          fontSize: 17,
          color: "#FAFAF8",
        },
        headerTitleAlign: "center",
        headerShadowVisible: false,
        headerRight: undefined,
        lazy: true,
        tabBarActiveTintColor: "#1B2A4A",
        tabBarInactiveTintColor: "#6B7280",
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: "Inter_500Medium",
        },
        tabBarStyle: {
          backgroundColor: "#FAFAF8",
          borderTopWidth: 1,
          borderTopColor: "#1B2A4A",
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
        name="assistant"
        options={{
          title: t("headers.assistant"),
          tabBarAccessibilityLabel: "Assistant",
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "chatbubble" : "chatbubble-outline"} size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="candidates"
        options={{
          title: t("headers.candidats"),
          tabBarAccessibilityLabel: "Candidats",
          headerRight: () => <CandidateFeedbackHeaderAction />,
          tabBarIcon: ({ focused, color, size }) => (
            <Ionicons name={focused ? "people" : "people-outline"} size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
