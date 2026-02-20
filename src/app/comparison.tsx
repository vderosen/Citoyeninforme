import { useState, useEffect } from "react";
import { View, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useElectionStore } from "../stores/election";
import { LoadingState } from "../components/shared/LoadingState";
import { CandidateAvatarBar } from "../components/comparison/CandidateAvatarBar";
import { ThemeChipSelector } from "../components/comparison/ThemeChipSelector";
import { ComparisonView } from "../components/candidates/ComparisonView";

export default function ComparisonScreen() {
  const params = useLocalSearchParams<{ selected?: string }>();
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const candidates = useElectionStore((s) => s.candidates);
  const themes = useElectionStore((s) => s.themes);
  const positions = useElectionStore((s) => s.positions);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string>("");

  // Pre-select candidates from navigation params
  useEffect(() => {
    if (params.selected) {
      const ids = params.selected
        .split(",")
        .filter((id) => candidates.some((c) => c.id === id));
      if (ids.length > 0) setSelectedIds(ids);
    }
  }, [params.selected, candidates]);

  // Auto-select first theme
  useEffect(() => {
    if (themes.length > 0 && !activeThemeId) {
      setActiveThemeId(themes[0].id);
    }
  }, [themes, activeThemeId]);

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-warm-white">
        <LoadingState />
      </View>
    );
  }

  const toggleCandidate = (candidateId: string) => {
    setSelectedIds((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : prev.length >= 4
          ? prev
          : [...prev, candidateId]
    );
  };

  return (
    <View className="flex-1 bg-warm-white">
      <ScrollView>
        <CandidateAvatarBar
          candidates={candidates}
          selectedIds={selectedIds}
          onToggle={toggleCandidate}
        />
        <ThemeChipSelector
          themes={themes}
          selectedThemeId={activeThemeId}
          onSelectTheme={setActiveThemeId}
        />
        <ComparisonView
          candidates={candidates}
          selectedCandidateIds={selectedIds}
          positions={positions}
          activeThemeId={activeThemeId}
        />
      </ScrollView>
    </View>
  );
}
