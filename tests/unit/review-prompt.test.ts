import { isEligibleForResultsReviewPrompt } from "../../src/utils/review-prompt";
import type { UserProfile } from "../../src/stores/survey";

function buildProfile(rankingCount: number): UserProfile {
  return {
    surveyAnswers: {},
    candidateRanking: Array.from({ length: rankingCount }, (_, index) => ({
      candidateId: `candidate-${index}`,
      alignmentScore: 50,
      cardBreakdown: [],
    })),
    completedAt: "2026-03-03T00:00:00.000Z",
  };
}

describe("review prompt eligibility", () => {
  test("returns false when user has fewer than 5 answers", () => {
    expect(
      isEligibleForResultsReviewPrompt({
        answersCount: 4,
        hasSeenResultsRatingPrompt: false,
        profile: buildProfile(3),
      })
    ).toBe(false);
  });

  test("returns false when results are missing", () => {
    expect(
      isEligibleForResultsReviewPrompt({
        answersCount: 8,
        hasSeenResultsRatingPrompt: false,
        profile: null,
      })
    ).toBe(false);
  });

  test("returns false when prompt has already been shown", () => {
    expect(
      isEligibleForResultsReviewPrompt({
        answersCount: 8,
        hasSeenResultsRatingPrompt: true,
        profile: buildProfile(3),
      })
    ).toBe(false);
  });

  test("returns true for first qualifying results visit", () => {
    expect(
      isEligibleForResultsReviewPrompt({
        answersCount: 5,
        hasSeenResultsRatingPrompt: false,
        profile: buildProfile(3),
      })
    ).toBe(true);
  });
});
