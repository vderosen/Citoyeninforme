import { migrateSurveyPersistedState } from "../../src/stores/surveyMigration";

describe("survey persisted-state migration", () => {
  test("version 1 data becomes first-round history and removes legacy VS answers", () => {
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

    const migrated = migrateSurveyPersistedState(input, 1) as any;

    expect(migrated.rounds.first_round.answers).toEqual({
      CARD_0010: "CARD_0010-agree",
    });
    expect(migrated.rounds.first_round.status).toBe("questionnaire");
    expect(migrated.rounds.first_round.currentQuestionIndex).toBe(1);
    expect(migrated.rounds.first_round.profile).toBeNull();
    expect(migrated.rounds.first_round.datasetVersion).toBeNull();
    expect(migrated.rounds.first_round.hasSeenInitialResult).toBe(false);
    expect(migrated.rounds.first_round.hasVisitedResultsTab).toBe(false);
    expect(migrated.rounds.first_round.cardsSwipedSinceLastResultView).toBe(1);
    expect(migrated.rounds.second_round.answers).toEqual({});
  });

  test("version 2 data is preserved as first-round results", () => {
    const input = {
      status: "results_ready",
      currentQuestionIndex: 12,
      questionOrder: ["CARD_A", "CARD_B"],
      answers: {
        CARD_A: "CARD_A-agree",
      },
      profile: {
        surveyAnswers: {
          CARD_A: "CARD_A-agree",
        },
        candidateRanking: [{ candidateId: "cand-a", alignmentScore: 5 }],
        completedAt: "2026-03-16T12:00:00.000Z",
      },
      datasetVersion: "1.0.0",
      hasSeenInitialResult: true,
      hasVisitedResultsTab: true,
      cardsSwipedSinceLastResultView: 0,
      resultsReminderDismissCount: 1,
    };

    const migrated = migrateSurveyPersistedState(input, 2) as any;

    expect(migrated.rounds.first_round).toMatchObject({
      status: "results_ready",
      currentQuestionIndex: 1,
      questionOrder: ["CARD_A", "CARD_B"],
      answers: {
        CARD_A: "CARD_A-agree",
      },
      profile: input.profile,
      datasetVersion: "1.0.0",
      hasSeenInitialResult: true,
      hasVisitedResultsTab: true,
      resultsReminderDismissCount: 1,
    });
    expect(migrated.rounds.second_round.status).toBe("not_started");
  });

  test("returns round-aware input unchanged", () => {
    const input = {
      rounds: {
        first_round: { status: "results_ready" },
        second_round: { status: "not_started" },
      },
    };

    const migrated = migrateSurveyPersistedState(input, 3);
    expect(migrated).toBe(input);
  });
});
