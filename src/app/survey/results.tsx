import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { ResultsProfile } from "../../components/survey/ResultsProfile";
import { AlignmentRanking } from "../../components/survey/AlignmentRanking";
import { TieExplanation } from "../../components/survey/TieExplanation";
import { ContradictionCard } from "../../components/survey/ContradictionCard";
import { FeedbackAction } from "../../components/shared/FeedbackAction";

export default function ResultsScreen() {
  const { t } = useTranslation(["survey", "common"]);
  const router = useRouter();
  const candidates = useElectionStore((s) => s.candidates);
  const profile = useSurveyStore((s) => s.profile);
  const complete = useSurveyStore((s) => s.complete);
  const reset = useSurveyStore((s) => s.reset);

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-warm-white">
        <Text className="font-body text-text-caption">{t("computing")}</Text>
      </View>
    );
  }

  const tiedCandidates = profile.candidateRanking.filter(
    (match, _, arr) => arr[0] && match.alignmentScore === arr[0].alignmentScore
  );
  const hasTie = tiedCandidates.length > 1;

  const handleDone = () => {
    complete();
    router.replace("/");
  };

  const handleRetake = () => {
    reset();
    router.replace("/survey/questions");
  };

  const handleCandidatePress = (_candidateId: string) => {
    router.push("/(tabs)/candidates");
  };

  return (
    <View className="flex-1 bg-warm-white">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text
          className="font-display-bold text-2xl text-civic-navy mt-6 mb-6"
          accessibilityRole="header"
        >
          {t("resultsTitle")}
        </Text>

        <ResultsProfile themeScores={profile.themeScores} />

        <AlignmentRanking
          ranking={profile.candidateRanking}
          candidates={candidates}
          onCandidatePress={handleCandidatePress}
        />

        {hasTie && (
          <TieExplanation
            tiedCandidates={tiedCandidates}
            candidates={candidates}
          />
        )}

        <View className="bg-warm-gray rounded-xl p-4 mb-4">
          <Text className="font-display-medium text-sm text-civic-navy mb-2">
            {t("whyThisResult")}
          </Text>
          <Text className="font-body text-sm text-text-body">
            {t("whyThisResultExplanation")}
          </Text>
        </View>

        {profile.contradictions.length > 0 && (
          <View className="mb-4">
            <Text
              className="font-display-semibold text-lg text-civic-navy mb-2"
              accessibilityRole="header"
            >
              {t("contradictions")}
            </Text>
            <Text className="font-body text-sm text-text-body mb-3">
              {t("contradictionExplanation")}
            </Text>
            {profile.contradictions.map((contradiction, index) => (
              <ContradictionCard
                key={index}
                contradiction={contradiction}
              />
            ))}
          </View>
        )}

        <View className="flex-row gap-3 mt-4 mb-4">
          <Pressable
            onPress={handleRetake}
            accessibilityRole="button"
            accessibilityLabel={t("retakeSurvey")}
            className="bg-warm-gray rounded-xl py-3 px-6 flex-1 items-center"
            style={{ minHeight: 48 }}
          >
            <Text className="font-display-medium text-civic-navy">
              {t("retakeSurvey")}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleDone}
            accessibilityRole="button"
            accessibilityLabel={t("common:confirm")}
            className="bg-accent-coral rounded-xl py-3 px-6 flex-1 items-center"
            style={{ minHeight: 48 }}
          >
            <Text className="font-display-medium text-text-inverse">
              {t("common:confirm")}
            </Text>
          </Pressable>
        </View>

        <FeedbackAction screen="survey" />
      </ScrollView>
    </View>
  );
}
