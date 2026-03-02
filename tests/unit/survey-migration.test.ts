import { migrateSurveyPersistedState } from "../../src/stores/surveyMigration";

describe("survey persisted-state migration", () => {
  test("removes legacy `... VS` answers and invalidates stale results", () => {
    const input = {
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
        completedAt: "2026-01-01T00:00:00.000Z",
      },
      datasetVersion: "old",
      hasSeenInitialResult: true,
      hasVisitedResultsTab: true,
      cardsSwipedSinceLastResultView: 4,
      resultsReminderDismissCount: 1,
    };

    const migrated = migrateSurveyPersistedState(input) as any;

    expect(migrated.answers).toEqual({
      CARD_0010: "CARD_0010-agree",
    });
    expect(migrated.status).toBe("questionnaire");
    expect(migrated.currentQuestionIndex).toBe(1);
    expect(migrated.profile).toBeNull();
    expect(migrated.datasetVersion).toBeNull();
    expect(migrated.hasSeenInitialResult).toBe(false);
    expect(migrated.hasVisitedResultsTab).toBe(false);
    expect(migrated.cardsSwipedSinceLastResultView).toBe(1);
  });

  test("returns input unchanged when no legacy VS answer exists", () => {
    const input = {
      status: "questionnaire",
      currentQuestionIndex: 1,
      answers: {
        CARD_0010: "CARD_0010-agree",
      },
      profile: null,
    };

    const migrated = migrateSurveyPersistedState(input);
    expect(migrated).toBe(input);
  });
});
