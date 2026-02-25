/**
 * Debate Service Contracts
 *
 * Defines the interface for the debate turn generation service.
 * This service wraps the existing chatbot SSE endpoint to produce
 * structured JSON debate turns instead of streaming text.
 *
 * Contract boundary: DebateArea UI → debate service → chatbot SSE → LLM proxy
 */

import type { Election, Candidate, Position, Theme } from "../../../src/data/schema";
import type { UserProfile } from "../../../src/stores/survey";

// === Debate Turn Types ===

export interface DebateOption {
  /** Short identifier: "a", "b", "c", or "d" */
  id: string;
  /** Display text for the option (1-2 sentences) */
  text: string;
}

export interface DebateSource {
  /** Human-readable source title */
  title: string;
  /** URL to the source document (optional) */
  url?: string;
}

export interface CandidateProximityEntry {
  /** References Candidate.id from election dataset */
  candidateId: string;
  /** Justification linking user's debate positions to candidate's documented positions */
  reason: string;
}

export interface DebateSummary {
  /** Theme IDs discussed during the debate */
  themesExplored: string[];
  /** Paragraph summarizing user's argumentation patterns */
  keyInsight: string;
  /** Factual proximity to candidates (optional, only when justified) */
  candidateProximity?: CandidateProximityEntry[];
}

export interface DebateTurn {
  /** Unique identifier, generated client-side */
  id: string;
  /** AI's argument or provocative question (2-4 sentences) */
  statement: string;
  /** 2-4 response options (empty for conclusion) */
  options: DebateOption[];
  /** User's selected option ID (null = current unanswered turn) */
  selectedOptionId: string | null;
  /** Election theme this turn relates to */
  themeId: string | null;
  /** Source citations for claims */
  sources: DebateSource[];
  /** Whether this is the final summary turn */
  isConclusion: boolean;
  /** Present only on conclusion turns */
  summary: DebateSummary | null;
  /** ISO 8601 creation timestamp */
  timestamp: string;
}

// === LLM Response Schemas (what the LLM returns as JSON) ===

/** Raw JSON response from LLM for a normal debate turn */
export interface LLMDebateTurnResponse {
  statement: string;
  options: Array<{ id: string; text: string }>;
  themeId?: string | null;
  sources?: Array<{ title: string; url?: string }>;
}

/** Raw JSON response from LLM for a conclusion turn */
export interface LLMDebateConclusionResponse {
  statement: string;
  options: [];
  isConclusion: true;
  summary: {
    themesExplored: string[];
    keyInsight: string;
    candidateProximity?: Array<{ candidateId: string; reason: string }>;
  };
}

export type LLMDebateResponse = LLMDebateTurnResponse | LLMDebateConclusionResponse;

// === Service Interface ===

export interface DebateContext {
  election: Election;
  candidates: Candidate[];
  positions: Position[];
  themes: Theme[];
}

export interface GenerateDebateTurnParams {
  /** Election data context */
  context: DebateContext;
  /** All previous debate turns (with selected options) */
  previousTurns: DebateTurn[];
  /** Current turn number (1-indexed) */
  turnNumber: number;
  /** User's survey profile (null if survey not completed) */
  userProfile: UserProfile | null;
  /** Theme ID for the first turn when no survey (null for auto-start) */
  startThemeId?: string | null;
}

export interface GenerateConclusionParams {
  /** Election data context */
  context: DebateContext;
  /** All debate turns including the last answered turn */
  allTurns: DebateTurn[];
  /** User's survey profile (null if survey not completed) */
  userProfile: UserProfile | null;
}

/**
 * Generate the next debate turn.
 *
 * Builds a debate-specific system prompt instructing JSON output,
 * constructs message history from previous turns, sends to the
 * existing /api/chat SSE endpoint, collects the full response,
 * and parses/validates the JSON structure.
 *
 * Retries once on parse failure. Throws on second failure.
 *
 * @returns A validated DebateTurn (without id and timestamp — caller adds those)
 */
export type GenerateDebateTurn = (
  params: GenerateDebateTurnParams
) => Promise<Omit<DebateTurn, "id" | "timestamp" | "selectedOptionId">>;

/**
 * Generate the debate conclusion.
 *
 * Sends the full debate history with a conclusion instruction.
 * Returns a conclusion turn with summary, themes, and candidate proximity.
 *
 * @returns A validated conclusion DebateTurn
 */
export type GenerateConclusion = (
  params: GenerateConclusionParams
) => Promise<Omit<DebateTurn, "id" | "timestamp" | "selectedOptionId">>;
