/**
 * Contradiction Detection
 *
 * Analyzes user survey answers to identify inconsistent preferences
 * across themes. Logic-based, not editorial (Principle IV).
 */

import type { ContradictionResult } from "../../specs/001-civic-election-app/contracts/matching";
import type { SurveyQuestion } from "../data/schema";

interface ContradictionRule {
  themeA: string;
  themeB: string;
  description: string;
  condition: (scores: Record<string, number>) => boolean;
  severity: "low" | "medium" | "high";
  evidenceDescription: string;
}

const CONTRADICTION_RULES: ContradictionRule[] = [
  {
    themeA: "budget",
    themeB: "social",
    description:
      "Vous souhaitez réduire les dépenses publiques tout en augmentant les services sociaux. Ces deux objectifs nécessitent des arbitrages budgétaires.",
    condition: (scores) =>
      (scores["budget"] ?? 0) > 1 && (scores["social"] ?? 0) > 1,
    severity: "high",
    evidenceDescription: "Priorité aux économies ET aux dépenses sociales",
  },
  {
    themeA: "transport",
    themeB: "ecologie",
    description:
      "Vous privilégiez l'accès automobile tout en soutenant des politiques écologiques ambitieuses. La réduction du trafic est un levier clé de la transition écologique.",
    condition: (scores) =>
      (scores["transport"] ?? 0) < -1 && (scores["ecologie"] ?? 0) > 1,
    severity: "medium",
    evidenceDescription: "Pro-voiture ET pro-écologie",
  },
  {
    themeA: "budget",
    themeB: "education",
    description:
      "Vous voulez réduire les dépenses municipales mais aussi investir massivement dans l'éducation. L'éducation représente une part importante du budget municipal.",
    condition: (scores) =>
      (scores["budget"] ?? 0) > 1 && (scores["education"] ?? 0) > 1,
    severity: "medium",
    evidenceDescription: "Réduction budgétaire ET investissement éducatif",
  },
  {
    themeA: "securite",
    themeB: "budget",
    description:
      "Vous souhaitez renforcer les effectifs de sécurité tout en réduisant le budget. Le recrutement de police municipale implique des coûts significatifs.",
    condition: (scores) =>
      (scores["securite"] ?? 0) > 1 && (scores["budget"] ?? 0) > 1,
    severity: "low",
    evidenceDescription: "Plus de sécurité ET moins de dépenses",
  },
  {
    themeA: "logement",
    themeB: "ecologie",
    description:
      "Vous souhaitez construire davantage de logements tout en limitant l'artificialisation des sols. Ces objectifs peuvent entrer en tension en milieu urbain dense.",
    condition: (scores) =>
      (scores["logement"] ?? 0) > 1 && (scores["ecologie"] ?? 0) > 1,
    severity: "low",
    evidenceDescription: "Plus de construction ET zéro artificialisation",
  },
];

export function detectContradictions(
  themeScores: Record<string, number>,
  answers: Record<string, string>,
  questions: SurveyQuestion[]
): ContradictionResult[] {
  const results: ContradictionResult[] = [];

  for (const rule of CONTRADICTION_RULES) {
    if (rule.condition(themeScores)) {
      // Find evidence questions
      const evidence = questions
        .filter(
          (q) =>
            q.themeIds.includes(rule.themeA) ||
            q.themeIds.includes(rule.themeB)
        )
        .filter((q) => answers[q.id])
        .map((q) => ({
          questionId: q.id,
          selectedOptionId: answers[q.id],
          implication: rule.evidenceDescription,
        }));

      results.push({
        themeA: rule.themeA,
        themeB: rule.themeB,
        description: rule.description,
        severity: rule.severity,
        evidence,
      });
    }
  }

  return results;
}
