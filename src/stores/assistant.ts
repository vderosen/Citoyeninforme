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
  conversations: Record<string, ChatMessage[]>;
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

  getConversationKey: () => string;
  getCurrentMessages: () => ChatMessage[];
}

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
      mode: "comprendre",
      selectedCandidateId: null,
      conversations: {},
      isStreaming: false,
      preloadedContext: null,

      selectMode: (mode) => set({ mode }),

      selectCandidate: (candidateId) =>
        set({ selectedCandidateId: candidateId }),

      clearCandidate: () => set({ selectedCandidateId: null }),

      getConversationKey: () => {
        const { mode, selectedCandidateId } = get();
        return mode === "parler" && selectedCandidateId
          ? `parler:${selectedCandidateId}`
          : mode;
      },

      getCurrentMessages: () => {
        const { conversations } = get();
        const key = get().getConversationKey();
        return conversations[key] ?? [];
      },

      addMessage: (message) =>
        set((state) => {
          const key = get().getConversationKey();
          const current = state.conversations[key] ?? [];
          return {
            conversations: {
              ...state.conversations,
              [key]: [...current, message],
            },
          };
        }),

      updateLastAssistantMessage: (content) =>
        set((state) => {
          const key = get().getConversationKey();
          const current = [...(state.conversations[key] ?? [])];
          const lastIndex = current.length - 1;
          if (lastIndex >= 0 && current[lastIndex].role === "assistant") {
            current[lastIndex] = {
              ...current[lastIndex],
              content: current[lastIndex].content + content,
            };
          }
          return {
            conversations: {
              ...state.conversations,
              [key]: current,
            },
          };
        }),

      setStreaming: (streaming) => set({ isStreaming: streaming }),

      setPreloadedContext: (context) =>
        set({ preloadedContext: context }),

      consumePreloadedContext: () => {
        const current = get().preloadedContext;
        set({ preloadedContext: null });
        return current;
      },

      resetConversation: () => {
        const key = get().getConversationKey();
        set((state) => ({
          conversations: {
            ...state.conversations,
            [key]: [],
          },
        }));
      },
    }),
    {
      name: "assistant-state",
      storage: createJSONStorage(() => zustandStorage),
      version: 1,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version === 0 && state.messages) {
          return {
            ...state,
            conversations: {
              comprendre: state.messages,
            },
            messages: undefined,
          };
        }
        return state;
      },
      partialize: (state) => ({
        mode: state.mode,
        selectedCandidateId: state.selectedCandidateId,
        conversations: state.conversations,
      }),
    }
  )
);
