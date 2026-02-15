import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../stores/election";
import { LoadingState } from "../components/shared/LoadingState";
import { ComparisonView } from "../components/candidates/ComparisonView";
import { ThemeFilter } from "../components/candidates/ThemeFilter";

export default function ComparisonScreen() {
  const { t } = useTranslation("comparison");
  const router = useRouter();
  const params = useLocalSearchParams<{ selected?: string }>();
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const candidates = useElectionStore((s) => s.candidates);
  const themes = useElectionStore((s) => s.themes);
  const positions = useElectionStore((s) => s.positions);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);

  useEffect(() => {
    if (params.selected) {
      setSelectedIds((prev) =>
        prev.includes(params.selected!) ? prev : [...prev, params.selected!]
      );
    }
  }, [params.selected]);

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
        : [...prev, candidateId]
    );
  };

  return (
    <View className="flex-1 bg-warm-white">
      <Text className="font-display-bold text-xl text-civic-navy px-4 pt-4 pb-2">
        {t("title")}
      </Text>

      {/* Candidate selector */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        className="pb-2"
      >
        {candidates.map((candidate) => (
          <Pressable
            key={candidate.id}
            onPress={() => toggleCandidate(candidate.id)}
            className={`px-3 py-2 rounded-full border ${
              selectedIds.includes(candidate.id)
                ? "bg-accent-coral-light border-accent-coral"
                : "bg-warm-white border-warm-gray"
            }`}
            style={{ minHeight: 40 }}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: selectedIds.includes(candidate.id) }}
            accessibilityLabel={candidate.name}
          >
            <Text
              className={`text-sm font-body-medium ${
                selectedIds.includes(candidate.id)
                  ? "text-civic-navy"
                  : "text-text-body"
              }`}
            >
              {candidate.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Theme filter */}
      {activeThemeId && (
        <ThemeFilter
          themes={themes}
          selectedThemeId={activeThemeId}
          onSelectTheme={(id) => {
            if (id) setActiveThemeId(id);
          }}
        />
      )}

      {/* Comparison */}
      {activeThemeId && (
        <ComparisonView
          candidates={candidates}
          selectedCandidateIds={selectedIds}
          positions={positions}
          themes={themes}
          activeThemeId={activeThemeId}
          onThemeChange={setActiveThemeId}
          onCandidateToggle={toggleCandidate}
        />
      )}
    </View>
  );
}
