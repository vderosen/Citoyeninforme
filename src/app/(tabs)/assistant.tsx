import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { View, Text, Image, KeyboardAvoidingView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useAssistantStore, createMessageId } from "../../stores/assistant";
import { sendChatMessage } from "../../services/chatbot";
import { AssistantResetHeaderAction } from "../../components/assistant/AssistantResetHeaderAction";
import { AssistantFeedbackHeaderAction } from "../../components/assistant/AssistantFeedbackHeaderAction";
import { AssistantInfoHeaderAction } from "../../components/assistant/AssistantInfoHeaderAction";
import { ChatArea } from "../../components/assistant/ChatArea";
import { useNetworkStatus } from "../../hooks/useNetworkStatus";
import type { ChatMessage } from "../../stores/assistant";

const EMPTY_MESSAGES: ChatMessage[] = [];

export default function AssistantScreen() {
  const { t: tErrors } = useTranslation("errors");
  const { t } = useTranslation("assistant");
  const { t: tCommon } = useTranslation("common");
  const { isConnected } = useNetworkStatus();
  const headerHeight = useHeaderHeight();
  const navigation = useNavigation();
  const streamWatchdogRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const selectedCandidateId = useAssistantStore((s) => s.selectedCandidateId);
  const messages = useAssistantStore((s) => {
    const key = s.selectedCandidateId
      ? `candidate:${s.selectedCandidateId}`
      : "general";
    return s.conversations[key] ?? EMPTY_MESSAGES;
  });
  const isStreaming = useAssistantStore((s) => s.isStreaming);
  const addMessage = useAssistantStore((s) => s.addMessage);
  const updateLastAssistantMessage = useAssistantStore((s) => s.updateLastAssistantMessage);
  const setStreaming = useAssistantStore((s) => s.setStreaming);
  const resetConversation = useAssistantStore((s) => s.resetConversation);

  // --- Dynamic header ---

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitleAlign: "left",
      headerTitle: () => (
        <View className="flex-row items-center" style={{ marginTop: -3, marginLeft: 10 }}>
          <Image
            source={require('../../../assets/images/splash-icon.png')}
            style={{ width: 32, height: 32, borderRadius: 16 }}
            resizeMode="contain"
          />
          <View className="ml-2.5" style={{ marginLeft: 11, marginTop: -4 }}>
            <Text className="text-base tracking-wide" style={{ fontFamily: 'ArialRoundedMTBold' }}>
              <Text style={{ color: '#FFFFFF' }}>Citoyen </Text>
              <Text style={{ color: '#60A5FA' }}>Informé</Text>
            </Text>
            <Text className="font-body text-xs text-text-inverse/70">
              {t("assistantSubtitle")}
            </Text>
          </View>
        </View>
      ),
      headerLeft: () => null,
      headerRight: () => (
        <View className="flex-row items-center">
          <AssistantResetHeaderAction />
          <AssistantInfoHeaderAction />
        </View>
      ),
    });
  }, []);

  // --- Chat handler ---

  useEffect(() => {
    return () => {
      if (streamWatchdogRef.current) {
        clearTimeout(streamWatchdogRef.current);
        streamWatchdogRef.current = null;
      }
    };
  }, []);

  const handleSend = (text: string) => {
    if (isStreaming || !isConnected) return;

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      content: text,
      timestamp: new Date().toISOString(),
    };
    addMessage(userMessage);
    setStreaming(true);

    if (streamWatchdogRef.current) {
      clearTimeout(streamWatchdogRef.current);
    }
    streamWatchdogRef.current = setTimeout(() => {
      setStreaming(false);
      addMessage({
        id: createMessageId(),
        role: "assistant",
        content: "[Erreur: délai dépassé, merci de réessayer.]",
        timestamp: new Date().toISOString(),
      });
      streamWatchdogRef.current = null;
    }, 25000);

    let firstChunk = true;
    const assistantMessageId = createMessageId();

    sendChatMessage(
      [...messages, userMessage],
      { candidateFilter: selectedCandidateId },
      (chunk) => {
        if (firstChunk) {
          firstChunk = false;
          addMessage({
            id: assistantMessageId,
            role: "assistant",
            content: chunk,
            timestamp: new Date().toISOString(),
          });
        } else {
          updateLastAssistantMessage(chunk);
        }
      },
      () => {
        if (streamWatchdogRef.current) {
          clearTimeout(streamWatchdogRef.current);
          streamWatchdogRef.current = null;
        }
        setStreaming(false);
      },
      (error) => {
        if (streamWatchdogRef.current) {
          clearTimeout(streamWatchdogRef.current);
          streamWatchdogRef.current = null;
        }
        if (firstChunk) {
          firstChunk = false;
          addMessage({
            id: assistantMessageId,
            role: "assistant",
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

  // Single chat view
  return (
    <KeyboardAvoidingView
      className="flex-1"
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={headerHeight}
    >
      <SafeAreaView className="flex-1 bg-warm-white" edges={[]}>
        <ChatArea
          messages={messages}
          isStreaming={isStreaming}
          onSend={handleSend}
          onPromptSelect={handleSend}
          selectedCandidateId={selectedCandidateId}
        />
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
}
