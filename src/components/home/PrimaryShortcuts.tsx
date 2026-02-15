import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import DistrictBlockCard from "../ui/DistrictBlockCard";
import { PressableScale } from "../ui/PressableScale";
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

  return (
    <View className="px-4 gap-3">
      <DistrictBlockCard clipCorner="top-right" className="bg-accent-coral">
        <PressableScale
          onPress={onStartSurvey}
          className="px-5 py-5 flex-row items-center gap-3"
          style={{ minHeight: 64 }}
          accessibilityRole="button"
          accessibilityLabel={surveyLabel}
          accessibilityHint={t("startSurveyHint")}
        >
          <Ionicons name="checkbox-outline" size={22} color="#FAFAF8" />
          <Text className="font-display-semibold text-lg text-text-inverse flex-1">
            {surveyLabel}
          </Text>
        </PressableScale>
      </DistrictBlockCard>
      <View className="flex-row gap-3">
        <DistrictBlockCard clipCorner="top-right" className="flex-1 bg-civic-navy-light">
          <PressableScale
            onPress={onViewCandidates}
            className="px-4 py-4 items-center gap-2"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel={t("exploreCandidates")}
            accessibilityHint={t("exploreCandidatesHint")}
          >
            <Ionicons name="people-outline" size={22} color="#1B2A4A" />
            <Text className="font-display-medium text-sm text-civic-navy text-center">
              {t("exploreCandidates")}
            </Text>
          </PressableScale>
        </DistrictBlockCard>
        <DistrictBlockCard clipCorner="top-right" className="flex-1 bg-civic-navy-light">
          <PressableScale
            onPress={onAskQuestion}
            className="px-4 py-4 items-center gap-2"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel={t("askQuestion")}
            accessibilityHint={t("askQuestionHint")}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#1B2A4A" />
            <Text className="font-display-medium text-sm text-civic-navy text-center">
              {t("askQuestion")}
            </Text>
          </PressableScale>
        </DistrictBlockCard>
      </View>
    </View>
  );
}
