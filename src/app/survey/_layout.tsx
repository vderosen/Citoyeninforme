import { Pressable } from "react-native";
import { Stack, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "react-native-reanimated";

export default function SurveyLayout() {
  const { t } = useTranslation("common");
  const router = useRouter();
  const reduceMotion = useReducedMotion();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#1B2A4A" },
        headerTitleStyle: {
          fontFamily: "SpaceGrotesk_600SemiBold",
          fontSize: 17,
          color: "#FAFAF8",
        },
        headerShadowVisible: false,
        headerBackVisible: false,
        headerLeft: () => (
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel={t("back")}
            className="ml-4 p-2"
          >
            <Ionicons name="chevron-back" size={22} color="#FAFAF8" />
          </Pressable>
        ),
        gestureEnabled: false,
        animation: reduceMotion ? "none" : "slide_from_bottom",
      }}
    >
      <Stack.Screen name="intro" options={{ title: t("headers.survey") }} />
      <Stack.Screen name="questions" options={{ title: t("headers.surveyQuestions") }} />
      <Stack.Screen name="results" options={{ title: t("headers.surveyResults"), headerLeft: () => null }} />
    </Stack>
  );
}
