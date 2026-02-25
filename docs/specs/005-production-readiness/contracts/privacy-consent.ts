/**
 * Privacy Consent Contract
 *
 * Defines the interface for the privacy consent flow.
 * FR-001 through FR-005a.
 */

// Current privacy policy version — bump this when the policy text changes
// to trigger re-consent for existing users (FR-005a).
export const PRIVACY_POLICY_VERSION = "1.0";

// URL where the full privacy policy is hosted (FR-002, FR-031).
// Must be set before store submission.
export const PRIVACY_POLICY_URL = "https://lucide.app/privacy-policy";

// ---------------------------------------------------------------------------
// Store contract (additions to AppState in src/stores/app.ts)
// ---------------------------------------------------------------------------

export interface PrivacyConsentState {
  /** Version string of the accepted policy, or null if not yet accepted */
  privacyConsentVersion: string | null;

  /** ISO 8601 timestamp of acceptance, or null */
  consentTimestamp: string | null;

  /** Record consent acceptance */
  acceptPrivacyPolicy: (version: string) => void;

  /** Clear consent (used during data deletion) */
  revokePrivacyConsent: () => void;
}

// ---------------------------------------------------------------------------
// Navigation gate logic (used in src/app/_layout.tsx)
// ---------------------------------------------------------------------------

/**
 * Returns true if the user needs to (re-)accept the privacy policy.
 *
 * Cases:
 * - Never accepted (privacyConsentVersion === null)
 * - Policy updated (privacyConsentVersion !== PRIVACY_POLICY_VERSION)
 */
export function needsPrivacyConsent(
  acceptedVersion: string | null
): boolean {
  return acceptedVersion !== PRIVACY_POLICY_VERSION;
}

// ---------------------------------------------------------------------------
// Screen behavior contract
// ---------------------------------------------------------------------------

/**
 * Privacy consent screen requirements:
 *
 * 1. Displayed before any other screen (except splash) on:
 *    - First launch (no consent recorded)
 *    - Policy version change (stored version !== PRIVACY_POLICY_VERSION)
 *
 * 2. Content:
 *    - Summary of what data is collected (survey answers, chat messages, preferences)
 *    - How data is stored (locally on device only)
 *    - External data sharing (anonymized crash reports, only if opted in)
 *    - Link to full privacy policy (PRIVACY_POLICY_URL)
 *
 * 3. Actions:
 *    - "Accept" → calls acceptPrivacyPolicy(PRIVACY_POLICY_VERSION), navigates forward
 *    - "Read full policy" → opens PRIVACY_POLICY_URL in browser or in-app webview
 *    - "Decline" / back → shows message that consent is required, does NOT proceed
 *
 * 4. After acceptance:
 *    - If !hasCompletedOnboarding → navigate to /onboarding
 *    - If hasCompletedOnboarding → navigate to /(tabs)
 */
