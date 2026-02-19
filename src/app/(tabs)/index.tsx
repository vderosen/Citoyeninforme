import { ScrollView, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { LoadingState } from "../../components/shared/LoadingState";
import { HeroBlock } from "../../components/home/HeroBlock";
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
        contentContainerStyle={{ paddingBottom: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero — election context + tagline */}
        <HeroBlock election={election} />

        {/* 2. Survey CTA — standard button (hidden when completed) */}
        <PrimaryShortcuts
          surveyStatus={surveyStatus}
          onStartSurvey={handleStartSurvey}
        />

        {/* 3. Trust banner — discreet */}
        <TrustCard />

        {/* 4. Voting info — 3 expanded cards */}
        {logistics && <VotingInfoCard logistics={logistics} />}

        {/* 5. Retake survey link — discreet, only when completed */}
        {surveyStatus === "completed" && (
          <Pressable onPress={handleStartSurvey} className="py-2">
            <Text className="text-accent-coral text-sm font-body-medium text-center">
              {t("retakeSurvey")}
            </Text>
          </Pressable>
        )}

        {/* 6. Last updated footer */}
        {election.lastUpdated && (
          <Text className="font-body-medium text-xs text-text-caption text-center py-4">
            {t("lastUpdated", { date: election.lastUpdated })}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
