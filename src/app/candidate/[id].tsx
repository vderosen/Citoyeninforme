import { ScrollView, View } from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { useElectionStore } from "../../stores/election";
import { useAssistantStore } from "../../stores/assistant";
import { LoadingState } from "../../components/shared/LoadingState";
import { EmptyState } from "../../components/shared/EmptyState";
import { CandidateProfileCard } from "../../components/candidates/CandidateProfileCard";
import { useTranslation } from "react-i18next";

export default function CandidateProfileScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation("candidates");
  const router = useRouter();
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const getCandidateById = useElectionStore((s) => s.getCandidateById);
  const getPositionsForCandidate = useElectionStore((s) => s.getPositionsForCandidate);
  const themes = useElectionStore((s) => s.themes);
  const selectMode = useAssistantStore((s) => s.selectMode);
  const selectCandidate = useAssistantStore((s) => s.selectCandidate);

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-warm-white">
        <LoadingState />
      </View>
    );
  }

  const candidate = id ? getCandidateById(id) : undefined;
  if (!candidate) {
    return (
      <View className="flex-1 bg-warm-white">
        <EmptyState
          title={t("emptyProfile")}
          description={t("emptyProfileDescription")}
          action={{ label: t("backToCandidates"), onPress: () => router.replace("/(tabs)/candidates") }}
        />
      </View>
    );
  }

  const positions = getPositionsForCandidate(candidate.id);

  const handleDebate = () => {
    selectMode("parler");
    selectCandidate(candidate.id);
    router.push("/(tabs)/assistant");
  };

  return (
    <View className="flex-1 bg-warm-white">
      <Stack.Screen options={{ title: candidate.name }} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <CandidateProfileCard
          candidate={candidate}
          positions={positions}
          themes={themes}
          onDebate={handleDebate}
        />
      </ScrollView>
    </View>
  );
}
