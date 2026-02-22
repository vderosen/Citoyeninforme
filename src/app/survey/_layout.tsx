import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "react-native-reanimated";
import { StackHeader } from "../../components/shared/StackHeader";

export default function SurveyLayout() {
  const { t } = useTranslation("common");
  const reduceMotion = useReducedMotion();

  return (
    <Stack
      screenOptions={{
        header: (props) => <StackHeader {...props} />,
        gestureEnabled: false,
        animation: reduceMotion ? "none" : "slide_from_bottom",
      }}
    >
      <Stack.Screen name="intro" options={{ title: t("headers.survey") }} />
    </Stack>
  );
}
