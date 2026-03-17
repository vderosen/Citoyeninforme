import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Candidate, StatementCard } from "../data/schema";
import { computeMatching } from "../services/matching";
import type { CandidateMatchResult } from "../services/matching";
import { zustandStorage } from "./storage";
import { migrateSurveyPersistedState } from "./surveyMigration";

export const FIRST_SURVEY_ROUND = "first_round" as const;
export const SECOND_SURVEY_ROUND = "second_round" as const;
export const DEFAULT_SURVEY_ROUND = SECOND_SURVEY_ROUND;

export type SurveyRoundId =
  | typeof FIRST_SURVEY_ROUND
  | typeof SECOND_SURVEY_ROUND;

export type SurveyStatus =
  | "not_started"
  | "civic_context"
  | "questionnaire"
  | "computing"
  | "results_ready"
  | "completed";

export interface UserProfile {
  surveyAnswers: Record<string, string>;
  candidateRanking: CandidateMatchResult[];
  completedAt: string;
}

export interface SurveyRoundState {
  status: SurveyStatus;
  currentQuestionIndex: number;
  questionOrder: string[];
  answers: Record<string, string>;
  profile: UserProfile | null;
  datasetVersion: string | null;
  candidatesSnapshot: Candidate[];
  cardsSwipedSinceLastResultView: number;
  hasSeenInitialResult: boolean;
  resultsReminderDismissCount: number;
  hasVisitedResultsTab: boolean;
}

interface SurveyState {
  rounds: Record<SurveyRoundId, SurveyRoundState>;

  startCivicContext: (roundId?: SurveyRoundId) => void;
  startQuestionnaire: (roundId?: SurveyRoundId) => void;
  markQuestionnaireActive: (roundId?: SurveyRoundId) => void;
  setCurrentQuestionIndex: (index: number, roundId?: SurveyRoundId) => void;
  setQuestionOrder: (questionOrder: string[], roundId?: SurveyRoundId) => void;
  clearQuestionOrder: (roundId?: SurveyRoundId) => void;
  answerQuestion: (
    questionId: string,
    optionId: string,
    roundId?: SurveyRoundId
  ) => void;
  nextQuestion: (roundId?: SurveyRoundId) => void;
  previousQuestion: (roundId?: SurveyRoundId) => void;
  clearAnswer: (cardId: string, roundId?: SurveyRoundId) => void;
  setComputing: (roundId?: SurveyRoundId) => void;
  setResults: (
    profile: UserProfile,
    datasetVersion: string,
    candidates: Candidate[],
    roundId?: SurveyRoundId
  ) => void;
  complete: (roundId?: SurveyRoundId) => void;
  reset: (roundId?: SurveyRoundId) => void;
  resetAll: () => void;
  isResultsStale: (
    currentDatasetVersion: string,
    roundId?: SurveyRoundId
  ) => boolean;
  markResultsViewed: (roundId?: SurveyRoundId) => void;
  dismissResultsReminder: (roundId?: SurveyRoundId) => void;
  markResultsTabVisited: (roundId?: SurveyRoundId) => void;
  ensureRoundCandidateSnapshot: (
    roundId: SurveyRoundId,
    candidates: Candidate[]
  ) => void;
  computeAndSetResults: (
    cards: StatementCard[],
    candidates: Candidate[],
    datasetVersion: string,
    roundId?: SurveyRoundId
  ) => void;
}

export function createEmptySurveyRoundState(): SurveyRoundState {
  return {
    status: "not_started",
    currentQuestionIndex: 0,
    questionOrder: [],
    answers: {},
    profile: null,
    datasetVersion: null,
    candidatesSnapshot: [],
    cardsSwipedSinceLastResultView: 0,
    hasSeenInitialResult: false,
    resultsReminderDismissCount: 0,
    hasVisitedResultsTab: false,
  };
}

function cloneCandidates(candidates: Candidate[]): Candidate[] {
  return candidates.map((candidate) => ({ ...candidate }));
}

function updateRoundState(
  state: SurveyState,
  roundId: SurveyRoundId,
  updater: (roundState: SurveyRoundState) => Partial<SurveyRoundState>
): Pick<SurveyState, "rounds"> {
  const roundState = state.rounds[roundId];

  return {
    rounds: {
      ...state.rounds,
      [roundId]: {
        ...roundState,
        ...updater(roundState),
      },
    },
  };
}

