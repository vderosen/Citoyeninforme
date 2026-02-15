import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import type { SurveyStatus } from "../../stores/survey";

interface ResumeCardProps {
  surveyStatus: SurveyStatus;
  hasConversation: boolean;
  onResumeSurvey: () => void;
  onResumeChat: () => void;
}

export function ResumeCard({
  surveyStatus,
  hasConversation,
  onResumeSurvey,
  onResumeChat,
}: ResumeCardProps) {
  const { t } = useTranslation("home");

  const showSurveyResume =
    surveyStatus === "civic_context" || surveyStatus === "questionnaire";
  const showChatResume = hasConversation;

  if (!showSurveyResume && !showChatResume) return null;

  return (
    <View className="mx-4 bg-warm-gray rounded-xl p-4 shadow-card">
      <Text className="font-display-medium text-sm text-civic-navy mb-2">
        {t("resumeTitle")}
      </Text>
      <View className="gap-2">
        {showSurveyResume && (
          <Pressable
            onPress={onResumeSurvey}
            className="bg-warm-white rounded-lg px-4 py-3 border border-accent-coral"
            style={{ minHeight: 44 }}
            accessibilityRole="button"
            accessibilityLabel={t("resumeSurvey")}
          >
            <Text className="font-body-medium text-sm text-civic-navy">
              {t("resumeSurvey")}
            </Text>
          </Pressable>
        )}
        {showChatResume && (
          <Pressable
            onPress={onResumeChat}
            className="bg-warm-white rounded-lg px-4 py-3 border border-accent-coral"
            style={{ minHeight: 44 }}
            accessibilityRole="button"
            accessibilityLabel={t("resumeChat")}
          >
            <Text className="font-body-medium text-sm text-civic-navy">
              {t("resumeChat")}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
