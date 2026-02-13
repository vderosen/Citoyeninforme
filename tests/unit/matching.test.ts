import { computeMatching } from "../../src/services/matching";
import type { MatchingInput } from "../../src/services/matching";

function createInput(overrides?: Partial<MatchingInput>): MatchingInput {
  return {
    answers: { q1: "q1-a", q2: "q2-b" },
    importanceWeights: { "theme-1": 0.8, "theme-2": 0.5 },
    questions: [
      {
        id: "q1",
        themeIds: ["theme-1"],
        options: [
          { id: "q1-a", themeScores: { "theme-1": 2 } },
          { id: "q1-b", themeScores: { "theme-1": -1 } },
        ],
      },
      {
        id: "q2",
        themeIds: ["theme-2"],
        options: [
          { id: "q2-a", themeScores: { "theme-2": 2 } },
          { id: "q2-b", themeScores: { "theme-2": 0 } },
        ],
      },
    ],
    candidates: [
      { candidateId: "c1", positionScores: { "theme-1": 2, "theme-2": 1 } },
      { candidateId: "c2", positionScores: { "theme-1": -2, "theme-2": -1 } },
    ],
    ...overrides,
  };
}

describe("computeMatching", () => {
  it("is deterministic — identical inputs produce identical outputs (FR-009)", () => {
    const input = createInput();
    const result1 = computeMatching(input);
    const result2 = computeMatching(input);
    expect(result1).toEqual(result2);
  });

  it("runs deterministically 100 times", () => {
    const input = createInput();
    const baseline = computeMatching(input);
    for (let i = 0; i < 100; i++) {
      expect(computeMatching(input)).toEqual(baseline);
    }
  });

  it("computes user theme scores from answers", () => {
    const input = createInput();
    const result = computeMatching(input);
    expect(result.themeScores["theme-1"]).toBe(2);
    expect(result.themeScores["theme-2"]).toBe(0);
  });

  it("ranks candidates by alignment score", () => {
    const input = createInput();
    const result = computeMatching(input);
    expect(result.candidateRanking[0].candidateId).toBe("c1");
    expect(result.candidateRanking[1].candidateId).toBe("c2");
    expect(result.candidateRanking[0].alignmentScore).toBeGreaterThan(
      result.candidateRanking[1].alignmentScore
    );
  });

  it("handles tied scores by keeping both candidates (Edge Case 3)", () => {
    const input = createInput({
      candidates: [
        { candidateId: "c1", positionScores: { "theme-1": 1, "theme-2": 0 } },
        { candidateId: "c2", positionScores: { "theme-1": 1, "theme-2": 0 } },
      ],
    });
    const result = computeMatching(input);
    expect(result.candidateRanking[0].alignmentScore).toBe(
      result.candidateRanking[1].alignmentScore
    );
  });

  it("handles all-neutral answers", () => {
    const input = createInput({
      answers: {},
    });
    const result = computeMatching(input);
    expect(result.themeScores).toEqual({});
    for (const candidate of result.candidateRanking) {
      expect(candidate.alignmentScore).toBe(50);
    }
  });

  it("includes theme breakdown for each candidate", () => {
    const input = createInput();
    const result = computeMatching(input);
    for (const candidate of result.candidateRanking) {
      expect(candidate.themeBreakdown.length).toBeGreaterThan(0);
      for (const detail of candidate.themeBreakdown) {
        expect(["agree", "partial", "disagree"]).toContain(detail.alignment);
      }
    }
  });

  it("alignment score is between 0 and 100", () => {
    const input = createInput();
    const result = computeMatching(input);
    for (const candidate of result.candidateRanking) {
      expect(candidate.alignmentScore).toBeGreaterThanOrEqual(0);
      expect(candidate.alignmentScore).toBeLessThanOrEqual(100);
    }
  });
});
