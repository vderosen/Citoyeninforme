/**
 * Onboarding Navigation Contract
 *
 * Defines the interfaces for the onboarding pager, step components,
 * and navigation actions. This is the contract between the pager host
 * and individual step components.
 */

// --- Step Definition ---

export type OnboardingStepKey =
  | "purpose"
  | "neutrality"
  | "contexts"
  | "trust"
  | "ready";

export interface OnboardingStepConfig {
  /** Unique key for the step */
  key: OnboardingStepKey;
  /** 0-based index in the flow */
  index: number;
  /** React component to render for this step's content */
  component: React.ComponentType<StepContentProps>;
}

// --- Step Content Props ---

/** Props passed to each step's content component */
export interface StepContentProps {
  /** Advance to the next step (steps 1-4) */
  onNext: () => void;
  /** Complete onboarding and navigate to a specific tab (step 5 only) */
  onComplete: (target: EntryPointTarget) => void;
}

// --- Entry Point ---

/** Target routes for the branching CTA on step 5 */
export type EntryPointTarget = "survey" | "candidates" | "assistant";

/** Maps entry point choices to Expo Router paths */
export const ENTRY_POINT_ROUTES: Record<EntryPointTarget, string> = {
  survey: "/(tabs)/",
  candidates: "/(tabs)/candidates",
  assistant: "/(tabs)/assistant",
};

// --- Pager State ---

/** State managed by the OnboardingPager component */
export interface OnboardingPagerState {
  /** Currently visible step index (0-4) */
  currentIndex: number;
  /** Total number of steps */
  totalSteps: number;
}

// --- i18n Key Convention ---

/**
 * All onboarding i18n keys follow this pattern:
 *
 * step{N}.title       - Step title text
 * step{N}.description - Step body text (step 1)
 * step{N}.bullet{M}   - Bullet items (step 2)
 * step{N}.card{M}.title / .description - Card items (step 3)
 * step{N}.does{M} / .doesNot{M} - Check/X items (step 4)
 * step{N}.cta         - Primary CTA label
 * step{N}.secondary{M} - Secondary CTA labels (step 5)
 * progress            - Progress format string "{current}/{total}"
 */
