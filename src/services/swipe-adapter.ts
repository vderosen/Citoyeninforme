/**
 * Swipe Adapter
 *
 * Converts StatementCard[] to formats expected by computeMatching()
 * and detectContradictions(). Zero changes to those services.
 */

import type { StatementCard, SurveyQuestion, SurveyOption } from "../data/schema";
import type { QuestionDefinition } from "./matching";

const DIRECTION_MULTIPLIERS = {
  agree: 1,
  disagree: -1,
  strongly_agree: 2,
  strongly_disagree: -2,
} as const;

function applyMultiplier(
  baseScores: Record<string, number>,
  multiplier: number
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [themeId, score] of Object.entries(baseScores)) {
    result[themeId] = score * multiplier;
  }
  return result;
}

export function statementCardsToQuestionDefs(
  cards: StatementCard[]
): QuestionDefinition[] {
  return cards.map((card) => ({
    id: card.id,
    themeIds: card.themeIds,
    options: [
      {
        id: `${card.id}-agree`,
        themeScores: applyMultiplier(card.baseScores, DIRECTION_MULTIPLIERS.agree),
      },
      {
        id: `${card.id}-disagree`,
        themeScores: applyMultiplier(card.baseScores, DIRECTION_MULTIPLIERS.disagree),
      },
      {
        id: `${card.id}-strongly_agree`,
        themeScores: applyMultiplier(card.baseScores, DIRECTION_MULTIPLIERS.strongly_agree),
      },
      {
        id: `${card.id}-strongly_disagree`,
        themeScores: applyMultiplier(card.baseScores, DIRECTION_MULTIPLIERS.strongly_disagree),
      },
    ],
  }));
}

export function statementCardsToSurveyQuestions(
  cards: StatementCard[]
): SurveyQuestion[] {
  return cards.map((card) => ({
    id: card.id,
    electionId: card.electionId,
    text: card.text,
    themeIds: card.themeIds,
    options: [
      {
        id: `${card.id}-agree`,
        text: "D'accord",
        themeScores: applyMultiplier(card.baseScores, DIRECTION_MULTIPLIERS.agree),
      },
      {
        id: `${card.id}-disagree`,
        text: "Pas d'accord",
        themeScores: applyMultiplier(card.baseScores, DIRECTION_MULTIPLIERS.disagree),
      },
      {
        id: `${card.id}-strongly_agree`,
        text: "Coup de c\u0153ur",
        themeScores: applyMultiplier(card.baseScores, DIRECTION_MULTIPLIERS.strongly_agree),
      },
      {
        id: `${card.id}-strongly_disagree`,
        text: "Catastrophe",
        themeScores: applyMultiplier(card.baseScores, DIRECTION_MULTIPLIERS.strongly_disagree),
      },
    ] satisfies SurveyOption[],
    order: card.order,
  }));
}
