import { useState, useCallback, useMemo } from "react";
import { View, Text, LayoutAnimation, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useAssistantStore } from "../../stores/assistant";
import { LoadingState } from "../../components/shared/LoadingState";
import { CandidateAvatarBar } from "../../components/comparison/CandidateAvatarBar";
import { CandidateProfileCard } from "../../components/candidates/CandidateProfileCard";
import { ComparisonView } from "../../components/candidates/ComparisonView";
import { ThemeTabBar } from "../../components/candidates/ThemeTabBar";
import { deterministicShuffle, dailySeed } from "../../utils/shuffle";

const MAX_SELECTED = 4;

export default function CandidatesScreen() {
  const { t } = useTranslation("candidates");
  const router = useRouter();
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const candidates = useElectionStore((s) => s.candidates);
  const themes = useElectionStore((s) => s.themes);
  const positions = useElectionStore((s) => s.positions);
  const getCandidateById = useElectionStore((s) => s.getCandidateById);
  const getPositionsForCandidate = useElectionStore(
    (s) => s.getPositionsForCandidate
  );
  const selectMode = useAssistantStore((s) => s.selectMode);
  const selectCandidate = useAssistantStore((s) => s.selectCandidate);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeThemeId, setActiveThemeId] = useState(themes[0]?.id ?? "");

  const shuffledCandidates = useMemo(
    () => deterministicShuffle(candidates, dailySeed()),
    [candidates]
  );

  const toggleCandidate = useCallback(
    (candidateId: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSelectedIds((prev) => {
        if (prev.includes(candidateId)) {
          return prev.filter((id) => id !== candidateId);
        }
        if (prev.length >= MAX_SELECTED) return prev;
        return [...prev, candidateId];
      });
    },
    []
  );

  const handleDebate = useCallback(() => {
    if (selectedIds.length !== 1) return;
    selectMode("parler");
    selectCandidate(selectedIds[0]);
    router.push("/(tabs)/assistant");
  }, [selectedIds, selectMode, selectCandidate, router]);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-warm-white">
        <LoadingState />
      </SafeAreaView>
    );
  }

  const renderContent = () => {
    // US3: Empty state guidance
    if (selectedIds.length === 0) {
      return (
        <View className="flex-1 items-center justify-center px-8 py-12">
          <Text className="font-display-semibold text-lg text-civic-navy text-center mb-2">
            {t("emptyStateTitle")}
          </Text>
          <Text className="font-body text-sm text-text-caption text-center">
            {t("emptyStateDescription")}
          </Text>
        </View>
      );
    }

    // US1: Single candidate profile
    if (selectedIds.length === 1) {
      const candidate = getCandidateById(selectedIds[0]);
      if (!candidate) return null;
      const candidatePositions = getPositionsForCandidate(selectedIds[0]);
      return (
        <CandidateProfileCard
          candidate={candidate}
          positions={candidatePositions}
          themes={themes}
          onDebate={handleDebate}
        />
      );
    }

    // US2: Multi-candidate comparison (2-4)
    return (
      <View>
        <ThemeTabBar
          themes={themes}
          activeThemeId={activeThemeId}
          onSelectTheme={setActiveThemeId}
        />
        <ComparisonView
          candidates={candidates}
          selectedCandidateIds={selectedIds}
          positions={positions}
          activeThemeId={activeThemeId}
        />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-warm-white" edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <CandidateAvatarBar
          candidates={shuffledCandidates}
          selectedIds={selectedIds}
          onToggle={toggleCandidate}
          maxSelected={MAX_SELECTED}
        />
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
}
