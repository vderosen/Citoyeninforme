import type { SwipeDirection } from "../data/schema";

export type SwipeBreakdownKey =
  | "agree"
  | "disagree"
  | "strongly_agree"
  | "strongly_disagree"
  | "skip";

interface SwipeAnswerMeta {
  points: number;
  userAnswerText: string;
  breakdownKey: SwipeBreakdownKey;
}

const LEGACY_SUFFIX_ALIASES: Record<string, string> = {
  strongly_agree: "agree_x2",
  strongly_disagree: "disagree_x2",
};

const ANSWER_META_BY_SUFFIX: Record<string, SwipeAnswerMeta> = {
  agree: {
    points: 1,
    userAnswerText: "D'accord",
    breakdownKey: "agree",
  },
  disagree: {
    points: -1,
    userAnswerText: "Pas d'accord",
    breakdownKey: "disagree",
  },
  skip: {
    points: 0,
    userAnswerText: "Pas d'avis",
    breakdownKey: "skip",
  },
  agree_x2: {
    points: 2,
    userAnswerText: "Vraiment d'accord",
    breakdownKey: "strongly_agree",
  },
  disagree_x2: {
    points: -2,
    userAnswerText: "Vraiment pas d'accord",
    breakdownKey: "strongly_disagree",
  },
};

export function extractAnswerSuffix(cardId: string, answerId: string): string {
  if (answerId.startsWith(`${cardId}-`)) {
    return answerId.slice(cardId.length + 1);
  }
  return answerId;
}

export function getAnswerMeta(answerSuffix: string): SwipeAnswerMeta | null {
  const normalizedSuffix = LEGACY_SUFFIX_ALIASES[answerSuffix] ?? answerSuffix;
  return ANSWER_META_BY_SUFFIX[normalizedSuffix] ?? null;
}

export function buildAnswerId(
  cardId: string,
  direction: SwipeDirection,
  isX2Enabled: boolean
): string {
  if (direction === "skip") return `${cardId}-skip`;

  if (direction === "agree") {
    return `${cardId}-${isX2Enabled ? "agree_x2" : "agree"}`;
  }

  if (direction === "disagree") {
    return `${cardId}-${isX2Enabled ? "disagree_x2" : "disagree"}`;
  }

  if (direction === "strongly_agree") return `${cardId}-agree_x2`;
  if (direction === "strongly_disagree") return `${cardId}-disagree_x2`;

  return `${cardId}-${direction}`;
}
