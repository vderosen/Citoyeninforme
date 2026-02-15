import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import type { SurveyStatus } from "../../stores/survey";

interface PrimaryShortcutsProps {
  surveyStatus: SurveyStatus;
  onStartSurvey: () => void;
  onViewCandidates: () => void;
  onAskQuestion: () => void;
}

export function PrimaryShortcuts({
  surveyStatus,
  onStartSurvey,
  onViewCandidates,
  onAskQuestion,
}: PrimaryShortcutsProps) {
  const { t } = useTranslation("home");

  const surveyLabel =
    surveyStatus === "not_started"
      ? t("startSurvey")
      : surveyStatus === "questionnaire" || surveyStatus === "civic_context"
        ? t("resumeSurvey")
        : t("retakeSurvey");

  const shortcuts = [
    {
      label: surveyLabel,
      onPress: onStartSurvey,
      color: "bg-blue-600",
      textColor: "text-white",
      accessibilityHint: t("startSurveyHint"),
    },
    {
      label: t("exploreCandidates"),
      onPress: onViewCandidates,
      color: "bg-gray-100",
      textColor: "text-gray-900",
      accessibilityHint: t("exploreCandidatesHint"),
    },
    {
      label: t("askQuestion"),
      onPress: onAskQuestion,
      color: "bg-gray-100",
      textColor: "text-gray-900",
      accessibilityHint: t("askQuestionHint"),
    },
  ];

  return (
    <View className="px-4 gap-3">
      {shortcuts.map((shortcut) => (
        <Pressable
          key={shortcut.label}
          onPress={shortcut.onPress}
          className={`${shortcut.color} rounded-xl px-5 py-4`}
          style={{ minHeight: 56 }}
          accessibilityRole="button"
          accessibilityLabel={shortcut.label}
          accessibilityHint={shortcut.accessibilityHint}
        >
          <Text
            className={`${shortcut.textColor} text-base font-semibold text-center`}
          >
            {shortcut.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
