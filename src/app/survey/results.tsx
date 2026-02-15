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
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">{t("computing")}</Text>
      </View>
    );
  }

  // Detect ties (Edge Case 3)
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
    router.replace("/survey/intro");
  };

  const handleCandidatePress = (candidateId: string) => {
    router.push(`/candidate/${candidateId}`);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text
          className="text-2xl font-bold text-gray-900 mt-6 mb-6"
          accessibilityRole="header"
        >
          {t("resultsTitle")}
        </Text>

        {/* Personal profile by theme */}
        <ResultsProfile themeScores={profile.themeScores} />

        {/* Alignment ranking */}
        <AlignmentRanking
          ranking={profile.candidateRanking}
          candidates={candidates}
          onCandidatePress={handleCandidatePress}
        />

        {/* Tie explanation */}
        {hasTie && (
          <TieExplanation
            tiedCandidates={tiedCandidates}
            candidates={candidates}
          />
        )}

        {/* Why this result */}
        <View className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <Text className="text-sm font-semibold text-gray-900 mb-2">
            {t("whyThisResult")}
          </Text>
          <Text className="text-sm text-gray-600">
            {t("whyThisResultExplanation")}
          </Text>
        </View>

        {/* Contradictions */}
        {profile.contradictions.length > 0 && (
          <View className="mb-4">
            <Text
              className="text-lg font-semibold text-gray-900 mb-2"
              accessibilityRole="header"
            >
              {t("contradictions")}
            </Text>
            <Text className="text-sm text-gray-600 mb-3">
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

        {/* Actions */}
        <View className="flex-row gap-3 mt-4 mb-4">
          <Pressable
            onPress={handleRetake}
            accessibilityRole="button"
            accessibilityLabel={t("retakeSurvey")}
            className="bg-gray-200 rounded-xl py-3 px-6 flex-1 items-center"
            style={{ minHeight: 48 }}
          >
            <Text className="text-gray-700 font-semibold">
              {t("retakeSurvey")}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleDone}
            accessibilityRole="button"
            accessibilityLabel={t("common:confirm")}
            className="bg-blue-600 rounded-xl py-3 px-6 flex-1 items-center"
            style={{ minHeight: 48 }}
          >
            <Text className="text-white font-semibold">
              {t("common:confirm")}
            </Text>
          </Pressable>
        </View>

        <FeedbackAction screen="survey" />
      </ScrollView>
    </View>
  );
}
