/**
 * Data Export & Deletion Contract
 *
 * Defines the interface for GDPR data portability (Article 20) and
 * right to erasure (Article 17).
 * FR-006 through FR-009.
 */

// ---------------------------------------------------------------------------
// Export contract
// ---------------------------------------------------------------------------

/**
 * Exported data format. Single JSON file containing all user-generated data.
 */
export interface UserDataExport {
  /** Schema version for forward compatibility */
  exportVersion: "1.0";

  /** ISO 8601 timestamp of when the export was generated */
  exportedAt: string;

  /** App version that generated the export */
  appVersion: string;

  /** Privacy consent status at time of export */
  consent: {
    policyVersion: string | null;
    acceptedAt: string | null;
  };

  /** Survey data: all answers, weights, and computed profile */
  survey: {
    status: string;
    answers: Record<string, string>;
    importanceWeights: Record<string, number>;
    profile: {
      surveyAnswers: Record<string, string>;
      themeScores: Record<string, number>;
      importanceWeights: Record<string, number>;
      contradictions: Array<{
        themeA: string;
        themeB: string;
        description: string;
        severity: "low" | "medium" | "high";
      }>;
      candidateRanking: Array<{
        candidateId: string;
        alignmentScore: number;
      }>;
      completedAt: string;
    } | null;
  };

  /** Chat assistant data: conversation history */
  assistant: {
    mode: string;
    selectedCandidateId: string | null;
    messages: Array<{
      id: string;
      role: "user" | "assistant";
      content: string;
      timestamp: string;
    }>;
  };

  /** App preferences */
  preferences: {
    hasCompletedOnboarding: boolean;
    lastActiveTab: string;
    crashReportingOptIn: boolean;
  };

  /** Feedback entries submitted by the user */
  feedback: Array<{
    id: string;
    timestamp: string;
    screen: string;
    type: string;
    text: string | null;
  }>;
}

// ---------------------------------------------------------------------------
// Service contract (src/services/data-export.ts)
// ---------------------------------------------------------------------------

/**
 * generateExport(): Promise<string>
 *
 * 1. Reads current state from all Zustand stores
 * 2. Reads feedback entries from storage
 * 3. Builds UserDataExport object
 * 4. Writes JSON to temporary file via expo-file-system
 * 5. Returns the file URI
 *
 * Performance: Must complete in <10s for typical usage
 * (up to 100 chat messages and 50 survey responses).
 */

/**
 * shareExport(fileUri: string): Promise<void>
 *
 * Opens the system share sheet via expo-sharing.
 * Allows user to save to files, email, AirDrop, etc.
 */

/**
 * deleteAllUserData(): Promise<void>
 *
 * 1. Calls useSurveyStore.getState().reset()
 * 2. Calls useAssistantStore.getState().resetConversation()
 * 3. Calls clearFeedbackEntries()
 * 4. Resets AppState (clears consent, onboarding, preferences)
 * 5. Calls AsyncStorage.clear() as safety net
 * 6. Does NOT touch SQLite election data (not user-generated)
 *
 * After deletion: app should navigate to privacy consent screen
 * (since consent was cleared, the gate in _layout.tsx handles this).
 */

// ---------------------------------------------------------------------------
// UI contract (settings screen)
// ---------------------------------------------------------------------------

/**
 * Export button behavior:
 * - Tap "Export my data" → show loading indicator → generate export → open share sheet
 * - If share sheet is dismissed → show success message
 * - If export fails (e.g., disk full) → show error message with retry option
 *
 * Delete button behavior:
 * - Tap "Delete all my data" → show confirmation dialog
 * - Confirmation dialog text: clear warning that action is irreversible
 * - Confirm → execute deleteAllUserData() → app resets to consent screen
 * - Cancel → dismiss dialog, no action taken
 */
