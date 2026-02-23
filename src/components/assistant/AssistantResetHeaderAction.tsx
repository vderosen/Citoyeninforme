import { Alert, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAssistantStore } from "../../stores/assistant";

export function AssistantResetHeaderAction() {
  const { t } = useTranslation("assistant");
  const { t: tCommon } = useTranslation("common");
  const selectedCandidateId = useAssistantStore((s) => s.selectedCandidateId);
  const conversations = useAssistantStore((s) => s.conversations);
  const resetConversation = useAssistantStore((s) => s.resetConversation);

  const key = selectedCandidateId
    ? `candidate:${selectedCandidateId}`
    : "general";
  const hasMessages = (conversations[key] ?? []).length > 0;

  const handleReset = () => {
    if (!hasMessages) return;
    Alert.alert(
      t("newConversation"),
      t("resetConfirm"),
      [
        { text: tCommon("cancel"), style: "cancel" },
        {
          text: tCommon("confirm"),
          style: "destructive",
          onPress: resetConversation,
        },
      ]
    );
  };

  return (
    <Pressable
      onPress={handleReset}
      disabled={!hasMessages}
      className="ml-4 p-2"
      style={{ opacity: hasMessages ? 1 : 0.6 }}
      accessibilityRole="button"
      accessibilityLabel={t("newConversation")}
      accessibilityState={{ disabled: !hasMessages }}
    >
      <Ionicons
        name="refresh-outline"
        size={22}
        color={hasMessages ? "#FAFAF8" : "#9CA3AF"}
      />
    </Pressable>
  );
}
