import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";

export type SurveyStatus =
  | "not_started"
  | "civic_context"
  | "questionnaire"
  | "computing"
  | "results_ready"
  | "completed";

export interface ThemeJustification {
  themeId: string;
  alignment: "agree" | "partial" | "disagree";
  weight: number;
}

export interface CandidateMatch {
  candidateId: string;
  alignmentScore: number;
  justification: ThemeJustification[];
}

export interface Contradiction {
  themeA: string;
  themeB: string;
  description: string;
  severity: "low" | "medium" | "high";
}

export interface UserProfile {
  surveyAnswers: Record<string, string>;
  themeScores: Record<string, number>;
  importanceWeights: Record<string, number>;
  contradictions: Contradiction[];
  candidateRanking: CandidateMatch[];
  completedAt: string;
}

interface SurveyState {
  status: SurveyStatus;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  importanceWeights: Record<string, number>;
  profile: UserProfile | null;

  startCivicContext: () => void;
  startQuestionnaire: () => void;
  answerQuestion: (questionId: string, optionId: string) => void;
  setImportanceWeight: (themeId: string, weight: number) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  setComputing: () => void;
  setResults: (profile: UserProfile) => void;
  complete: () => void;
  reset: () => void;
}

const storage = new MMKV({ id: "survey-storage" });

const mmkvStorage = {
  getItem: (name: string) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  setItem: (name: string, value: string) => {
    storage.set(name, value);
  },
  removeItem: (name: string) => {
    storage.delete(name);
  },
};

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set) => ({
      status: "not_started",
      currentQuestionIndex: 0,
      answers: {},
      importanceWeights: {},
      profile: null,

      startCivicContext: () => set({ status: "civic_context" }),
      startQuestionnaire: () =>
        set({ status: "questionnaire", currentQuestionIndex: 0 }),
      answerQuestion: (questionId, optionId) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: optionId },
        })),
      setImportanceWeight: (themeId, weight) =>
        set((state) => ({
          importanceWeights: {
            ...state.importanceWeights,
            [themeId]: weight,
          },
        })),
      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        })),
      previousQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
        })),
      setComputing: () => set({ status: "computing" }),
      setResults: (profile) =>
        set({ status: "results_ready", profile }),
      complete: () => set({ status: "completed" }),
      reset: () =>
        set({
          status: "not_started",
          currentQuestionIndex: 0,
          answers: {},
          importanceWeights: {},
          profile: null,
        }),
    }),
    {
      name: "survey-state",
      storage: createJSONStorage(() => mmkvStorage),
    }
  )
);
