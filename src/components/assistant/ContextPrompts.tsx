import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { AssistantContext, AssistantMode } from "../../stores/assistant";
import { useElectionStore } from "../../stores/election";

interface ContextPromptsProps {
  context: AssistantContext | null;
  mode: AssistantMode;
  onPromptSelect: (text: string) => void;
}

export function ContextPrompts({ context, mode, onPromptSelect }: ContextPromptsProps) {
  const { t } = useTranslation("assistant");
  const getCandidateById = useElectionStore((s) => s.getCandidateById);
  const getThemeById = useElectionStore((s) => s.getThemeById);

  const prompts: string[] = [];

  if (context) {
    if (context.type === "candidate" && context.candidateId) {
      const candidate = getCandidateById(context.candidateId);
      if (candidate) {
        prompts.push(`Que propose ${candidate.name} ?`);
        prompts.push(`Quels sont les points forts du programme de ${candidate.name} ?`);
      }
    } else if (context.type === "theme" && context.themeId) {
      const theme = getThemeById(context.themeId);
      if (theme) {
        prompts.push(`Comparez les positions sur ${theme.name}`);
        prompts.push(`Quels candidats ont une position sur ${theme.name} ?`);
      }
    } else if (context.type === "survey_result") {
      prompts.push("Expliquez mes résultats de sondage");
      prompts.push("Pourquoi ai-je ce classement ?");
    }
  }

  // Default prompts if no context
  if (prompts.length === 0) {
    if (mode === "comprendre") {
      prompts.push("Comment fonctionne l'élection ?");
      prompts.push("Quels sont les principaux thèmes ?");
      prompts.push("Combien de candidats participent ?");
    } else if (mode === "debattre") {
      prompts.push("Quels sont les enjeux les plus clivants ?");
      prompts.push("Débattons des priorités budgétaires");
    }
  }

  if (prompts.length === 0) return null;

  return (
    <View className="flex-row flex-wrap gap-2 w-full">
      {prompts.map((prompt) => (
        <Pressable
          key={prompt}
          onPress={() => onPromptSelect(prompt)}
          className="flex-row items-center border border-accent-coral bg-warm-white rounded-xl px-4 py-3 gap-2"
          style={{ minHeight: 44 }}
          accessibilityRole="button"
          accessibilityLabel={prompt}
        >
          <Text className="font-body text-sm text-text-body flex-shrink">{prompt}</Text>
          <Ionicons name="arrow-forward" size={12} color="#E8553A" />
        </Pressable>
      ))}
    </View>
  );
}
