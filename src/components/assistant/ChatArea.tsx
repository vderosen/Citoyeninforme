import { useState, useRef, useEffect, useCallback } from "react";
import { View, TextInput, Pressable, Text, FlatList, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { ChatMessage, AssistantMode, AssistantContext } from "../../stores/assistant";
import { MessageBubble } from "./MessageBubble";
import { EmptyState } from "./EmptyState";
import { TypingIndicator } from "./TypingIndicator";
import { ScrollToBottomButton } from "./ScrollToBottomButton";
import { FollowUpSuggestions } from "./FollowUpSuggestions";

interface ChatAreaProps {
  messages: ChatMessage[];
  isStreaming: boolean;
  onSend: (text: string) => void;
  mode: AssistantMode;
  context: AssistantContext | null;
  onPromptSelect: (text: string) => void;
  selectedCandidateId: string | null;
  followUpSuggestions: string[];
  isGeneratingSuggestions: boolean;
}

export function ChatArea({
  messages,
  isStreaming,
  onSend,
  mode,
  context,
  onPromptSelect,
  selectedCandidateId,
  followUpSuggestions,
  isGeneratingSuggestions,
}: ChatAreaProps) {
  const { t } = useTranslation("assistant");
  const flatListRef = useRef<FlatList>(null);
  const [inputText, setInputText] = useState("");
  const [isAtBottom, setIsAtBottom] = useState(true);
  const listHeightRef = useRef(0);

  useEffect(() => {
    if (messages.length > 0 && isAtBottom) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages.length, messages[messages.length - 1]?.content, isAtBottom]);

  // Scroll to bottom when the FlatList shrinks (keyboard opened) and we were at bottom
  const handleListLayout = useCallback((event: { nativeEvent: { layout: { height: number } } }) => {
    const newHeight = event.nativeEvent.layout.height;
    if (newHeight < listHeightRef.current && isAtBottom && messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true });
    }
    listHeightRef.current = newHeight;
  }, [isAtBottom, messages.length]);

  const handleSend = () => {
    const text = inputText.trim();
    if (!text || isStreaming) return;
    onSend(text);
    setInputText("");
  };

  const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const distanceFromBottom = contentSize.height - layoutMeasurement.height - contentOffset.y;
    setIsAtBottom(distanceFromBottom < 50);
  }, []);

  const handleScrollToBottom = useCallback(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, []);

  const showTypingIndicator =
    isStreaming &&
    messages.length > 0 &&
    messages[messages.length - 1]?.role !== "assistant";

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
          <EmptyState
            mode={mode}
            context={context}
            onPromptSelect={onPromptSelect}
            selectedCandidateId={selectedCandidateId}
          />
        }
        ListFooterComponent={showTypingIndicator ? <TypingIndicator /> : null}
        onScroll={handleScroll}
        onLayout={handleListLayout}
        scrollEventThrottle={16}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
      />

      <ScrollToBottomButton
        visible={!isAtBottom && messages.length > 0}
        onPress={handleScrollToBottom}
      />

      <View
        className="border-t border-warm-gray"
        style={{
          shadowColor: "#1B2A4A",
          shadowOffset: { width: 0, height: -1 },
          shadowOpacity: 0.04,
          shadowRadius: 2,
          elevation: 1,
        }}
      >
        {messages.length > 0 && !isStreaming && (followUpSuggestions.length > 0 || isGeneratingSuggestions) && (
          <FollowUpSuggestions
            suggestions={followUpSuggestions}
            isLoading={isGeneratingSuggestions}
            onSelect={onPromptSelect}
          />
        )}
        <View className="flex-row items-end px-4 pb-4 pt-3 gap-2">
          <TextInput
            className="flex-1 bg-warm-gray rounded-xl px-4 py-3 font-body text-base text-text-body"
            placeholder={t("placeholder")}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
            maxLength={1000}
            accessibilityLabel={t("placeholder")}
          />
          <Pressable
            onPress={handleSend}
            disabled={isStreaming || !inputText.trim()}
            className={`w-11 h-11 rounded-full items-center justify-center ${
              isStreaming || !inputText.trim() ? "bg-warm-gray" : "bg-accent-coral"
            }`}
            accessibilityRole="button"
            accessibilityLabel={t("send")}
          >
            <Ionicons
              name="send"
              size={18}
              color={isStreaming || !inputText.trim() ? "#6B7280" : "#FAFAF8"}
            />
          </Pressable>
        </View>
      </View>
    </View>
  );
}
