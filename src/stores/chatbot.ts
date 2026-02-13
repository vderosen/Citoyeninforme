import { create } from "zustand";

export type ChatbotMode = "learn" | "candidate" | "debate";
export type ChatbotStatus = "closed" | "mode_selection" | "active";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: { title: string; url: string; entityType: string; entityId: string }[];
  timestamp: string;
}

interface ChatbotState {
  status: ChatbotStatus;
  mode: ChatbotMode | null;
  selectedCandidateId: string | null;
  messages: ChatMessage[];
  isStreaming: boolean;
  preloadedContext: string | null;

  open: () => void;
  close: () => void;
  selectMode: (mode: ChatbotMode) => void;
  selectCandidate: (candidateId: string) => void;
  addMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setPreloadedContext: (context: string) => void;
  clearPreloadedContext: () => void;
  resetConversation: () => void;
}

let messageCounter = 0;

export function createMessageId(): string {
  messageCounter += 1;
  return `msg-${Date.now()}-${messageCounter}`;
}

export const useChatbotStore = create<ChatbotState>((set) => ({
  status: "closed",
  mode: null,
  selectedCandidateId: null,
  messages: [],
  isStreaming: false,
  preloadedContext: null,

  open: () =>
    set((state) => ({
      status: state.mode ? "active" : "mode_selection",
    })),

  close: () => set({ status: "closed" }),

  selectMode: (mode) =>
    set({
      mode,
      status: "active",
      messages: [],
      selectedCandidateId: null,
    }),

  selectCandidate: (candidateId) =>
    set({ selectedCandidateId: candidateId }),

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

  clearPreloadedContext: () => set({ preloadedContext: null }),

  resetConversation: () =>
    set({
      messages: [],
      mode: null,
      selectedCandidateId: null,
      status: "mode_selection",
    }),
}));
