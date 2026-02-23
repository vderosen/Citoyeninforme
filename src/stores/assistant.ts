import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./storage";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

let messageCounter = 0;

export function createMessageId(): string {
  messageCounter += 1;
  return `msg-${Date.now()}-${messageCounter}`;
}

interface AssistantState {
  selectedCandidateId: string | null;
  conversations: Record<string, ChatMessage[]>;
  isStreaming: boolean;

  selectCandidate: (candidateId: string) => void;
  clearCandidate: () => void;
  addMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  resetConversation: () => void;

  getConversationKey: () => string;
  getCurrentMessages: () => ChatMessage[];
}

export const useAssistantStore = create<AssistantState>()(
  persist(
    (set, get) => ({
      selectedCandidateId: null,
      conversations: {},
      isStreaming: false,

      selectCandidate: (candidateId) =>
        set({ selectedCandidateId: candidateId }),

      clearCandidate: () => set({ selectedCandidateId: null }),

      getConversationKey: () => {
        const { selectedCandidateId } = get();
        return selectedCandidateId
          ? `candidate:${selectedCandidateId}`
          : "general";
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
      version: 2,
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as Record<string, unknown>;
        if (version < 2) {
          // Clear old v1 conversations — they used different format
          return {
            selectedCandidateId: null,
            conversations: {},
            isStreaming: false,
          };
        }
        return state;
      },
      partialize: (state) => ({
        selectedCandidateId: state.selectedCandidateId,
        conversations: state.conversations,
      }),
    }
  )
);
