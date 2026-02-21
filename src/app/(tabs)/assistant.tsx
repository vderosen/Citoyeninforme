import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useAssistantStore, createMessageId } from "../../stores/assistant";
import { useSurveyStore } from "../../stores/survey";
import { sendChatMessage } from "../../services/chatbot";
import { generateFollowUpSuggestions } from "../../services/suggestions";
import { ModeSelectionView } from "../../components/assistant/ModeSelectionView";
import { CandidatePickerView } from "../../components/assistant/CandidatePickerView";
import { CandidateAvatar } from "../../components/candidates/CandidateAvatar";
import { AssistantResetHeaderAction } from "../../components/assistant/AssistantResetHeaderAction";
import { AssistantFeedbackHeaderAction } from "../../components/assistant/AssistantFeedbackHeaderAction";
import { ChatArea } from "../../components/assistant/ChatArea";
import { DebateArea } from "../../components/assistant/DebateArea";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import type { AssistantMode, ChatMessage } from "../../stores/assistant";

const EMPTY_MESSAGES: ChatMessage[] = [];

export default function AssistantScreen() {
  const { t: tErrors } = useTranslation("errors");
  const { t } = useTranslation("assistant");
  const { t: tCommon } = useTranslation("common");
  const { isConnected } = useNetworkStatus();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();

  const initialMode = useAssistantStore((s) => s.mode);
  const initialCandidateId = useAssistantStore((s) => s.selectedCandidateId);
  const [activeView, setActiveView] = useState<"selection" | "mode">(
    initialMode === "parler" && initialCandidateId ? "mode" : "selection"
  );

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

  // --- Navigation handlers ---

  // Skip auto-switch on first mount to avoid reacting to persisted state
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    // External navigation (e.g. from candidates page) set parler + candidate:
    // auto-switch to mode view so the chat shows directly
    if (activeView === "selection" && mode === "parler" && selectedCandidateId) {
      setActiveView("mode");
    }
  }, [mode, selectedCandidateId]);

  const handleModeSelect = (newMode: AssistantMode) => {
    clearSuggestions();
    // Always show the candidate picker when entering parler from mode selection
    if (newMode === "parler") {
      clearCandidate();
    }
    selectMode(newMode);
    setActiveView("mode");
  };

  const handleBack = () => {
    if (mode === "parler" && selectedCandidateId) {
      clearCandidate();
    } else {
      if (mode === "debattre") resetDebate();
      setActiveView("selection");
    }
  };

  // --- Dynamic header ---

  useLayoutEffect(() => {
    if (activeView === "selection") {
      navigation.setOptions({
        headerTitle: tCommon("headers.assistant"),
        headerTitleAlign: "center",
        headerLeft: () => null,
        headerRight: () => null,
      });
      return;
    }

    const BackButton = () => (
      <Pressable
        onPress={handleBack}
        className="ml-3 p-2"
        accessibilityRole="button"
        accessibilityLabel={tCommon("back")}
      >
        <Ionicons name="arrow-back" size={22} color="#FAFAF8" />
      </Pressable>
    );

    const RightActions = () => (
      <View className="flex-row items-center">
        <AssistantResetHeaderAction />
        <AssistantFeedbackHeaderAction />
      </View>
    );

    if (mode === "comprendre") {
      navigation.setOptions({
        headerTitleAlign: "left",
        headerTitle: () => (
          <View className="flex-row items-center" style={{ marginTop: -3, marginLeft: 10 }}>
            <View
              className="items-center justify-center rounded-full bg-accent-coral"
              style={{ width: 34, height: 34 }}
            >
              <Ionicons name="sparkles" size={17} color="#FAFAF8" />
            </View>
            <View className="ml-2.5" style={{ marginLeft: 11, marginTop: -4 }}>
              <Text className="font-display-medium text-base text-text-inverse">
                Lucide
              </Text>
              <Text className="font-body text-xs text-text-inverse/70">
                {t("assistantSubtitle")}
              </Text>
            </View>
          </View>
        ),
        headerLeft: () => <BackButton />,
        headerRight: () => <RightActions />,
      });
    } else if (mode === "parler" && !selectedCandidateId) {
      navigation.setOptions({
        headerTitleAlign: "left",
        headerTitle: t("parlerModeShort"),
        headerLeft: () => <BackButton />,
        headerRight: () => null,
      });
    } else if (mode === "parler" && selectedCandidate) {
      navigation.setOptions({
        headerTitleAlign: "left",
        headerTitle: () => (
          <View className="flex-row items-center" style={{ marginTop: -3, marginLeft: 10 }}>
            <CandidateAvatar candidate={selectedCandidate} size={32} showRing />
            <View className="ml-2.5" style={{ marginLeft: 11, marginTop: -4 }}>
              <Text className="font-display-medium text-base text-text-inverse" numberOfLines={1}>
                {selectedCandidate.name}
              </Text>
              {selectedCandidate.party ? (
                <Text className="font-body text-xs text-text-inverse/70" numberOfLines={1}>
                  {selectedCandidate.party}
                </Text>
              ) : null}
            </View>
          </View>
        ),
        headerLeft: () => <BackButton />,
        headerRight: () => <RightActions />,
      });
    } else if (mode === "debattre") {
      navigation.setOptions({
        headerTitleAlign: "left",
        headerTitle: t("debattreModeShort"),
        headerLeft: () => <BackButton />,
        headerRight: () => <RightActions />,
      });
    }
  }, [activeView, mode, selectedCandidateId, selectedCandidate]);

  // --- Suggestions ---

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

  // --- Chat handlers ---

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
            {tErrors("offlineTitle")}
          </Text>
          <Text className="font-body text-sm text-text-caption text-center">
            {tErrors("chatOffline")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Mode selection view
  if (activeView === "selection") {
    return (
      <SafeAreaView className="flex-1 bg-warm-white" edges={[]}>
        <ModeSelectionView onModeSelect={handleModeSelect} />
      </SafeAreaView>
    );
  }

  // Active mode view
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
          />
        ) : mode === "debattre" ? (
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
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
