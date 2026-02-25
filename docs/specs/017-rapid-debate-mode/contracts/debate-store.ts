/**
 * Debate Store Contracts
 *
 * Defines the state shape and actions added to the existing
 * assistant Zustand store for debate mode.
 *
 * These fields are NOT persisted (ephemeral per FR-012).
 */

import type { DebateTurn } from "./debate-service";

// === State Extension ===

export interface DebateSlice {
  /** Ordered list of all turns in the current debate */
  debateTurns: DebateTurn[];
  /** Whether a debate session is in progress */
  isDebateActive: boolean;
  /** Whether the system is waiting for the LLM */
  isGeneratingTurn: boolean;
  /** Theme chosen by user at start (no-survey path only) */
  debateStartThemeId: string | null;
}

// === Actions ===

export interface DebateActions {
  /**
   * Start a new debate session.
   * If themeId is provided, uses it for the first turn (no-survey path).
   * If null, auto-starts from survey contradictions.
   */
  startDebate: (themeId?: string | null) => void;

  /**
   * Record the user's option selection for a turn and trigger
   * generation of the next turn.
   */
  selectDebateOption: (turnId: string, optionId: string) => void;

  /**
   * Append a new turn to the debate history.
   * Called after the LLM generates a response.
   */
  addDebateTurn: (turn: DebateTurn) => void;

  /** Set the generating state (waiting for LLM) */
  setGeneratingTurn: (generating: boolean) => void;

  /**
   * End the current debate.
   * Triggers conclusion generation if the last turn is not already a conclusion.
   */
  endDebate: () => void;

  /**
   * Reset all debate state to defaults.
   * Called when starting a new debate or leaving debate mode.
   */
  resetDebate: () => void;
}

// === Defaults ===

export const DEBATE_INITIAL_STATE: DebateSlice = {
  debateTurns: [],
  isDebateActive: false,
  isGeneratingTurn: false,
  debateStartThemeId: null,
};

// === Selectors ===

/** Get the current (unanswered) turn, if any */
export type SelectCurrentTurn = (state: DebateSlice) => DebateTurn | null;

/** Get all completed (answered) turns */
export type SelectCompletedTurns = (state: DebateSlice) => DebateTurn[];

/** Get the total number of completed turns */
export type SelectTurnCount = (state: DebateSlice) => number;

/** Check if the debate has concluded */
export type SelectIsDebateConcluded = (state: DebateSlice) => boolean;
