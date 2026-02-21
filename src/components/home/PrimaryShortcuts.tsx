import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type { SurveyStatus } from "../../stores/survey";

interface PrimaryShortcutsProps {
  surveyStatus: SurveyStatus;
  onStartSurvey: () => void;
  answeredCount?: number;
  totalQuestions?: number;
}

export function PrimaryShortcuts({
  surveyStatus,
  onStartSurvey,
  answeredCount = 0,
  totalQuestions = 0,
}: PrimaryShortcutsProps) {
  const { t } = useTranslation("home");

  if (surveyStatus === "completed") {
    return null;
  }

  const isInProgress =
    surveyStatus === "civic_context" || surveyStatus === "questionnaire";
  const surveyLabel = isInProgress ? t("resumeSurvey") : t("startSurvey");
  const showProgress = isInProgress && totalQuestions > 0;
  const progressPct =
    totalQuestions > 0
      ? Math.round((answeredCount / totalQuestions) * 100)
      : 0;

  return (
    <Pressable
      onPress={onStartSurvey}
      className="mx-4 bg-accent-coral shadow-elevated rounded-xl px-5 py-4"
      accessibilityRole="button"
      accessibilityLabel={surveyLabel}
      accessibilityHint={t("startSurveyHint")}
    >
      <View className="flex-row items-center gap-3">
        <Ionicons name="checkbox-outline" size={20} color="#FAFAF8" />
        <Text className="font-display-semibold text-base text-text-inverse flex-1">
          {surveyLabel}
        </Text>
      </View>

      {showProgress && (
        <View className="mt-3">
          {/* Progress track */}
          <View className="h-1.5 rounded-full bg-white/30">
            <View
              className="h-1.5 rounded-full bg-white"
              style={{ width: `${progressPct}%` }}
            />
          </View>
          <Text className="font-body-medium text-xs text-text-inverse opacity-80 mt-1.5">
            {t("surveyProgress", {
              answered: answeredCount,
              total: totalQuestions,
            })}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