export const useSurveyStore = create<SurveyState>()(
  persist(
    (set, get) => ({
      rounds: {
        [FIRST_SURVEY_ROUND]: createEmptySurveyRoundState(),
        [SECOND_SURVEY_ROUND]: createEmptySurveyRoundState(),
      },

      startCivicContext: (roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, () => ({ status: "civic_context" }))
        ),
      startQuestionnaire: (roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, () => ({
            status: "questionnaire",
            currentQuestionIndex: 0,
          }))
        ),
      markQuestionnaireActive: (roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, () => ({ status: "questionnaire" }))
        ),
      setCurrentQuestionIndex: (index, roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, () => ({
            currentQuestionIndex: Math.max(0, index),
          }))
        ),
      setQuestionOrder: (questionOrder, roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, () => ({
            questionOrder: [...questionOrder],
          }))
        ),
      clearQuestionOrder: (roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, () => ({ questionOrder: [] }))
        ),
      answerQuestion: (questionId, optionId, roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, (roundState) => ({
            answers: { ...roundState.answers, [questionId]: optionId },
            cardsSwipedSinceLastResultView:
              roundState.cardsSwipedSinceLastResultView + 1,
          }))
        ),
      nextQuestion: (roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, (roundState) => ({
            currentQuestionIndex: roundState.currentQuestionIndex + 1,
          }))
        ),
      previousQuestion: (roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, (roundState) => ({
            currentQuestionIndex: Math.max(
              0,
              roundState.currentQuestionIndex - 1
            ),
          }))
        ),
      clearAnswer: (cardId, roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, (roundState) => {
            const { [cardId]: _, ...rest } = roundState.answers;

            return {
              answers: rest,
              currentQuestionIndex: Math.max(
                0,
                roundState.currentQuestionIndex - 1
              ),
              cardsSwipedSinceLastResultView: Math.max(
                0,
                roundState.cardsSwipedSinceLastResultView - 1
              ),
            };
          })
        ),
      setComputing: (roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, () => ({ status: "computing" }))
        ),
      setResults: (
        profile,
        datasetVersion,
        candidates,
        roundId = DEFAULT_SURVEY_ROUND
      ) =>
        set((state) =>
          updateRoundState(state, roundId, () => ({
            status: "results_ready",
            profile,
            datasetVersion,
            candidatesSnapshot: cloneCandidates(candidates),
          }))
        ),
      complete: (roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, () => ({ status: "completed" }))
        ),
      reset: (roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) => ({
          rounds: {
            ...state.rounds,
            [roundId]: createEmptySurveyRoundState(),
          },
        })),
      resetAll: () =>
        set({
          rounds: {
            [FIRST_SURVEY_ROUND]: createEmptySurveyRoundState(),
            [SECOND_SURVEY_ROUND]: createEmptySurveyRoundState(),
          },
        }),
      isResultsStale: (currentDatasetVersion, roundId = DEFAULT_SURVEY_ROUND) => {
        const roundState = get().rounds[roundId];
        return (
          roundState.datasetVersion !== null &&
          roundState.datasetVersion !== currentDatasetVersion
        );
      },
      markResultsViewed: (roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, () => ({
            hasSeenInitialResult: true,
            cardsSwipedSinceLastResultView: 0,
          }))
        ),
      dismissResultsReminder: (roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, (roundState) => ({
            resultsReminderDismissCount: Math.min(
              2,
              roundState.resultsReminderDismissCount + 1
            ),
          }))
        ),
      markResultsTabVisited: (roundId = DEFAULT_SURVEY_ROUND) =>
        set((state) =>
          updateRoundState(state, roundId, () => ({
            hasVisitedResultsTab: true,
          }))
        ),
      ensureRoundCandidateSnapshot: (roundId, candidates) =>
        set((state) => {
          const roundState = state.rounds[roundId];
          const hasStoredProgress =
            roundState.profile !== null ||
            Object.keys(roundState.answers).length > 0;

          if (
            !hasStoredProgress ||
            roundState.candidatesSnapshot.length > 0
          ) {
            return state;
          }

          return updateRoundState(state, roundId, () => ({
            candidatesSnapshot: cloneCandidates(candidates),
          }));
        }),
      computeAndSetResults: (
        cards,
        candidates,
        datasetVersion,
        roundId = DEFAULT_SURVEY_ROUND
      ) => {
        const roundState = get().rounds[roundId];
        if (Object.keys(roundState.answers).length === 0) return;

        const matchingResult = computeMatching({
          answers: roundState.answers,
          cards,
          candidates,
        });

        set((state) =>
          updateRoundState(state, roundId, () => ({
            status: "results_ready",
            datasetVersion,
            candidatesSnapshot: cloneCandidates(candidates),
            profile: {
              surveyAnswers: { ...roundState.answers },
              candidateRanking: matchingResult.candidateRanking,
              completedAt: new Date().toISOString(),
            },
          }))
        );
      },
    }),
    {
      name: "survey-state",
      version: 3,
      migrate: (persistedState, version) =>
        migrateSurveyPersistedState(persistedState, version) as SurveyState,
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);
