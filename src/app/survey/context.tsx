import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";

export default function CivicContextScreen() {
  const { t } = useTranslation(["survey", "common"]);
  const router = useRouter();
  const election = useElectionStore((s) => s.election);
  const civicFacts = useElectionStore((s) => s.civicFacts);
  const startQuestionnaire = useSurveyStore((s) => s.startQuestionnaire);

  const handleStart = () => {
    startQuestionnaire();
    router.push("/survey/questions");
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <Pressable
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel={t("common:back")}
          className="mt-4"
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text className="text-blue-600 text-base">{t("common:back")}</Text>
        </Pressable>

        <Text
          className="text-2xl font-bold text-gray-900 mt-4 mb-2"
          accessibilityRole="header"
        >
          {t("civicContextTitle")}
        </Text>
        <Text className="text-base text-gray-600 mb-6">
          {t("civicContextSubtitle", { city: election?.city ?? "" })}
        </Text>

        {civicFacts.map((fact, index) => (
          <View
            key={fact.id}
            className="bg-blue-50 rounded-xl p-4 mb-4"
          >
            <Text className="text-base text-gray-800 leading-6">
              {fact.text}
            </Text>
            <Text className="text-xs text-gray-400 mt-2">
              {t("common:source")}: {fact.source.title}
            </Text>
          </View>
        ))}

        <Pressable
          onPress={handleStart}
          accessibilityRole="button"
          accessibilityLabel={t("startQuestionnaire")}
          className="bg-blue-600 rounded-xl py-4 px-6 mt-4 items-center"
          style={{ minHeight: 44 }}
        >
          <Text className="text-white font-semibold text-base">
            {t("startQuestionnaire")}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
