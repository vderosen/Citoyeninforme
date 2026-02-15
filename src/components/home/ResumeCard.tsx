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
    <View className="mx-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
      <Text className="text-sm font-semibold text-gray-900 mb-2">
        {t("resumeTitle")}
      </Text>
      <View className="gap-2">
        {showSurveyResume && (
          <Pressable
            onPress={onResumeSurvey}
            className="bg-white rounded-lg px-4 py-3 border border-amber-200"
            style={{ minHeight: 44 }}
            accessibilityRole="button"
            accessibilityLabel={t("resumeSurvey")}
          >
            <Text className="text-sm font-medium text-gray-800">
              {t("resumeSurvey")}
            </Text>
          </Pressable>
        )}
        {showChatResume && (
          <Pressable
            onPress={onResumeChat}
            className="bg-white rounded-lg px-4 py-3 border border-amber-200"
            style={{ minHeight: 44 }}
            accessibilityRole="button"
            accessibilityLabel={t("resumeChat")}
          >
            <Text className="text-sm font-medium text-gray-800">
              {t("resumeChat")}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
