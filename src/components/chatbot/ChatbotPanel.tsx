import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useTranslation } from "react-i18next";
import {
  useChatbotStore,
  createMessageId,
} from "../../stores/chatbot";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { sendChatMessage } from "../../services/chatbot";
import { MessageBubble } from "./MessageBubble";
import { ModeSelector } from "./ModeSelector";

export function ChatbotPanel() {
  const { t } = useTranslation("chatbot");
  const [inputText, setInputText] = useState("");
  const scrollRef = useRef<ScrollView>(null);

  const status = useChatbotStore((s) => s.status);
  const mode = useChatbotStore((s) => s.mode);
  const messages = useChatbotStore((s) => s.messages);
  const isStreaming = useChatbotStore((s) => s.isStreaming);
  const selectedCandidateId = useChatbotStore((s) => s.selectedCandidateId);
  const preloadedContext = useChatbotStore((s) => s.preloadedContext);
  const addMessage = useChatbotStore((s) => s.addMessage);
  const updateLastAssistantMessage = useChatbotStore(
    (s) => s.updateLastAssistantMessage
  );
  const setStreaming = useChatbotStore((s) => s.setStreaming);
  const clearPreloadedContext = useChatbotStore(
    (s) => s.clearPreloadedContext
  );
  const close = useChatbotStore((s) => s.close);

  const election = useElectionStore((s) => s.election);
  const candidates = useElectionStore((s) => s.candidates);
  const positions = useElectionStore((s) => s.positions);
  const themes = useElectionStore((s) => s.themes);
  const profile = useSurveyStore((s) => s.profile);

  if (status === "closed") return null;

  const handleSend = async () => {
    let text = inputText.trim();
    if (!text && preloadedContext) {
      text = preloadedContext;
      clearPreloadedContext();
    }
    if (!text || !mode || !election) return;

    const userMessage = {
      id: createMessageId(),
      role: "user" as const,
      content: text,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMessage);
    setInputText("");
    setStreaming(true);

    // Add empty assistant message for streaming
    const assistantMessage = {
      id: createMessageId(),
      role: "assistant" as const,
      content: "",
      timestamp: new Date().toISOString(),
    };
    addMessage(assistantMessage);

    await sendChatMessage(
      mode,
      [...messages, userMessage],
      { election, candidates, positions, themes },
      {
        candidateId: selectedCandidateId ?? undefined,
        userProfile: profile ?? undefined,
      },
      (chunk) => {
        updateLastAssistantMessage(chunk);
        scrollRef.current?.scrollToEnd({ animated: true });
      },
      () => setStreaming(false),
      (error) => {
        updateLastAssistantMessage(
          `\n\n_${t("common:error")}: ${error}_`
        );
        setStreaming(false);
      }
    );
  };

  const showCandidateSelector =
    mode === "candidate" && !selectedCandidateId;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="absolute bottom-20 left-4 right-4 bg-white rounded-2xl shadow-xl border border-gray-200"
      style={{ maxHeight: "70%", elevation: 10, zIndex: 100 }}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
        <Text className="text-base font-semibold text-gray-900">
          {t("title")}
          {mode && ` — ${t(`${mode}Mode`)}`}
        </Text>
        <Pressable
          onPress={close}
          accessibilityRole="button"
          accessibilityLabel={t("closeChat")}
          style={{ minHeight: 44, minWidth: 44, justifyContent: "center", alignItems: "center" }}
        >
          <Text className="text-gray-400 text-xl">✕</Text>
        </Pressable>
      </View>

      {/* Content */}
      {status === "mode_selection" ? (
        <ModeSelector />
      ) : showCandidateSelector ? (
        <View className="p-4">
          <Text className="text-base font-medium text-gray-900 mb-3">
            {t("selectCandidate")}
          </Text>
          {candidates.map((candidate) => (
            <Pressable
              key={candidate.id}
              onPress={() =>
                useChatbotStore.getState().selectCandidate(candidate.id)
              }
              accessibilityRole="button"
              className="p-3 mb-2 rounded-xl bg-gray-50"
              style={{ minHeight: 44 }}
            >
              <Text className="text-base text-gray-800">
                {candidate.name}
              </Text>
              <Text className="text-sm text-gray-500">
                {candidate.party}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : (
        <>
          <ScrollView
            ref={scrollRef}
            className="flex-1 px-4 py-2"
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((msg, index) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isStreaming={
                  isStreaming && index === messages.length - 1 && msg.role === "assistant"
                }
              />
            ))}
          </ScrollView>

          {/* Input */}
          <View className="flex-row items-center px-4 py-3 border-t border-gray-200">
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder={preloadedContext ?? t("placeholder")}
              placeholderTextColor="#9CA3AF"
              className="flex-1 bg-gray-100 rounded-xl px-4 py-2 text-base text-gray-800"
              style={{ minHeight: 44 }}
              editable={!isStreaming}
              onSubmitEditing={handleSend}
              returnKeyType="send"
              accessibilityLabel={t("placeholder")}
            />
            <Pressable
              onPress={handleSend}
              accessibilityRole="button"
              accessibilityLabel={t("send")}
              className={`ml-2 px-4 py-2 rounded-xl ${
                isStreaming ? "bg-gray-300" : "bg-blue-600"
              }`}
              disabled={isStreaming}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <Text className="text-white font-medium">{t("send")}</Text>
            </Pressable>
          </View>
        </>
      )}
    </KeyboardAvoidingView>
  );
}
