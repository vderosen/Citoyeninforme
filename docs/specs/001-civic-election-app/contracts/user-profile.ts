/**
 * User Profile Contracts
 *
 * These TypeScript interfaces define the shape of locally-stored user data.
 * UserProfile is NEVER sent to a server without explicit user consent
 * (Constitution Principle VII: Privacy & Trust).
 *
 * Contract boundary: survey service → MMKV local storage → chatbot/UI
 */

// === Survey Results ===

export interface UserProfile {
  surveyAnswers: Record<string, string>; // QuestionId → selected OptionId
  themeScores: Record<string, number>; // ThemeId → computed score
  importanceWeights: Record<string, number>; // ThemeId → user-assigned importance (0-1)
  contradictions: Contradiction[];
  candidateRanking: CandidateMatch[];
  completedAt: string; // ISO 8601
}

export interface Contradiction {
  themeA: string; // Theme ID
  themeB: string; // Theme ID
  description: string; // Human-readable explanation (in French for MVP)
  severity: "low" | "medium" | "high";
}

export interface CandidateMatch {
  candidateId: string;
  alignmentScore: number; // 0-100
  justification: ThemeJustification[];
}

export interface ThemeJustification {
  themeId: string;
  alignment: "agree" | "partial" | "disagree";
  weight: number; // Contribution to overall score
}

// === Survey State ===

export type SurveyStatus =
  | "not_started"
  | "civic_context"
  | "questionnaire"
  | "computing"
  | "results_ready"
  | "completed";

export interface SurveyState {
  status: SurveyStatus;
  currentQuestionIndex: number;
  answers: Record<string, string>; // In-progress answers
  profile?: UserProfile; // Set when status is "results_ready" or "completed"
}
