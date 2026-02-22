import { ScrollView, Text, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { LoadingState } from "../../components/shared/LoadingState";
import { HeroBlock } from "../../components/home/HeroBlock";
import { NextDateBanner } from "../../components/home/NextDateBanner";
import { QuickStatsBand } from "../../components/home/QuickStatsBand";
import { PrimaryShortcuts } from "../../components/home/PrimaryShortcuts";
import { VotingInfoCard } from "../../components/home/VotingInfoCard";
import { TrustCard } from "../../components/home/TrustCard";

export default function HomeScreen() {
  const { t } = useTranslation("home");
  const router = useRouter();
  const election = useElectionStore((s) => s.election);
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const logistics = useElectionStore((s) => s.logistics);
  const candidates = useElectionStore((s) => s.candidates);
  const themes = useElectionStore((s) => s.themes);
  const positions = useElectionStore((s) => s.positions);
  const statementCards = useElectionStore((s) => s.statementCards);
  const surveyStatus = useSurveyStore((s) => s.status);
  const surveyAnswers = useSurveyStore((s) => s.answers);

  if (!isLoaded || !election) {
    return (
      <SafeAreaView className="flex-1 bg-warm-white">
        <LoadingState />
      </SafeAreaView>
    );
  }

  const handleStartSurvey = () => {
    if (surveyStatus === "not_started") {
      router.push("/(tabs)/cards");
    } else if (
      surveyStatus === "civic_context" ||
      surveyStatus === "questionnaire"
    ) {
      router.push("/(tabs)/cards");
    } else {
      useSurveyStore.getState().reset();
      router.push("/(tabs)/cards");
    }
  };

  const answeredCount = Object.keys(surveyAnswers).length;
  const totalQuestions = statementCards.length;

  return (
    <SafeAreaView className="flex-1 bg-warm-white" edges={[]}>
      <ScrollView
        className="flex-1 bg-warm-gray"
        contentContainerStyle={{ paddingBottom: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* 1. Hero — election context + tagline + curve transition */}
        <HeroBlock election={election} />

        {/* 2. Next date banner */}
        {logistics && <NextDateBanner keyDates={logistics.keyDates} />}

        {/* 3. Quick stats band */}
        <QuickStatsBand
          candidateCount={candidates.length}
          themeCount={themes.length}
          measureCount={positions.reduce((sum, p) => sum + p.measures.length, 0)}
        />

        {/* 4. Survey CTA with progress bar */}
        <PrimaryShortcuts
          surveyStatus={surveyStatus}
          onStartSurvey={handleStartSurvey}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
        />

        {/* 5. Voting info — 3 expanded cards */}
        {logistics && <VotingInfoCard logistics={logistics} />}

        {/* 6. Retake survey link — discreet, only when completed */}
        {surveyStatus === "completed" && (
          <Pressable onPress={handleStartSurvey} className="py-2">
            <Text className="text-text-caption text-sm font-body-medium text-center">
              {t("retakeSurvey")}
            </Text>
          </Pressable>
        )}

        {/* 7. Trust banner — discreet */}
        <TrustCard />

        {/* 8. Last updated footer */}
        {election.lastUpdated && (
          <Text className="font-body-medium text-xs text-text-caption text-center py-4">
            {t("lastUpdated", { date: election.lastUpdated })}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
