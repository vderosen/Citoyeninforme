import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { CivicPrimer } from "../../components/survey/CivicPrimer";

export default function SurveyIntroScreen() {
  const { t } = useTranslation(["survey", "common"]);
  const router = useRouter();
  const election = useElectionStore((s) => s.election);
  const civicFacts = useElectionStore((s) => s.civicFacts);
  const startCivicContext = useSurveyStore((s) => s.startCivicContext);
  const startQuestionnaire = useSurveyStore((s) => s.startQuestionnaire);

  const handleContinue = () => {
    startCivicContext();
    startQuestionnaire();
    router.push("/survey/questions");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t("common:back")}
          className="px-4 mt-4"
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text className="text-blue-600 text-base">← {t("common:back")}</Text>
        </Pressable>

        <View className="px-4 mt-4 mb-6">
          <Text
            className="text-2xl font-bold text-gray-900 mb-2"
            accessibilityRole="header"
          >
            {t("civicContextTitle")}
          </Text>
          <Text className="text-base text-gray-600">
            {t("civicContextSubtitle", { city: election?.city ?? "" })}
          </Text>
        </View>

        <CivicPrimer facts={civicFacts} onContinue={handleContinue} />
      </ScrollView>
    </SafeAreaView>
  );
}
