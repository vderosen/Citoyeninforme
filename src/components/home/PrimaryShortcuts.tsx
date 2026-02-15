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

  const primaryShortcut = shortcuts[0];
  const secondaryShortcuts = shortcuts.slice(1);

  return (
    <View className="px-4 gap-3">
      <Pressable
        onPress={primaryShortcut.onPress}
        className={`${primaryShortcut.color} rounded-xl px-5 py-5`}
        style={{ minHeight: 64 }}
        accessibilityRole="button"
        accessibilityLabel={primaryShortcut.label}
        accessibilityHint={primaryShortcut.accessibilityHint}
      >
        <Text
          className={`${primaryShortcut.textColor} text-lg font-semibold text-center`}
        >
          {primaryShortcut.label}
        </Text>
      </Pressable>
      <View className="flex-row gap-3">
        {secondaryShortcuts.map((shortcut) => (
          <Pressable
            key={shortcut.label}
            onPress={shortcut.onPress}
            className={`${shortcut.color} rounded-xl px-4 py-3 flex-1`}
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel={shortcut.label}
            accessibilityHint={shortcut.accessibilityHint}
          >
            <Text
              className={`${shortcut.textColor} text-sm font-semibold text-center`}
            >
              {shortcut.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}
