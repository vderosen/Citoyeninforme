describe("survey store persist rehydration", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test("runs persist migration and removes legacy VS answers during rehydration", async () => {
    const storagePayload = {
      "survey-state": JSON.stringify({
        state: {
          status: "results_ready",
          currentQuestionIndex: 5,
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

    const getItem = jest.fn(async (key: string) => storagePayload[key as keyof typeof storagePayload] ?? null);
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

    let useSurveyStore: typeof import("../../src/stores/survey").useSurveyStore;
    jest.isolateModules(() => {
      ({ useSurveyStore } = require("../../src/stores/survey"));
    });

    await (useSurveyStore as any).persist.rehydrate();

    const state = useSurveyStore.getState();
    expect(state.answers).toEqual({
      CARD_0010: "CARD_0010-agree",
    });
    expect(state.status).toBe("questionnaire");
    expect(state.currentQuestionIndex).toBe(1);
    expect(state.profile).toBeNull();
    expect(state.datasetVersion).toBeNull();
    expect(state.hasSeenInitialResult).toBe(false);
    expect(state.hasVisitedResultsTab).toBe(false);
  });
});
