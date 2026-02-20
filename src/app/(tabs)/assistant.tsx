import { useEffect, useRef } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useAssistantStore, createMessageId } from "../../stores/assistant";
import { useSurveyStore } from "../../stores/survey";
import { sendChatMessage } from "../../services/chatbot";
import { generateFollowUpSuggestions } from "../../services/suggestions";
import { ModeSelector } from "../../components/assistant/ModeSelector";
import { CandidatePickerView } from "../../components/assistant/CandidatePickerView";
import { ActiveCandidatePill } from "../../components/assistant/ActiveCandidatePill";
import { ChatArea } from "../../components/assistant/ChatArea";
import { DebateArea } from "../../components/assistant/DebateArea";
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
  const resetDebate = useAssistantStore((s) => s.resetDebate);
  const addMessage = useAssistantStore((s) => s.addMessage);
  const updateLastAssistantMessage = useAssistantStore((s) => s.updateLastAssistantMessage);
  const setStreaming = useAssistantStore((s) => s.setStreaming);
  const consumePreloadedContext = useAssistantStore((s) => s.consumePreloadedContext);
  const selectCandidate = useAssistantStore((s) => s.selectCandidate);
  const clearCandidate = useAssistantStore((s) => s.clearCandidate);
  const resetConversation = useAssistantStore((s) => s.resetConversation);
  const followUpSuggestions = useAssistantStore((s) => s.followUpSuggestions);
  const isGeneratingSuggestions = useAssistantStore((s) => s.isGeneratingSuggestions);
  const setSuggestions = useAssistantStore((s) => s.setSuggestions);
  const setGeneratingSuggestions = useAssistantStore((s) => s.setGeneratingSuggestions);
  const clearSuggestions = useAssistantStore((s) => s.clearSuggestions);

  const userProfile = useSurveyStore((s) => s.profile);

  const selectedCandidate = candidates.find((c) => c.id === selectedCandidateId) ?? null;

  // Generation counter to prevent stale suggestions from overwriting fresh ones
  const suggestionGenRef = useRef(0);

  const triggerSuggestions = () => {
    const currentMessages = useAssistantStore.getState().getCurrentMessages();
    const currentMode = useAssistantStore.getState().mode;
    if (currentMode === "debattre") return;

    suggestionGenRef.current += 1;
    const genId = suggestionGenRef.current;

    setGeneratingSuggestions(true);
    generateFollowUpSuggestions(currentMessages, currentMode)
      .then((suggestions) => {
        if (suggestionGenRef.current === genId) {
          setSuggestions(suggestions);
          setGeneratingSuggestions(false);
        }
      })
      .catch(() => {
        if (suggestionGenRef.current === genId) {
          setSuggestions([]);
          setGeneratingSuggestions(false);
        }
      });
  };

  // Clear persisted candidate if it no longer exists in election data
  useEffect(() => {
    if (selectedCandidateId && candidates.length > 0 && !selectedCandidate) {
      clearCandidate();
    }
  }, [selectedCandidateId, candidates, selectedCandidate]);

  // Consume preloaded context on mount
  useEffect(() => {
    const ctx = consumePreloadedContext();
    if (ctx) {
      // Context was consumed, prompt UI will show relevant suggestions
    }
  }, []);

  // Reset debate state when switching away from debattre mode
  const handleModeChange = (newMode: typeof mode) => {
    if (mode === "debattre" && newMode !== "debattre") {
      resetDebate();
    }
    clearSuggestions();
    selectMode(newMode);
  };

  const handleParlerBack = () => {
    selectMode("comprendre");
  };

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
      () => {
        setStreaming(false);
        triggerSuggestions();
      },
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
        {mode === "parler" && !selectedCandidateId ? (
          <CandidatePickerView
            candidates={candidates}
            onSelect={selectCandidate}
            onBack={handleParlerBack}
          />
        ) : (
          <>
            {mode === "parler" && selectedCandidate ? (
              <View className="pt-2">
                <ActiveCandidatePill
                  candidate={selectedCandidate}
                  onDeselect={clearCandidate}
                />
              </View>
            ) : (
              <View className="pt-2">
                <ModeSelector activeMode={mode} onModeChange={handleModeChange} />
              </View>
            )}

            {mode === "debattre" ? (
              <DebateArea />
            ) : (
              <ChatArea
                messages={messages}
                isStreaming={isStreaming}
                onSend={handleSend}
                mode={mode}
                context={preloadedContext}
                onPromptSelect={handlePromptSelect}
                selectedCandidateId={selectedCandidateId}
                followUpSuggestions={followUpSuggestions}
                isGeneratingSuggestions={isGeneratingSuggestions}
              />
            )}
          </>
        )}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
