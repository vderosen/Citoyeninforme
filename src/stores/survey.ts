import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./storage";

export type SurveyStatus =
  | "not_started"
  | "civic_context"
  | "questionnaire"
  | "computing"
  | "results_ready"
  | "completed";

import type { CandidateMatchResult } from "../services/matching";

export interface UserProfile {
  surveyAnswers: Record<string, string>;
  candidateRanking: CandidateMatchResult[];
  completedAt: string;
}

interface SurveyState {
  status: SurveyStatus;
  currentQuestionIndex: number;
  answers: Record<string, string>;
  profile: UserProfile | null;
  datasetVersion: string | null;

  startCivicContext: () => void;
  startQuestionnaire: () => void;
  markQuestionnaireActive: () => void;
  answerQuestion: (questionId: string, optionId: string) => void;
  nextQuestion: () => void;
  previousQuestion: () => void;
  clearAnswer: (cardId: string) => void;
  setComputing: () => void;
  setResults: (profile: UserProfile, datasetVersion: string) => void;
  complete: () => void;
  reset: () => void;
  isResultsStale: (currentDatasetVersion: string) => boolean;
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      status: "not_started",
      currentQuestionIndex: 0,
      answers: {},
      importanceWeights: {},
      profile: null,
      datasetVersion: null,

      startCivicContext: () => set({ status: "civic_context" }),
      startQuestionnaire: () =>
        set({ status: "questionnaire", currentQuestionIndex: 0 }),
      markQuestionnaireActive: () => set({ status: "questionnaire" }),
      answerQuestion: (questionId, optionId) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: optionId },
        })),
      nextQuestion: () =>
        set((state) => ({
          currentQuestionIndex: state.currentQuestionIndex + 1,
        })),
      previousQuestion: () =>
        set((state) => ({
          currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
        })),
      clearAnswer: (cardId: string) =>
        set((state) => {
          const { [cardId]: _, ...rest } = state.answers;
          return {
            answers: rest,
            currentQuestionIndex: Math.max(0, state.currentQuestionIndex - 1),
          };
        }),
      setComputing: () => set({ status: "computing" }),
      setResults: (profile, datasetVersion) =>
        set({ status: "results_ready", profile, datasetVersion }),
      complete: () => set({ status: "completed" }),
      reset: () =>
        set({
          status: "not_started",
          currentQuestionIndex: 0,
          answers: {},
          profile: null,
          datasetVersion: null,
        }),
      isResultsStale: (currentDatasetVersion) => {
        const state = get();
        return state.datasetVersion !== null && state.datasetVersion !== currentDatasetVersion;
      },
    }),
    {
      name: "survey-state",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
