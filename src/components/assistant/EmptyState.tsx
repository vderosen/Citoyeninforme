import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { AssistantContext, AssistantMode } from "../../stores/assistant";
import { ContextPrompts } from "./ContextPrompts";

interface EmptyStateProps {
  mode: AssistantMode;
  context: AssistantContext | null;
  onPromptSelect: (text: string) => void;
  selectedCandidateId: string | null;
}

const MODE_ICONS: Record<AssistantMode, keyof typeof Ionicons.glyphMap> = {
  comprendre: "book-outline",
  parler: "chatbubble-ellipses-outline",
  debattre: "scale-outline",
};

export function EmptyState({ mode, context, onPromptSelect, selectedCandidateId }: EmptyStateProps) {
  const { t } = useTranslation("assistant");

  return (
    <View className="flex-1 items-center justify-center px-6 py-8">
      <View className="w-16 h-16 rounded-full bg-accent-coral-light items-center justify-center mb-4">
        <Ionicons name={MODE_ICONS[mode]} size={32} color="#E8553A" />
      </View>

      <Text className="font-display-semibold text-lg text-civic-navy text-center mb-2">
        {t(`${mode}Mode`)}
      </Text>

      <Text className="font-body text-sm text-text-caption text-center mb-6">
        {t(`${mode}ModeDescription`)}
      </Text>

      <ContextPrompts
        context={context}
        mode={mode}
        onPromptSelect={onPromptSelect}
      />
    </View>
  );
}
