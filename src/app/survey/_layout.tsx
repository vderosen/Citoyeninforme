import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";

export default function SurveyLayout() {
  const { t } = useTranslation("common");

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#FFFFFF" },
        headerTintColor: "#2563EB",
        headerTitleStyle: { fontWeight: "600", fontSize: 17, color: "#111827" },
        headerShadowVisible: false,
        gestureEnabled: false,
      }}
    >
      <Stack.Screen name="intro" options={{ title: t("headers.survey") }} />
      <Stack.Screen name="questions" options={{ title: t("headers.surveyQuestions") }} />
      <Stack.Screen name="results" options={{ title: t("headers.surveyResults"), headerBackVisible: false }} />
    </Stack>
  );
}
