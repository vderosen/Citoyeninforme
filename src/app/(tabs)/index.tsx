import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { LoadingState } from "../../components/shared/LoadingState";
import { HeroBlock } from "../../components/home/HeroBlock";
import { CandidateCarousel } from "../../components/home/CandidateCarousel";
import { VotingInfoCard } from "../../components/home/VotingInfoCard";

export default function HomeScreen() {
  const { t } = useTranslation("home");
  const election = useElectionStore((s) => s.election);
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const logistics = useElectionStore((s) => s.logistics);
  const candidates = useElectionStore((s) => s.candidates);

  if (!isLoaded || !election) {
    return (
      <SafeAreaView className="flex-1 bg-warm-white">
        <LoadingState />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-warm-white" edges={[]}>
      <ScrollView
        className="flex-1 bg-warm-gray"
        contentContainerStyle={{ paddingBottom: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero — election context + tagline */}
        <HeroBlock election={election} />

        {/* 2. Candidate carousel — swipe to explore */}
        <CandidateCarousel candidates={candidates} />

        {/* 3. Voting info — key dates, eligibility, voting methods */}
        {logistics && <VotingInfoCard logistics={logistics} />}

        {/* 4. Last updated footer */}
        {election.lastUpdated && (
          <Text className="font-body-medium text-xs text-text-caption text-center py-4">
            {t("lastUpdated", { date: election.lastUpdated })}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
