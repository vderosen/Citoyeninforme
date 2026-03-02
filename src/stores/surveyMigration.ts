const LEGACY_VS_SUFFIX = " VS";

interface SurveyMigrationState {
  status?: string;
  currentQuestionIndex?: number;
  answers?: Record<string, string>;
  profile?: unknown;
  datasetVersion?: string | null;
  hasSeenInitialResult?: boolean;
  hasVisitedResultsTab?: boolean;
  cardsSwipedSinceLastResultView?: number;
}

export function migrateSurveyPersistedState(persistedState: unknown): unknown {
  if (!persistedState || typeof persistedState !== "object") {
    return persistedState;
  }

  const state = persistedState as SurveyMigrationState;
  const answers = state.answers;
  if (!answers || typeof answers !== "object") {
    return persistedState;
  }

  const filteredEntries = Object.entries(answers).filter(
    ([cardId]) => !cardId.endsWith(LEGACY_VS_SUFFIX)
  );

  if (filteredEntries.length === Object.keys(answers).length) {
    return persistedState;
  }

  const nextAnswers = Object.fromEntries(filteredEntries);
  const answeredCount = filteredEntries.length;
  const currentIndex =
    typeof state.currentQuestionIndex === "number" && Number.isFinite(state.currentQuestionIndex)
      ? state.currentQuestionIndex
      : answeredCount;
  const cardsSwipedSinceLastResultView =
    typeof state.cardsSwipedSinceLastResultView === "number" &&
    Number.isFinite(state.cardsSwipedSinceLastResultView)
      ? state.cardsSwipedSinceLastResultView
      : 0;

  return {
    ...state,
    status: answeredCount > 0 ? "questionnaire" : "not_started",
    currentQuestionIndex: Math.max(0, Math.min(currentIndex, answeredCount)),
    answers: nextAnswers,
    profile: null,
    datasetVersion: null,
    hasSeenInitialResult: false,
    hasVisitedResultsTab: false,
    cardsSwipedSinceLastResultView: Math.max(
      0,
      Math.min(cardsSwipedSinceLastResultView, answeredCount)
    ),
  };
}
