import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "react-native-reanimated";

export default function SurveyLayout() {
  const { t } = useTranslation("common");
  const reduceMotion = useReducedMotion();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#1B2A4A" },
        headerTintColor: "#FAFAF8",
        headerTitleStyle: {
          fontFamily: "SpaceGrotesk_600SemiBold",
          fontSize: 17,
          color: "#FAFAF8",
        },
        headerShadowVisible: false,
        gestureEnabled: false,
        animation: reduceMotion ? "none" : "slide_from_bottom",
      }}
    >
      <Stack.Screen name="intro" options={{ title: t("headers.survey") }} />
      <Stack.Screen name="questions" options={{ title: t("headers.surveyQuestions") }} />
      <Stack.Screen name="results" options={{ title: t("headers.surveyResults"), headerBackVisible: false }} />
    </Stack>
  );
}
