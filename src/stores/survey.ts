import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "./storage";
import { migrateSurveyPersistedState } from "./surveyMigration";

export type SurveyStatus =
  | "not_started"
  | "civic_context"
  | "questionnaire"
  | "computing"
  | "results_ready"
  | "completed";

import { computeMatching } from "../services/matching";
import type { CandidateMatchResult } from "../services/matching";

export interface UserProfile {
  surveyAnswers: Record<string, string>;
  candidateRanking: CandidateMatchResult[];
  completedAt: string;
}

interface SurveyState {
  status: SurveyStatus;
  currentQuestionIndex: number;
  questionOrder: string[];
  answers: Record<string, string>;
  profile: UserProfile | null;
  datasetVersion: string | null;
  cardsSwipedSinceLastResultView: number;
  hasSeenInitialResult: boolean;
  resultsReminderDismissCount: number;
  hasVisitedResultsTab: boolean;

  startCivicContext: () => void;
  startQuestionnaire: () => void;
  markQuestionnaireActive: () => void;
  setCurrentQuestionIndex: (index: number) => void;
  setQuestionOrder: (questionOrder: string[]) => void;
  clearQuestionOrder: () => void;
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
  dismissResultsReminder: () => void;
  markResultsTabVisited: () => void;
  computeAndSetResults: (cards: import("../data/schema").StatementCard[], candidates: import("../data/schema").Candidate[], datasetVersion: string) => void;
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      status: "not_started",
      currentQuestionIndex: 0,
      questionOrder: [],
      answers: {},
      profile: null,
      datasetVersion: null,
      cardsSwipedSinceLastResultView: 0,
      hasSeenInitialResult: false,
      resultsReminderDismissCount: 0,
      hasVisitedResultsTab: false,

      startCivicContext: () => set({ status: "civic_context" }),
      startQuestionnaire: () =>
        set({ status: "questionnaire", currentQuestionIndex: 0 }),
      markQuestionnaireActive: () => set({ status: "questionnaire" }),
      setCurrentQuestionIndex: (index) =>
        set({
          currentQuestionIndex: Math.max(0, index),
        }),
      setQuestionOrder: (questionOrder) =>
        set({
          questionOrder: [...questionOrder],
        }),
      clearQuestionOrder: () => set({ questionOrder: [] }),
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
          questionOrder: [],
          answers: {},
          profile: null,
          datasetVersion: null,
          cardsSwipedSinceLastResultView: 0,
          hasSeenInitialResult: false,
          resultsReminderDismissCount: 0,
          hasVisitedResultsTab: false,
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
      dismissResultsReminder: () =>
        set((state) => ({
          resultsReminderDismissCount: Math.min(2, state.resultsReminderDismissCount + 1),
        })),
      markResultsTabVisited: () =>
        set({
          hasVisitedResultsTab: true,
        }),
      computeAndSetResults: (cards, candidates, datasetVersion) => {
        const state = get();
        if (Object.keys(state.answers).length === 0) return;

        // Import `computeMatching` at the top level to avoid bundler issues.
        const matchingResult = computeMatching({
          answers: state.answers,
          cards,
          candidates,
        });

        set({
          status: "results_ready",
          datasetVersion,
          profile: {
            surveyAnswers: state.answers,
            candidateRanking: matchingResult.candidateRanking,
            completedAt: new Date().toISOString(),
          }
        });
      },
    }),
    {
      name: "survey-state",
      version: 2,
      migrate: (persistedState, version) => {
        if (version < 2) {
          return migrateSurveyPersistedState(persistedState) as SurveyState;
        }
        return persistedState as SurveyState;
      },
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
