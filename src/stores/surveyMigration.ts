const LEGACY_VS_SUFFIX = " VS";

type SurveyStatus =
  | "not_started"
  | "civic_context"
  | "questionnaire"
  | "computing"
  | "results_ready"
  | "completed";

interface LegacyUserProfile {
  surveyAnswers?: Record<string, string>;
  candidateRanking?: unknown[];
  completedAt?: string;
}

interface LegacySurveyState {
  status?: string;
  currentQuestionIndex?: number;
  questionOrder?: string[];
  answers?: Record<string, string>;
  profile?: LegacyUserProfile | null;
  datasetVersion?: string | null;
  cardsSwipedSinceLastResultView?: number;
  hasSeenInitialResult?: boolean;
  resultsReminderDismissCount?: number;
  hasVisitedResultsTab?: boolean;
}

interface SurveyRoundState {
  status: SurveyStatus;
  currentQuestionIndex: number;
  questionOrder: string[];
  answers: Record<string, string>;
  profile: LegacyUserProfile | null;
  datasetVersion: string | null;
  candidatesSnapshot: unknown[];
  cardsSwipedSinceLastResultView: number;
  hasSeenInitialResult: boolean;
  resultsReminderDismissCount: number;
  hasVisitedResultsTab: boolean;
}

function createEmptySurveyRoundState(): SurveyRoundState {
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

function isRoundAwareState(
  persistedState: unknown
): persistedState is { rounds: Record<string, unknown> } {
  return Boolean(
    persistedState &&
      typeof persistedState === "object" &&
      "rounds" in persistedState &&
      persistedState.rounds &&
      typeof persistedState.rounds === "object"
  );
}

function normalizeLegacyStatus(
  status: string | undefined,
  answeredCount: number,
  hasProfile: boolean
): SurveyStatus {
  if (
    status === "not_started" ||
    status === "civic_context" ||
    status === "questionnaire" ||
    status === "computing" ||
    status === "results_ready" ||
    status === "completed"
  ) {
    if (hasProfile && (status === "questionnaire" || status === "computing")) {
      return "results_ready";
    }

    return status;
  }

  if (hasProfile) return "results_ready";
  if (answeredCount > 0) return "questionnaire";
  return "not_started";
}

function migrateVersionOneState(state: LegacySurveyState): LegacySurveyState {
  const answers = state.answers;
  if (!answers || typeof answers !== "object") {
    return state;
  }

  const filteredEntries = Object.entries(answers).filter(
    ([cardId]) => !cardId.endsWith(LEGACY_VS_SUFFIX)
  );

  if (filteredEntries.length === Object.keys(answers).length) {
    return state;
  }

  const nextAnswers = Object.fromEntries(filteredEntries);
  const answeredCount = filteredEntries.length;
  const currentIndex =
    typeof state.currentQuestionIndex === "number" &&
    Number.isFinite(state.currentQuestionIndex)
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

function convertLegacyStateToRoundState(
  state: LegacySurveyState
): SurveyRoundState {
  const answers =
    state.answers && typeof state.answers === "object" ? state.answers : {};
  const answeredCount = Object.keys(answers).length;
  const hasProfile = Boolean(state.profile);
  const currentIndex =
    typeof state.currentQuestionIndex === "number" &&
    Number.isFinite(state.currentQuestionIndex)
      ? state.currentQuestionIndex
      : answeredCount;
  const cardsSwipedSinceLastResultView =
    typeof state.cardsSwipedSinceLastResultView === "number" &&
    Number.isFinite(state.cardsSwipedSinceLastResultView)
      ? state.cardsSwipedSinceLastResultView
      : 0;

  return {
    status: normalizeLegacyStatus(state.status, answeredCount, hasProfile),
    currentQuestionIndex: Math.max(0, Math.min(currentIndex, answeredCount)),
    questionOrder: Array.isArray(state.questionOrder) ? [...state.questionOrder] : [],
    answers: { ...answers },
    profile: state.profile ?? null,
    datasetVersion: state.datasetVersion ?? null,
    candidatesSnapshot: [],
    cardsSwipedSinceLastResultView: Math.max(
      0,
      Math.min(cardsSwipedSinceLastResultView, answeredCount)
    ),
    hasSeenInitialResult: Boolean(state.hasSeenInitialResult),
    resultsReminderDismissCount:
      typeof state.resultsReminderDismissCount === "number" &&
      Number.isFinite(state.resultsReminderDismissCount)
        ? Math.max(0, Math.min(2, state.resultsReminderDismissCount))
        : 0,
    hasVisitedResultsTab: Boolean(state.hasVisitedResultsTab),
  };
}

export function migrateSurveyPersistedState(
  persistedState: unknown,
  version: number
): unknown {
  if (!persistedState || typeof persistedState !== "object") {
    return persistedState;
  }

  if (isRoundAwareState(persistedState)) {
    return persistedState;
  }

  const legacyState =
    version < 2
      ? migrateVersionOneState(persistedState as LegacySurveyState)
      : (persistedState as LegacySurveyState);

  return {
    rounds: {
      first_round: convertLegacyStateToRoundState(legacyState),
      second_round: createEmptySurveyRoundState(),
    },
  };
}
