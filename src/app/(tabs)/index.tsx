import { ScrollView, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { LoadingState } from "../../components/shared/LoadingState";
import { PrimaryShortcuts } from "../../components/home/PrimaryShortcuts";
import { VotingInfoCard } from "../../components/home/VotingInfoCard";
import { TrustCard } from "../../components/home/TrustCard";

export default function HomeScreen() {
  const { t } = useTranslation("home");
  const router = useRouter();
  const election = useElectionStore((s) => s.election);
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const logistics = useElectionStore((s) => s.logistics);
  const surveyStatus = useSurveyStore((s) => s.status);

  if (!isLoaded || !election) {
    return (
      <SafeAreaView className="flex-1 bg-warm-white">
        <LoadingState />
      </SafeAreaView>
    );
  }

  const handleStartSurvey = () => {
    if (surveyStatus === "not_started") {
      router.push("/survey/intro");
    } else if (
      surveyStatus === "civic_context" ||
      surveyStatus === "questionnaire"
    ) {
      router.push("/survey/questions");
    } else {
      useSurveyStore.getState().reset();
      router.push("/survey/intro");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-warm-white" edges={[]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <PrimaryShortcuts
          surveyStatus={surveyStatus}
          onStartSurvey={handleStartSurvey}
        />
        {logistics && <VotingInfoCard logistics={logistics} />}
        <TrustCard />
        {election.lastUpdated && (
          <Text className="font-body-medium text-xs text-text-caption text-center py-4">
            {t("lastUpdated", { date: election.lastUpdated })}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
