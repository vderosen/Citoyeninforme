import { View, Text, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
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
    <View className="flex-1 bg-warm-white">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="px-4 mt-4 mb-6">
          <Text
            className="font-display-bold text-2xl text-civic-navy mb-2"
            accessibilityRole="header"
          >
            {t("civicContextTitle")}
          </Text>
          <Text className="font-body text-base text-text-body">
            {t("civicContextSubtitle", { city: election?.city ?? "" })}
          </Text>
        </View>

        <CivicPrimer facts={civicFacts} onContinue={handleContinue} />
      </ScrollView>
    </View>
  );
}
