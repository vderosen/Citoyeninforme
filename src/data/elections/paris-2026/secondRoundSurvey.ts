import type { Candidate, StatementCard } from "../../schema";
import type { CandidateMatchResult } from "../../../services/matching";

export const PARIS_SECOND_ROUND_CANDIDATE_IDS = [
  "sophia-chikirou",
  "rachida-dati",
  "emmanuel-gregoire",
] as const;

const PARIS_SECOND_ROUND_CANDIDATE_ID_SET = new Set<string>(
  PARIS_SECOND_ROUND_CANDIDATE_IDS
);

export function isParisSecondRoundCandidate(candidateId: string): boolean {
  return PARIS_SECOND_ROUND_CANDIDATE_ID_SET.has(candidateId);
}

export function getParisSecondRoundCandidates(
  candidates: Candidate[]
): Candidate[] {
  return candidates.filter((candidate) =>
    isParisSecondRoundCandidate(candidate.id)
  );
}

export function filterParisSecondRoundCandidateRanking(
  ranking: CandidateMatchResult[]
): CandidateMatchResult[] {
  return ranking.filter((entry) => isParisSecondRoundCandidate(entry.candidateId));
}

export function getParisSecondRoundStatementCards(
  cards: StatementCard[]
): StatementCard[] {
  return cards.reduce<StatementCard[]>((acc, card) => {
    const candidateIds = (card.candidateIds ?? []).filter(
      isParisSecondRoundCandidate
    );
    const opposingCandidateIds = (card.opposingCandidateIds ?? []).filter(
      isParisSecondRoundCandidate
    );

    if (candidateIds.length === 0 && opposingCandidateIds.length === 0) {
      return acc;
    }

    acc.push({
      ...card,
      candidateIds,
      opposingCandidateIds:
        opposingCandidateIds.length > 0 ? opposingCandidateIds : undefined,
    });
    return acc;
  }, []);
}
