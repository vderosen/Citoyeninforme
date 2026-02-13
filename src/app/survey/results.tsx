import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSurveyStore } from "../../stores/survey";
import { ResultsChart } from "../../components/survey/ResultsChart";
import { ContradictionCard } from "../../components/survey/ContradictionCard";

export default function ResultsScreen() {
  const { t } = useTranslation(["survey", "common"]);
  const router = useRouter();
  const profile = useSurveyStore((s) => s.profile);
  const complete = useSurveyStore((s) => s.complete);
  const reset = useSurveyStore((s) => s.reset);

  if (!profile) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">{t("computing")}</Text>
      </SafeAreaView>
    );
  }

  // Check for tied scores (Edge Case 3)
  const hasTiedScores =
    profile.candidateRanking.length >= 2 &&
    profile.candidateRanking[0].alignmentScore ===
      profile.candidateRanking[1].alignmentScore;

  const handleDone = () => {
    complete();
    router.replace("/");
  };

  const handleRetake = () => {
    reset();
    router.replace("/survey/context");
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <Text
          className="text-2xl font-bold text-gray-900 mt-6 mb-6"
          accessibilityRole="header"
        >
          {t("resultsTitle")}
        </Text>

        <ResultsChart
          themeScores={profile.themeScores}
          candidateRanking={profile.candidateRanking}
        />

        {hasTiedScores && (
          <View className="bg-blue-50 rounded-xl p-4 mt-4">
            <Text className="text-sm text-blue-800">
              {t("tiedScoreExplanation")}
            </Text>
          </View>
        )}

        {profile.contradictions.length > 0 && (
          <View className="mt-6">
            <Text
              className="text-lg font-semibold text-gray-900 mb-2"
              accessibilityRole="header"
            >
              {t("contradictions")}
            </Text>
            <Text className="text-sm text-gray-600 mb-4">
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

        <View className="mt-8 flex-row justify-between">
          <Pressable
            onPress={handleRetake}
            accessibilityRole="button"
            accessibilityLabel={t("retakeSurvey")}
            className="bg-gray-200 rounded-xl py-3 px-6 flex-1 mr-2 items-center"
            style={{ minHeight: 44 }}
          >
            <Text className="text-gray-700 font-medium">
              {t("retakeSurvey")}
            </Text>
          </Pressable>
          <Pressable
            onPress={handleDone}
            accessibilityRole="button"
            accessibilityLabel={t("common:confirm")}
            className="bg-blue-600 rounded-xl py-3 px-6 flex-1 ml-2 items-center"
            style={{ minHeight: 44 }}
          >
            <Text className="text-white font-medium">
              {t("common:confirm")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
