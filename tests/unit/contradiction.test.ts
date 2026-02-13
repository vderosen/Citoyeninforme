import { detectContradictions } from "../../src/services/contradiction";
import type { SurveyQuestion } from "../../src/data/schema";

const mockQuestions: SurveyQuestion[] = [
  {
    id: "q1",
    electionId: "test",
    text: "Budget question",
    themeIds: ["budget"],
    options: [
      { id: "q1-a", text: "Cut spending", themeScores: { budget: 2 } },
      { id: "q1-b", text: "Balance", themeScores: { budget: 0 } },
    ],
    order: 1,
  },
  {
    id: "q2",
    electionId: "test",
    text: "Social question",
    themeIds: ["social"],
    options: [
      { id: "q2-a", text: "More services", themeScores: { social: 2 } },
      { id: "q2-b", text: "Less", themeScores: { social: -1 } },
    ],
    order: 2,
  },
];

describe("detectContradictions", () => {
  it("detects budget vs social contradiction", () => {
    const scores = { budget: 2, social: 2 };
    const answers = { q1: "q1-a", q2: "q2-a" };
    const results = detectContradictions(scores, answers, mockQuestions);
    expect(results.length).toBeGreaterThanOrEqual(1);
    const budgetSocial = results.find(
      (r) => r.themeA === "budget" && r.themeB === "social"
    );
    expect(budgetSocial).toBeDefined();
    expect(budgetSocial!.severity).toBe("high");
  });

  it("returns no contradictions when scores are balanced", () => {
    const scores = { budget: 0, social: 0 };
    const answers = { q1: "q1-b", q2: "q2-b" };
    const results = detectContradictions(scores, answers, mockQuestions);
    expect(results.length).toBe(0);
  });

  it("returns no contradictions when only one theme is extreme", () => {
    const scores = { budget: 2, social: -1 };
    const answers = { q1: "q1-a" };
    const results = detectContradictions(scores, answers, mockQuestions);
    const budgetSocial = results.find(
      (r) => r.themeA === "budget" && r.themeB === "social"
    );
    expect(budgetSocial).toBeUndefined();
  });

  it("includes evidence with question references", () => {
    const scores = { budget: 2, social: 2 };
    const answers = { q1: "q1-a", q2: "q2-a" };
    const results = detectContradictions(scores, answers, mockQuestions);
    const contradiction = results[0];
    expect(contradiction.evidence.length).toBeGreaterThan(0);
    expect(contradiction.evidence[0].questionId).toBeDefined();
  });

  it("detects transport vs ecology contradiction", () => {
    const scores = { transport: -2, ecologie: 2 };
    const transportQ: SurveyQuestion = {
      id: "qt",
      electionId: "test",
      text: "Transport",
      themeIds: ["transport"],
      options: [{ id: "qt-a", text: "Cars", themeScores: { transport: -2 } }],
      order: 1,
    };
    const ecoQ: SurveyQuestion = {
      id: "qe",
      electionId: "test",
      text: "Ecology",
      themeIds: ["ecologie"],
      options: [{ id: "qe-a", text: "Green", themeScores: { ecologie: 2 } }],
      order: 2,
    };
    const results = detectContradictions(
      scores,
      { qt: "qt-a", qe: "qe-a" },
      [transportQ, ecoQ]
    );
    const transportEco = results.find(
      (r) => r.themeA === "transport" && r.themeB === "ecologie"
    );
    expect(transportEco).toBeDefined();
    expect(transportEco!.severity).toBe("medium");
  });
});
