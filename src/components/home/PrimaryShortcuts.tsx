import { Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type { SurveyStatus } from "../../stores/survey";

interface PrimaryShortcutsProps {
  surveyStatus: SurveyStatus;
  onStartSurvey: () => void;
}

export function PrimaryShortcuts({
  surveyStatus,
  onStartSurvey,
}: PrimaryShortcutsProps) {
  const { t } = useTranslation("home");

  if (surveyStatus === "completed") {
    return null;
  }

  const surveyLabel =
    surveyStatus === "not_started"
      ? t("startSurvey")
      : t("resumeSurvey");

  return (
    <Pressable
      onPress={onStartSurvey}
      className="mx-4 bg-accent-coral rounded-xl px-5 py-4 flex-row items-center gap-3"
      accessibilityRole="button"
      accessibilityLabel={surveyLabel}
      accessibilityHint={t("startSurveyHint")}
    >
      <Ionicons name="checkbox-outline" size={20} color="#FAFAF8" />
      <Text className="font-display-semibold text-base text-text-inverse flex-1">
        {surveyLabel}
      </Text>
    </Pressable>
  );
}
