import { useEffect } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useAssistantStore, createMessageId } from "../../stores/assistant";
import { useSurveyStore } from "../../stores/survey";
import { sendChatMessage } from "../../services/chatbot";
import { ModeSelector } from "../../components/assistant/ModeSelector";
import { CandidateSelector } from "../../components/assistant/CandidateSelector";
import { ChatArea } from "../../components/assistant/ChatArea";
import { ChatToolbar } from "../../components/assistant/ChatToolbar";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import type { ChatMessage } from "../../stores/assistant";

const EMPTY_MESSAGES: ChatMessage[] = [];

export default function AssistantScreen() {
  const { t } = useTranslation("errors");
  const { isConnected } = useNetworkStatus();
  const headerHeight = useHeaderHeight();

  const election = useElectionStore((s) => s.election);
  const candidates = useElectionStore((s) => s.candidates);
  const positions = useElectionStore((s) => s.positions);
  const themes = useElectionStore((s) => s.themes);

  const mode = useAssistantStore((s) => s.mode);
  const selectedCandidateId = useAssistantStore((s) => s.selectedCandidateId);
  const messages = useAssistantStore((s) => {
    const key = s.mode === "parler" && s.selectedCandidateId
      ? `parler:${s.selectedCandidateId}`
      : s.mode;
    return s.conversations[key] ?? EMPTY_MESSAGES;
  });
  const isStreaming = useAssistantStore((s) => s.isStreaming);
  const preloadedContext = useAssistantStore((s) => s.preloadedContext);
  const selectMode = useAssistantStore((s) => s.selectMode);
  const addMessage = useAssistantStore((s) => s.addMessage);
  const updateLastAssistantMessage = useAssistantStore((s) => s.updateLastAssistantMessage);
  const setStreaming = useAssistantStore((s) => s.setStreaming);
  const consumePreloadedContext = useAssistantStore((s) => s.consumePreloadedContext);
  const selectCandidate = useAssistantStore((s) => s.selectCandidate);
  const resetConversation = useAssistantStore((s) => s.resetConversation);

  const userProfile = useSurveyStore((s) => s.profile);

  // Consume preloaded context on mount
  useEffect(() => {
    const ctx = consumePreloadedContext();
    if (ctx) {
      // Context was consumed, prompt UI will show relevant suggestions
    }
  }, []);

  const handleSend = (text: string) => {
    if (!election || isStreaming || !isConnected) return;
    if (mode === "parler" && !selectedCandidateId) return;

    const userMessage = {
      id: createMessageId(),
      role: "user" as const,
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);
    setStreaming(true);

    let firstChunk = true;
    const assistantMessageId = createMessageId();

    sendChatMessage(
      mode,
      [...messages, userMessage],
      { election, candidates, positions, themes },
      {
        candidateId: selectedCandidateId ?? undefined,
        userProfile: userProfile ?? undefined,
      },
      (chunk) => {
        if (firstChunk) {
          firstChunk = false;
          addMessage({
            id: assistantMessageId,
            role: "assistant" as const,
            content: chunk,
            timestamp: new Date().toISOString(),
          });
        } else {
          updateLastAssistantMessage(chunk);
        }
      },
      () => setStreaming(false),
      (error) => {
        if (firstChunk) {
          firstChunk = false;
          addMessage({
            id: assistantMessageId,
            role: "assistant" as const,
            content: `[Erreur: ${error}]`,
            timestamp: new Date().toISOString(),
          });
        } else {
          updateLastAssistantMessage(`\n\n[Erreur: ${error}]`);
        }
        setStreaming(false);
      }
    );
  };

  const handlePromptSelect = (text: string) => {
    handleSend(text);
  };

  // Offline guard
  if (!isConnected) {
    return (
      <SafeAreaView className="flex-1 bg-warm-white" edges={[]}>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="cloud-offline-outline" size={48} color="#6B7280" />
          <Text className="font-display-medium text-lg text-civic-navy text-center mt-4 mb-2">
            {t("offlineTitle")}
          </Text>
          <Text className="font-body text-sm text-text-caption text-center">
            {t("chatOffline")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <SafeAreaView className="flex-1 bg-warm-white" edges={[]}>
        <View className="pt-2">
          <ModeSelector activeMode={mode} onModeChange={selectMode} />
        </View>

        {mode === "parler" && (
          <CandidateSelector
            candidates={candidates}
            selectedId={selectedCandidateId}
            onSelect={selectCandidate}
          />
        )}

        <ChatToolbar
          messages={messages}
          onNewConversation={resetConversation}
        />

        <ChatArea
          messages={messages}
          isStreaming={isStreaming}
          onSend={handleSend}
          mode={mode}
          context={preloadedContext}
          onPromptSelect={handlePromptSelect}
          selectedCandidateId={selectedCandidateId}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
