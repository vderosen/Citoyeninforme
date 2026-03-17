import { loadBundledDataset } from "../../src/data/loader";
import {
  PARIS_SECOND_ROUND_CANDIDATE_IDS,
  filterParisSecondRoundCandidateRanking,
  getParisSecondRoundCandidates,
  getParisSecondRoundStatementCards,
} from "../../src/data/elections/paris-2026/secondRoundSurvey";

describe("second-round survey filtering", () => {
  test("keeps only the three qualified candidates", () => {
    const dataset = loadBundledDataset();
    const secondRoundCandidates = getParisSecondRoundCandidates(
      dataset.candidates
    );

    expect(secondRoundCandidates).toHaveLength(3);
    expect(secondRoundCandidates.map((candidate) => candidate.id).sort()).toEqual(
      [...PARIS_SECOND_ROUND_CANDIDATE_IDS].sort()
    );
  });

  test("keeps only cards relevant to second-round candidates and strips others", () => {
    const dataset = loadBundledDataset();
    const secondRoundCards = getParisSecondRoundStatementCards(
      dataset.statementCards
    );
    const secondRoundSet = new Set<string>(PARIS_SECOND_ROUND_CANDIDATE_IDS);

    expect(secondRoundCards.length).toBeGreaterThan(0);

    for (const card of secondRoundCards) {
      const allCandidateIds = [
        ...(card.candidateIds ?? []),
        ...(card.opposingCandidateIds ?? []),
      ];

      expect(allCandidateIds.length).toBeGreaterThan(0);
      expect(allCandidateIds.every((candidateId) => secondRoundSet.has(candidateId))).toBe(
        true
      );
    }
  });

  test("preserves source order as a filtered subsequence of first-round cards", () => {
    const dataset = loadBundledDataset();
    const sourceOrder = dataset.statementCards.map((card) => card.id);
    const secondRoundOrder = getParisSecondRoundStatementCards(
      dataset.statementCards
    ).map((card) => card.id);

    let cursor = 0;
    for (const cardId of secondRoundOrder) {
      const nextIndex = sourceOrder.indexOf(cardId, cursor);
      expect(nextIndex).toBeGreaterThanOrEqual(0);
      cursor = nextIndex + 1;
    }
  });

  test("keeps equal max markable points for each second-round candidate", () => {
    const dataset = loadBundledDataset();
    const secondRoundCards = getParisSecondRoundStatementCards(
      dataset.statementCards
    );

    const cardExposure = new Map<string, number>(
      PARIS_SECOND_ROUND_CANDIDATE_IDS.map((candidateId) => [candidateId, 0])
    );

    for (const card of secondRoundCards) {
      const idsOnCard = new Set([
        ...(card.candidateIds ?? []),
        ...(card.opposingCandidateIds ?? []),
      ]);

      for (const candidateId of idsOnCard) {
        cardExposure.set(candidateId, (cardExposure.get(candidateId) ?? 0) + 1);
      }
    }

    const exposures = PARIS_SECOND_ROUND_CANDIDATE_IDS.map(
      (candidateId) => cardExposure.get(candidateId) ?? 0
    );

    expect(new Set(exposures).size).toBe(1);

    const maxPointsPerCandidate = exposures.map((count) => count * 2);
    expect(new Set(maxPointsPerCandidate).size).toBe(1);
  });

  test("filters stale rankings to second-round candidates only", () => {
    const filtered = filterParisSecondRoundCandidateRanking([
      { candidateId: "pierre-yves-bournazel", alignmentScore: 9, cardBreakdown: [] },
      { candidateId: "rachida-dati", alignmentScore: 8, cardBreakdown: [] },
      { candidateId: "emmanuel-gregoire", alignmentScore: 7, cardBreakdown: [] },
      { candidateId: "sarah-knafo", alignmentScore: 6, cardBreakdown: [] },
      { candidateId: "sophia-chikirou", alignmentScore: 5, cardBreakdown: [] },
    ]);

    expect(filtered.map((entry) => entry.candidateId)).toEqual([
      "rachida-dati",
      "emmanuel-gregoire",
      "sophia-chikirou",
    ]);
  });
});
