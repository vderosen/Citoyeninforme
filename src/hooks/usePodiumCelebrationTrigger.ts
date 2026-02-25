import { useState, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { useSurveyStore } from "../stores/survey";
import type { UserProfile } from "../stores/survey";

export function usePodiumCelebrationTrigger(profile: UserProfile | null) {
    const [triggerCelebration, setTriggerCelebration] = useState(false);
    const markResultsViewed = useSurveyStore((s) => s.markResultsViewed);

    useFocusEffect(
        useCallback(() => {
            const state = useSurveyStore.getState();

            if (profile && profile.candidateRanking.length >= 3) {
                // Trigger if it's the very first time, OR if user swiped at least 1 new card
                if (!state.hasSeenInitialResult || state.cardsSwipedSinceLastResultView >= 1) {
                    setTriggerCelebration(true);
                    markResultsViewed();
                } else {
                    setTriggerCelebration(false);
                }
            } else {
                setTriggerCelebration(false);
            }

            return () => {
                setTriggerCelebration(false);
            };
        }, [profile, markResultsViewed])
    );

    return triggerCelebration;
}
