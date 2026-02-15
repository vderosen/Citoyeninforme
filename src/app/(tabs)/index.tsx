import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { useAssistantStore } from "../../stores/assistant";
import { LoadingState } from "../../components/shared/LoadingState";
import { HeroBlock } from "../../components/home/HeroBlock";
import { PrimaryShortcuts } from "../../components/home/PrimaryShortcuts";
import { VotingInfoCard } from "../../components/home/VotingInfoCard";
import { TrustCard } from "../../components/home/TrustCard";
import { ResumeCard } from "../../components/home/ResumeCard";
import { ThemeFeed } from "../../components/home/ThemeFeed";

export default function HomeScreen() {
  const router = useRouter();
  const election = useElectionStore((s) => s.election);
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const logistics = useElectionStore((s) => s.logistics);
  const themes = useElectionStore((s) => s.themes);
  const surveyStatus = useSurveyStore((s) => s.status);
  const messages = useAssistantStore((s) => s.messages);

  if (!isLoaded || !election) {
    return (
      <SafeAreaView className="flex-1 bg-white">
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
      // results_ready or completed — retake
      useSurveyStore.getState().reset();
      router.push("/survey/intro");
    }
  };

  const handleViewCandidates = () => {
    router.push("/(tabs)/candidates");
  };

  const handleAskQuestion = () => {
    router.push("/(tabs)/assistant");
  };

  const handleResumeSurvey = () => {
    router.push("/survey/questions");
  };

  const handleResumeChat = () => {
    router.push("/(tabs)/assistant");
  };

  const handleThemePress = (themeId: string) => {
    router.push({ pathname: "/(tabs)/candidates", params: { theme: themeId } });
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24, gap: 16 }}
        showsVerticalScrollIndicator={false}
      >
        <HeroBlock election={election} />
        <PrimaryShortcuts
          surveyStatus={surveyStatus}
          onStartSurvey={handleStartSurvey}
          onViewCandidates={handleViewCandidates}
          onAskQuestion={handleAskQuestion}
        />
        <ResumeCard
          surveyStatus={surveyStatus}
          hasConversation={messages.length > 0}
          onResumeSurvey={handleResumeSurvey}
          onResumeChat={handleResumeChat}
        />
        {logistics && <VotingInfoCard logistics={logistics} />}
        <TrustCard />
        <ThemeFeed themes={themes} onThemePress={handleThemePress} />
      </ScrollView>
    </SafeAreaView>
  );
}
