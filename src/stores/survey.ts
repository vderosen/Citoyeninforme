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
  cardsSwipedSinceLastResultView: number;
  hasSeenInitialResult: boolean;

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
  markResultsViewed: () => void;
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      status: "not_started",
      currentQuestionIndex: 0,
      answers: {},
      profile: null,
      datasetVersion: null,
      cardsSwipedSinceLastResultView: 0,
      hasSeenInitialResult: false,

      startCivicContext: () => set({ status: "civic_context" }),
      startQuestionnaire: () =>
        set({ status: "questionnaire", currentQuestionIndex: 0 }),
      markQuestionnaireActive: () => set({ status: "questionnaire" }),
      answerQuestion: (questionId, optionId) =>
        set((state) => ({
          answers: { ...state.answers, [questionId]: optionId },
          cardsSwipedSinceLastResultView: state.cardsSwipedSinceLastResultView + 1,
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
            cardsSwipedSinceLastResultView: Math.max(0, state.cardsSwipedSinceLastResultView - 1),
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
          cardsSwipedSinceLastResultView: 0,
          hasSeenInitialResult: false,
        }),
      isResultsStale: (currentDatasetVersion) => {
        const state = get();
        return state.datasetVersion !== null && state.datasetVersion !== currentDatasetVersion;
      },
      markResultsViewed: () =>
        set({
          hasSeenInitialResult: true,
          cardsSwipedSinceLastResultView: 0,
        }),
    }),
    {
      name: "survey-state",
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
