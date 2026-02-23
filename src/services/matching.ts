/**
 * Direct Candidate Matching Algorithm
 *
 * Awards raw points based on user's answers to StatementCards.
 */

import type { Candidate, StatementCard } from "../data/schema";

export interface MatchingInput {
  answers: Record<string, string>; // cardId -> `${cardId}-agree` | `${cardId}-disagree` | etc
  cards: StatementCard[];
  candidates: Candidate[];
}

export interface CardInteraction {
  cardId: string;
  cardText: string;
  userAnswerText: string;
  pointsAwarded: number;
}

export interface CandidateMatchResult {
  candidateId: string;
  alignmentScore: number;
  cardBreakdown: CardInteraction[];
}

export interface MatchingOutput {
  candidateRanking: CandidateMatchResult[];
}

// Points awarded based on the answer suffix from `swipe-adapter.ts`
const SCORE_MAP: Record<string, number> = {
  "agree": 1,
  "disagree": -1,
  "strongly_agree": 2,
  "strongly_disagree": -2,
  "skip": 0,
};

const ANSWER_TEXT_MAP: Record<string, string> = {
  "agree": "D'accord",
  "disagree": "Pas d'accord",
  "strongly_agree": "Coup de cœur",
  "strongly_disagree": "Pas du tout d'accord",
  "skip": "Je ne sais pas",
};

export function computeMatching(input: MatchingInput): MatchingOutput {
  const { answers, cards, candidates } = input;

  // Initialize scores and breakdowns for all candidates
  const candidateScores: Record<string, number> = {};
  const candidateBreakdowns: Record<string, CardInteraction[]> = {};

  for (const candidate of candidates) {
    candidateScores[candidate.id] = 0;
    candidateBreakdowns[candidate.id] = [];
  }

  // Iterate over every answered card
  for (const [cardId, answerId] of Object.entries(answers)) {
    const card = cards.find(c => c.id === cardId);
    if (!card) continue;

    // Extract the suffix (e.g., "agree" from "q_CARD_0001-agree")
    const answerSuffix = answerId.replace(`${cardId}-`, '');
    const points = SCORE_MAP[answerSuffix] ?? 0;
    const answerText = ANSWER_TEXT_MAP[answerSuffix] ?? "Inconnu";

    if (points === 0) continue; // Skip if no points awarded

    // Regular candidates (who support the card)
    for (const cid of card.candidateIds ?? []) {
      if (candidateScores[cid] !== undefined) {
        candidateScores[cid] += points;
        candidateBreakdowns[cid].push({
          cardId: card.id,
          cardText: card.text,
          userAnswerText: answerText,
          pointsAwarded: points
        });
      }
    }

    // Opposing candidates (who oppose the card, meaning logic is inverted)
    for (const cid of card.opposingCandidateIds ?? []) {
      if (candidateScores[cid] !== undefined) {
        const invertedPoints = -points;
        candidateScores[cid] += invertedPoints;
        candidateBreakdowns[cid].push({
          cardId: card.id,
          cardText: card.text,
          userAnswerText: answerText,
          pointsAwarded: invertedPoints
        });
      }
    }
  }

  // Build the final ranking
  const candidateRanking: CandidateMatchResult[] = candidates.map(candidate => ({
    candidateId: candidate.id,
    alignmentScore: candidateScores[candidate.id],
    cardBreakdown: candidateBreakdowns[candidate.id]
  }));

  // Sort by highest score first
  candidateRanking.sort((a, b) => b.alignmentScore - a.alignmentScore);

  return {
    candidateRanking
  };
}
