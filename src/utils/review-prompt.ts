import type { UserProfile } from "../stores/survey";

export const MIN_SWIPES_FOR_REVIEW_PROMPT = 5;

interface ReviewPromptEligibilityInput {
  answersCount: number;
  hasSeenResultsRatingPrompt: boolean;
  profile: UserProfile | null;
}

export function isEligibleForResultsReviewPrompt({
  answersCount,
  hasSeenResultsRatingPrompt,
  profile,
}: ReviewPromptEligibilityInput): boolean {
  return (
    !hasSeenResultsRatingPrompt &&
    profile !== null &&
    profile.candidateRanking.length > 0 &&
    answersCount >= MIN_SWIPES_FOR_REVIEW_PROMPT
  );
}
