describe("survey store persist rehydration", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("migrates legacy single-round state into first-round history", async () => {
    const storagePayload = {
      "survey-state": JSON.stringify({
        state: {
          status: "results_ready",
          currentQuestionIndex: 5,
          questionOrder: ["CARD_0010", "CARD_0010 VS"],
          answers: {
            CARD_0010: "CARD_0010-agree",
            "CARD_0010 VS": "CARD_0010 VS-disagree",
          },
          profile: {
            surveyAnswers: {
              CARD_0010: "CARD_0010-agree",
              "CARD_0010 VS": "CARD_0010 VS-disagree",
            },
            candidateRanking: [],
            completedAt: "2026-03-01T00:00:00.000Z",
          },
          datasetVersion: "legacy",
          cardsSwipedSinceLastResultView: 3,
          hasSeenInitialResult: true,
          resultsReminderDismissCount: 1,
          hasVisitedResultsTab: true,
        },
        version: 1,
      }),
    };

    const getItem = jest.fn(
      async (key: string) =>
        storagePayload[key as keyof typeof storagePayload] ?? null
    );
    const setItem = jest.fn(async () => undefined);
    const removeItem = jest.fn(async () => undefined);

    jest.doMock("@react-native-async-storage/async-storage", () => ({
      __esModule: true,
      default: {
        getItem,
        setItem,
        removeItem,
      },
    }));

    let useSurveyStore!: typeof import("../../src/stores/survey").useSurveyStore;
    let FIRST_SURVEY_ROUND!: typeof import("../../src/stores/survey").FIRST_SURVEY_ROUND;
    let SECOND_SURVEY_ROUND!: typeof import("../../src/stores/survey").SECOND_SURVEY_ROUND;

    jest.isolateModules(() => {
      ({
        FIRST_SURVEY_ROUND,
        SECOND_SURVEY_ROUND,
        useSurveyStore,
      } = require("../../src/stores/survey"));
    });

    await (useSurveyStore as any).persist.rehydrate();

    const state = useSurveyStore.getState();
    expect(state.rounds[FIRST_SURVEY_ROUND]).toMatchObject({
      answers: {
        CARD_0010: "CARD_0010-agree",
      },
      status: "questionnaire",
      currentQuestionIndex: 1,
      questionOrder: ["CARD_0010", "CARD_0010 VS"],
      profile: null,
      datasetVersion: null,
      hasSeenInitialResult: false,
      hasVisitedResultsTab: false,
    });
    expect(state.rounds[SECOND_SURVEY_ROUND]).toMatchObject({
      answers: {},
      questionOrder: [],
      profile: null,
      status: "not_started",
    });
  });

  test("reset clears the default second-round question order only", async () => {
    const getItem = jest.fn(async () => null);
    const setItem = jest.fn(async () => undefined);
    const removeItem = jest.fn(async () => undefined);

    jest.doMock("@react-native-async-storage/async-storage", () => ({
      __esModule: true,
      default: {
        getItem,
        setItem,
        removeItem,
      },
    }));

    let useSurveyStore!: typeof import("../../src/stores/survey").useSurveyStore;
    let FIRST_SURVEY_ROUND!: typeof import("../../src/stores/survey").FIRST_SURVEY_ROUND;

    jest.isolateModules(() => {
      ({
        FIRST_SURVEY_ROUND,
        useSurveyStore,
      } = require("../../src/stores/survey"));
    });

    await (useSurveyStore as any).persist.rehydrate();

    useSurveyStore.getState().setQuestionOrder(["CARD_0001", "CARD_0002"]);
    useSurveyStore
      .getState()
      .setQuestionOrder(["LEGACY_CARD"], FIRST_SURVEY_ROUND);

    expect(
      useSurveyStore.getState().rounds.first_round.questionOrder
    ).toEqual(["LEGACY_CARD"]);
    expect(
      useSurveyStore.getState().rounds.second_round.questionOrder
    ).toEqual(["CARD_0001", "CARD_0002"]);

    useSurveyStore.getState().reset();

    expect(
      useSurveyStore.getState().rounds.second_round.questionOrder
    ).toEqual([]);
    expect(
      useSurveyStore.getState().rounds.first_round.questionOrder
    ).toEqual(["LEGACY_CARD"]);
  });
});
