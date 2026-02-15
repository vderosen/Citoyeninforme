import { Text } from "react-native";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
  useReducedMotion,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
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
import SteppedDivider from "../../components/ui/SteppedDivider";

export default function HomeScreen() {
  const { t } = useTranslation("home");
  const router = useRouter();
  const election = useElectionStore((s) => s.election);
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const logistics = useElectionStore((s) => s.logistics);
  const themes = useElectionStore((s) => s.themes);
  const surveyStatus = useSurveyStore((s) => s.status);
  const messages = useAssistantStore((s) => s.messages);

  const scrollY = useSharedValue(0);
  const reduceMotion = useReducedMotion();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const heroParallaxStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scrollY.value * 0.5 }],
  }));

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
    <SafeAreaView className="flex-1 bg-warm-white" edges={[]}>
      <Animated.ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
      >
        <Animated.View style={reduceMotion ? undefined : heroParallaxStyle}>
          <HeroBlock election={election} />
        </Animated.View>
        <SteppedDivider className="my-4" />
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
        <SteppedDivider className="my-4" />
        <ThemeFeed themes={themes} onThemePress={handleThemePress} />
        <SteppedDivider className="my-4" />
        {logistics && <VotingInfoCard logistics={logistics} />}
        <TrustCard />
        {election.lastUpdated && (
          <Text className="font-body-medium text-xs text-text-caption text-center py-4">
            {t("lastUpdated", { date: election.lastUpdated })}
          </Text>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}
