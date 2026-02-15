import { useState, useEffect } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useElectionStore } from "../../stores/election";
import { LoadingState } from "../../components/shared/LoadingState";
import { CandidateGallery } from "../../components/candidates/CandidateGallery";
import { ThemeFilter } from "../../components/candidates/ThemeFilter";

export default function CandidatesScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ theme?: string }>();
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const candidates = useElectionStore((s) => s.candidates);
  const themes = useElectionStore((s) => s.themes);
  const positions = useElectionStore((s) => s.positions);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  useEffect(() => {
    if (params.theme) {
      setSelectedThemeId(params.theme);
    }
  }, [params.theme]);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-warm-white">
        <LoadingState />
      </SafeAreaView>
    );
  }

  const positionSnippets: Record<string, string> = {};
  if (selectedThemeId) {
    for (const candidate of candidates) {
      const pos = positions.find(
        (p) => p.candidateId === candidate.id && p.themeId === selectedThemeId
      );
      if (pos) {
        positionSnippets[candidate.id] = pos.summary;
      }
    }
  }

  const handleCandidatePress = (candidateId: string) => {
    router.push(`/candidate/${candidateId}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-warm-white" edges={[]}>
      <View className="flex-1">
        <ThemeFilter
          themes={themes}
          selectedThemeId={selectedThemeId}
          onSelectTheme={setSelectedThemeId}
        />
        <CandidateGallery
          candidates={candidates}
          onCandidatePress={handleCandidatePress}
          activeThemeFilter={selectedThemeId ?? undefined}
          positionSnippets={selectedThemeId ? positionSnippets : undefined}
        />
      </View>
    </SafeAreaView>
  );
}
