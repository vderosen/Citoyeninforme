/**
 * Matching Algorithm Contracts
 *
 * Defines the interface for the deterministic survey matching algorithm.
 * The algorithm MUST be a pure function: identical inputs always produce
 * identical outputs (FR-009, Principle I).
 *
 * Contract boundary: survey answers + election dataset → matching results
 */

// === Matching Algorithm Interface ===

/**
 * Pure function: compute candidate matching from survey answers.
 * MUST be deterministic — no randomness, no external state.
 */
export interface MatchingAlgorithm {
  computeMatching(input: MatchingInput): MatchingOutput;
}

export interface MatchingInput {
  answers: Record<string, string>; // QuestionId → selected OptionId
  importanceWeights: Record<string, number>; // ThemeId → importance (0-1)
  questions: QuestionDefinition[];
  candidates: CandidatePositions[];
}

export interface QuestionDefinition {
  id: string;
  themeIds: string[];
  options: {
    id: string;
    themeScores: Record<string, number>;
  }[];
}

export interface CandidatePositions {
  candidateId: string;
  positionScores: Record<string, number>; // ThemeId → candidate's stance score
}

// === Matching Output ===

export interface MatchingOutput {
  themeScores: Record<string, number>; // User's computed score per theme
  candidateRanking: CandidateMatchResult[];
  contradictions: ContradictionResult[];
}

export interface CandidateMatchResult {
  candidateId: string;
  alignmentScore: number; // 0-100
  themeBreakdown: ThemeAlignmentDetail[];
}

export interface ThemeAlignmentDetail {
  themeId: string;
  userScore: number;
  candidateScore: number;
  alignment: "agree" | "partial" | "disagree";
  weightedContribution: number; // How much this theme affected the total score
}

// === Contradiction Detection ===

export interface ContradictionResult {
  themeA: string;
  themeB: string;
  description: string;
  severity: "low" | "medium" | "high";
  evidence: {
    questionId: string;
    selectedOptionId: string;
    implication: string;
  }[];
}
