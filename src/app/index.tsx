import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useElectionStore } from "../stores/election";

export default function HomeScreen() {
  const { t } = useTranslation(["home", "common"]);
  const router = useRouter();
  const election = useElectionStore((s) => s.election);
  const isLoaded = useElectionStore((s) => s.isLoaded);

  if (!isLoaded || !election) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">{t("common:loading")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="mt-8 mb-6">
          <Text
            className="text-3xl font-bold text-gray-900"
            accessibilityRole="header"
          >
            {t("title", { city: election.city, year: election.year })}
          </Text>
          <Text className="text-lg text-gray-500 mt-1">
            {t("subtitle")}
          </Text>
        </View>

        <Text className="text-base text-gray-700 mb-8 leading-6">
          {t("purpose")}
        </Text>

        <Pressable
          onPress={() => router.push("/survey/context")}
          accessibilityRole="button"
          accessibilityLabel={t("startSurvey")}
          className="bg-blue-600 rounded-xl py-4 px-6 mb-4 items-center"
          style={{ minHeight: 44 }}
        >
          <Text className="text-white font-semibold text-base">
            {t("startSurvey")}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/learn")}
          accessibilityRole="button"
          accessibilityLabel={t("exploreCandidates")}
          className="bg-gray-100 rounded-xl py-4 px-6 mb-4 items-center"
          style={{ minHeight: 44 }}
        >
          <Text className="text-gray-800 font-semibold text-base">
            {t("exploreCandidates")}
          </Text>
        </Pressable>

        <View className="mt-8 bg-gray-50 rounded-xl p-4">
          <Text className="text-sm text-gray-500 leading-5">
            {t("common:neutralityStatement")}
          </Text>
        </View>

        <Text className="text-xs text-gray-400 mt-4 text-center">
          {t("dataSource")}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
