/**
 * Deterministic Matching Algorithm (FR-009)
 *
 * Pure function: identical inputs ALWAYS produce identical outputs.
 * No randomness, no external state, no hidden weighting.
 */

// Types matching contracts/matching.ts — defined locally to avoid cross-boundary imports

export interface MatchingInput {
  answers: Record<string, string>;
  importanceWeights: Record<string, number>;
  questions: QuestionDefinition[];
  candidates: CandidatePositions[];
}

export interface QuestionDefinition {
  id: string;
  themeIds: string[];
  options: { id: string; themeScores: Record<string, number> }[];
}

export interface CandidatePositions {
  candidateId: string;
  positionScores: Record<string, number>;
}

export interface MatchingOutput {
  themeScores: Record<string, number>;
  candidateRanking: CandidateMatchResult[];
  contradictions: ContradictionResult[];
}

export interface CandidateMatchResult {
  candidateId: string;
  alignmentScore: number;
  themeBreakdown: ThemeAlignmentDetail[];
}

export interface ThemeAlignmentDetail {
  themeId: string;
  userScore: number;
  candidateScore: number;
  alignment: "agree" | "partial" | "disagree";
  weightedContribution: number;
}

export interface ContradictionResult {
  themeA: string;
  themeB: string;
  description: string;
  severity: "low" | "medium" | "high";
  evidence: { questionId: string; selectedOptionId: string; implication: string }[];
}

export function computeMatching(input: MatchingInput): MatchingOutput {
  const { answers, importanceWeights, questions, candidates } = input;

  // Step 1: Compute user's theme scores from answers
  const themeScores: Record<string, number> = {};

  for (const question of questions) {
    const selectedOptionId = answers[question.id];
    if (!selectedOptionId) continue;

    const selectedOption = question.options.find(
      (opt) => opt.id === selectedOptionId
    );
    if (!selectedOption) continue;

    for (const [themeId, score] of Object.entries(
      selectedOption.themeScores
    )) {
      themeScores[themeId] = (themeScores[themeId] ?? 0) + score;
    }
  }

  // Step 2: Calculate candidate alignment scores
  const candidateRanking: CandidateMatchResult[] = candidates.map(
    (candidate) => {
      const themeBreakdown: ThemeAlignmentDetail[] = [];
      let totalWeightedScore = 0;
      let totalWeight = 0;

      for (const [themeId, userScore] of Object.entries(themeScores)) {
        const candidateScore = candidate.positionScores[themeId] ?? 0;
        const importance = importanceWeights[themeId] ?? 0.5;

        // Compute alignment as inverse of normalized distance
        const maxPossibleDiff = 4; // Score range is typically -2 to +2
        const diff = Math.abs(userScore - candidateScore);
        const alignment = 1 - diff / maxPossibleDiff;
        const clampedAlignment = Math.max(0, Math.min(1, alignment));

        const weightedContribution = clampedAlignment * importance;
        totalWeightedScore += weightedContribution;
        totalWeight += importance;

        let alignmentCategory: "agree" | "partial" | "disagree";
        if (clampedAlignment >= 0.7) {
          alignmentCategory = "agree";
        } else if (clampedAlignment >= 0.4) {
          alignmentCategory = "partial";
        } else {
          alignmentCategory = "disagree";
        }

        themeBreakdown.push({
          themeId,
          userScore,
          candidateScore,
          alignment: alignmentCategory,
          weightedContribution,
        });
      }

      const alignmentScore =
        totalWeight > 0
          ? Math.round((totalWeightedScore / totalWeight) * 100)
          : 50;

      return {
        candidateId: candidate.candidateId,
        alignmentScore,
        themeBreakdown,
      };
    }
  );

  // Sort by alignment score descending (stable sort for ties)
  candidateRanking.sort((a, b) => b.alignmentScore - a.alignmentScore);

  return {
    themeScores,
    candidateRanking,
    contradictions: [], // Contradiction detection is separate
  };
}
