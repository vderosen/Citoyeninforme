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

// === Debate Types ===

export interface DebateOption {
  id: string;
  text: string;
}

export interface DebateSource {
  title: string;
  url?: string;
}

export interface CandidateProximityEntry {
  candidateId: string;
  reason: string;
}

export interface DebateSummary {
  themesExplored: string[];
  keyInsight: string;
  candidateProximity?: CandidateProximityEntry[];
}

export interface DebateTurn {
  id: string;
  statement: string;
  options: DebateOption[];
  selectedOptionId: string | null;
  themeId: string | null;
  sources: DebateSource[];
  isConclusion: boolean;
  summary: DebateSummary | null;
  timestamp: string;
}

let messageCounter = 0;

export function createMessageId(): string {
  messageCounter += 1;
  return `msg-${Date.now()}-${messageCounter}`;
}

let turnCounter = 0;

export function createTurnId(): string {
  turnCounter += 1;
  return `turn-${Date.now()}-${turnCounter}`;
}

interface AssistantState {
  mode: AssistantMode;
  selectedCandidateId: string | null;
  conversations: Record<string, ChatMessage[]>;
  isStreaming: boolean;
  preloadedContext: AssistantContext | null;

  // Debate state (ephemeral — NOT persisted)
  debateTurns: DebateTurn[];
  isDebateActive: boolean;
  isGeneratingTurn: boolean;
  debateStartThemeId: string | null;

  // Follow-up suggestions state (ephemeral — NOT persisted)
  followUpSuggestions: string[];
  isGeneratingSuggestions: boolean;

  selectMode: (mode: AssistantMode) => void;
  selectCandidate: (candidateId: string) => void;
  clearCandidate: () => void;
  addMessage: (message: ChatMessage) => void;
  updateLastAssistantMessage: (content: string) => void;
  setStreaming: (streaming: boolean) => void;
  setPreloadedContext: (context: AssistantContext) => void;
  consumePreloadedContext: () => AssistantContext | null;
  resetConversation: () => void;

  // Suggestion actions
  setSuggestions: (suggestions: string[]) => void;
  setGeneratingSuggestions: (generating: boolean) => void;
  clearSuggestions: () => void;

  // Debate actions
  startDebate: (themeId?: string | null) => void;
  selectDebateOption: (turnId: string, optionId: string) => void;
  addDebateTurn: (turn: DebateTurn) => void;
  setGeneratingTurn: (generating: boolean) => void;
  endDebate: () => void;
  resetDebate: () => void;

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

      // Debate initial state (ephemeral)
      debateTurns: [],
      isDebateActive: false,
      isGeneratingTurn: false,
      debateStartThemeId: null,

      // Suggestions initial state (ephemeral)
      followUpSuggestions: [],
      isGeneratingSuggestions: false,

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
            // Clear stale suggestions when user sends a new message
            ...(message.role === "user" ? { followUpSuggestions: [], isGeneratingSuggestions: false } : {}),
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

      // === Suggestion Actions ===

      setSuggestions: (suggestions) =>
        set({ followUpSuggestions: suggestions }),

      setGeneratingSuggestions: (generating) =>
        set({ isGeneratingSuggestions: generating }),

      clearSuggestions: () =>
        set({ followUpSuggestions: [], isGeneratingSuggestions: false }),

      // === Debate Actions ===

      startDebate: (themeId) =>
        set({
          isDebateActive: true,
          debateTurns: [],
          debateStartThemeId: themeId ?? null,
          isGeneratingTurn: false,
        }),

      selectDebateOption: (turnId, optionId) =>
        set((state) => ({
          debateTurns: state.debateTurns.map((turn) =>
            turn.id === turnId ? { ...turn, selectedOptionId: optionId } : turn
          ),
        })),

      addDebateTurn: (turn) =>
        set((state) => ({
          debateTurns: [...state.debateTurns, turn],
        })),

      setGeneratingTurn: (generating) =>
        set({ isGeneratingTurn: generating }),

      endDebate: () =>
        set({ isDebateActive: false }),

      resetDebate: () =>
        set({
          debateTurns: [],
          isDebateActive: false,
          isGeneratingTurn: false,
          debateStartThemeId: null,
        }),
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
