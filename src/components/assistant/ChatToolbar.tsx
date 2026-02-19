import { useState } from "react";
import { View, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { ChatMessage } from "../../stores/assistant";
import { FeedbackAction } from "../shared/FeedbackAction";

interface ChatToolbarProps {
  messages: ChatMessage[];
  onNewConversation: () => void;
}

export function ChatToolbar({ messages, onNewConversation }: ChatToolbarProps) {
  const { t } = useTranslation("assistant");
  const { t: tCommon } = useTranslation("common");
  const [showFeedback, setShowFeedback] = useState(false);

  const hasMessages = messages.length > 0;

  const handleNewConversation = () => {
    Alert.alert(
      t("newConversation"),
      t("resetConfirm"),
      [
        { text: tCommon("cancel"), style: "cancel" },
        {
          text: tCommon("confirm"),
          style: "destructive",
          onPress: onNewConversation,
        },
      ]
    );
  };

  return (
    <View>
      <View className="flex-row items-center justify-between px-4 py-1">
        {hasMessages ? (
          <Pressable
            onPress={handleNewConversation}
            className="w-11 h-11 items-center justify-center rounded-lg"
            accessibilityRole="button"
            accessibilityLabel={t("newConversation")}
          >
            <Ionicons name="refresh-outline" size={20} color="#6B7280" />
          </Pressable>
        ) : (
          <View className="w-11 h-11" />
        )}

        <Pressable
          onPress={() => setShowFeedback(!showFeedback)}
          className="w-11 h-11 items-center justify-center rounded-lg"
          accessibilityRole="button"
          accessibilityLabel={tCommon("feedbackSignal")}
          accessibilityState={{ expanded: showFeedback }}
        >
          <Ionicons
            name="flag-outline"
            size={20}
            color={showFeedback ? "#E8553A" : "#6B7280"}
          />
        </Pressable>
      </View>

      {showFeedback && (
        <View className="px-4 pb-2">
          <FeedbackAction screen="assistant" />
        </View>
      )}
    </View>
  );
}
