import { loadBundledDataset } from "../../src/data/loader";
import { computeMatching } from "../../src/services/matching";

describe("VS card handling", () => {
  test("hides `... VS` cards from the swipe deck and merges their candidates as opposing", () => {
    const dataset = loadBundledDataset();

    expect(dataset.statementCards.some((card) => card.id.endsWith(" VS"))).toBe(false);

    const card0010 = dataset.statementCards.find((card) => card.id === "CARD_0010");
    expect(card0010).toBeDefined();
    expect(card0010?.opposingCandidateIds).toEqual(
      expect.arrayContaining(["sophia-chikirou", "emmanuel-gregoire"])
    );
  });

  test("inverts points for merged VS candidates with normal and x2 answers", () => {
    const dataset = loadBundledDataset();
    const card0010 = dataset.statementCards.find((card) => card.id === "CARD_0010");

    expect(card0010).toBeDefined();

    const agreeResult = computeMatching({
      answers: { CARD_0010: "CARD_0010-agree" },
      cards: dataset.statementCards,
      candidates: dataset.candidates,
    });

    const agreeByCandidate = new Map(
      agreeResult.candidateRanking.map((entry) => [entry.candidateId, entry])
    );

    expect(agreeByCandidate.get("rachida-dati")?.alignmentScore).toBe(1);
    expect(agreeByCandidate.get("sophia-chikirou")?.alignmentScore).toBe(-1);
    expect(agreeByCandidate.get("emmanuel-gregoire")?.alignmentScore).toBe(-1);

    const chikirouAgreeInteraction = agreeByCandidate
      .get("sophia-chikirou")
      ?.cardBreakdown.find((interaction) => interaction.cardId === "CARD_0010");
    expect(chikirouAgreeInteraction?.pointsAwarded).toBe(-1);
    expect(chikirouAgreeInteraction?.cardText).toBe(card0010?.text);

    const disagreeX2Result = computeMatching({
      answers: { CARD_0010: "CARD_0010-disagree_x2" },
      cards: dataset.statementCards,
      candidates: dataset.candidates,
    });

    const disagreeX2ByCandidate = new Map(
      disagreeX2Result.candidateRanking.map((entry) => [entry.candidateId, entry])
    );

    expect(disagreeX2ByCandidate.get("rachida-dati")?.alignmentScore).toBe(-2);
    expect(disagreeX2ByCandidate.get("sophia-chikirou")?.alignmentScore).toBe(2);
    expect(disagreeX2ByCandidate.get("emmanuel-gregoire")?.alignmentScore).toBe(2);
  });
});
