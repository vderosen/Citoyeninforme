import { useRef, useEffect } from "react";
import { View, TextInput, Pressable, Text, FlatList } from "react-native";
import { useTranslation } from "react-i18next";
import type { ChatMessage } from "../../stores/assistant";
import { MessageBubble } from "./MessageBubble";

interface ChatAreaProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSend: (text: string) => void;
}

export function ChatArea({ messages, isStreaming, onSend }: ChatAreaProps) {
  const { t } = useTranslation("assistant");
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<string>("");

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, messages[messages.length - 1]?.content]);

  const handleSend = () => {
    const text = inputRef.current.trim();
    if (!text || isStreaming) return;
    onSend(text);
    inputRef.current = "";
  };

  return (
    <View className="flex-1">
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <MessageBubble
            message={item}
            isStreaming={
              isStreaming &&
              index === messages.length - 1 &&
              item.role === "assistant"
            }
          />
        )}
        contentContainerStyle={{ padding: 16, flexGrow: 1 }}
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center">
            <Text className="font-body text-text-caption text-sm">{t("placeholder")}</Text>
          </View>
        }
      />

      {isStreaming && (
        <View className="px-4 pb-1">
          <Text className="font-body text-xs text-text-caption">{t("thinking")}</Text>
        </View>
      )}

      <View className="flex-row items-end px-4 pb-4 gap-2">
        <TextInput
          className="flex-1 bg-warm-gray rounded-xl px-4 py-3 font-body text-base text-text-body"
          placeholder={t("placeholder")}
          onChangeText={(text) => { inputRef.current = text; }}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          multiline
          maxLength={1000}
          editable={!isStreaming}
          accessibilityLabel={t("placeholder")}
        />
        <Pressable
          onPress={handleSend}
          disabled={isStreaming}
          className={`rounded-xl px-4 py-3 ${isStreaming ? "bg-warm-gray" : "bg-accent-coral"}`}
          style={{ minHeight: 44 }}
          accessibilityRole="button"
          accessibilityLabel={t("send")}
        >
          <Text className={`font-body-medium ${isStreaming ? "text-text-caption" : "text-text-inverse"}`}>
            {t("send")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
