import { useState, useCallback, useMemo } from "react";
import { LayoutAnimation } from "react-native";
import type { Candidate } from "../data/schema";

export function useCandidateSelection(allCandidates: Candidate[], maxSelected: number) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const selectedCandidates = useMemo(
        () =>
            selectedIds
                .map((id) => allCandidates.find((c) => c.id === id))
                .filter(Boolean) as Candidate[],
        [selectedIds, allCandidates]
    );

    const toggleCandidate = useCallback(
        (candidateId: string) => {
            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
            setSelectedIds((prev) => {
                if (prev.includes(candidateId)) {
                    return prev.filter((id) => id !== candidateId);
                }
                if (prev.length >= maxSelected) return prev;
                return [...prev, candidateId];
            });
        },
        [maxSelected]
    );

    return {
        selectedIds,
        selectedCandidates,
        toggleCandidate,
    };
}
