import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./storage";

export type AssistantMode = "comprendre" | "parler" | "debattre";

export interface AssistantContext {
  type: "candidate" | "theme" | "survey_result";
  candidateId: string | null;
  themeId: string | null;
  promptText: string | null;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: {
    title: string;
    url: string;
    entityType: string;
    entityId: string;
  }[];
  timestamp: string;
}

let messageCounter = 0;

export function createMessageId(): string {
  messageCounter += 1;
  return `msg-${Date.now()}-${messageCounter}`;
}

interface AssistantState {
  mode: AssistantMode;
  selectedCandidateId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  preloadedContext: AssistantContext | null;

  selectMode: (mode: AssistantMode) => void;
  selectCandidate: (candidateId: string) => void;
  clearCandidate: () => void;
  addMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setPreloadedContext: (context: AssistantContext) => void;
  consumePreloadedContext: () => AssistantContext | null;
  resetConversation: () => void;
}

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
      mode: "comprendre",
      selectedCandidateId: null,
      messages: [],
      isStreaming: false,
      preloadedContext: null,

      selectMode: (mode) => set({ mode }),

      selectCandidate: (candidateId) =>
        set({ selectedCandidateId: candidateId }),

      clearCandidate: () => set({ selectedCandidateId: null }),

      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),

      updateLastAssistantMessage: (content) =>
        set((state) => {
          const messages = [...state.messages];
          const lastIndex = messages.length - 1;
          if (lastIndex >= 0 && messages[lastIndex].role === "assistant") {
            messages[lastIndex] = {
              ...messages[lastIndex],
              content: messages[lastIndex].content + content,
            };
          }
          return { messages };
        }),

      setStreaming: (streaming) => set({ isStreaming: streaming }),

      setPreloadedContext: (context) =>
        set({ preloadedContext: context }),

      consumePreloadedContext: () => {
        const current = get().preloadedContext;
        set({ preloadedContext: null });
        return current;
      },

      resetConversation: () =>
        set({
          mode: "comprendre",
          messages: [],
          selectedCandidateId: null,
        }),
    }),
    {
      name: "assistant-state",
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        mode: state.mode,
        selectedCandidateId: state.selectedCandidateId,
        messages: state.messages,
      }),
    }
  )
);
