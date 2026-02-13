import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useChatbotStore, type ChatbotMode } from "../../stores/chatbot";
import { useSurveyStore } from "../../stores/survey";

interface Props {
  onSelectCandidate?: () => void;
}

export function ModeSelector({ onSelectCandidate }: Props) {
  const { t } = useTranslation("chatbot");
  const selectMode = useChatbotStore((s) => s.selectMode);
  const surveyStatus = useSurveyStore((s) => s.status);
  const isDebateAvailable = surveyStatus === "completed";

  const modes: {
    id: ChatbotMode;
    label: string;
    description: string;
    locked?: boolean;
    lockReason?: string;
  }[] = [
    {
      id: "learn",
      label: t("learnMode"),
      description: t("learnModeDescription"),
    },
    {
      id: "candidate",
      label: t("candidateMode"),
      description: t("candidateModeDescription"),
    },
    {
      id: "debate",
      label: t("debateMode"),
      description: t("debateModeDescription"),
      locked: !isDebateAvailable,
      lockReason: t("debateLocked"),
    },
  ];

  const handleSelect = (mode: ChatbotMode) => {
    if (mode === "candidate") {
      selectMode(mode);
      onSelectCandidate?.();
    } else {
      selectMode(mode);
    }
  };

  return (
    <View className="p-4">
      <Text
        className="text-lg font-semibold text-gray-900 mb-4"
        accessibilityRole="header"
      >
        {t("selectMode")}
      </Text>

      {modes.map((mode) => (
        <Pressable
          key={mode.id}
          onPress={() => !mode.locked && handleSelect(mode.id)}
          accessibilityRole="button"
          accessibilityLabel={`${mode.label}: ${mode.description}`}
          accessibilityState={{ disabled: mode.locked }}
          className={`p-4 mb-3 rounded-xl border ${
            mode.locked
              ? "border-gray-200 bg-gray-50 opacity-60"
              : "border-gray-200 bg-white"
          }`}
          style={{ minHeight: 44 }}
          disabled={mode.locked}
        >
          <Text
            className={`text-base font-medium ${
              mode.locked ? "text-gray-400" : "text-gray-900"
            }`}
          >
            {mode.locked ? "🔒 " : ""}
            {mode.label}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {mode.locked ? mode.lockReason : mode.description}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
