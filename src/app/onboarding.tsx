import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "../stores/app";

export default function OnboardingScreen() {
  const { t } = useTranslation("onboarding");
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const handleGetStarted = () => {
    completeOnboarding();
    router.replace("/(tabs)");
  };

  const tabs = [
    { title: t("tabAccueil"), description: t("tabAccueilDescription") },
    { title: t("tabAssistant"), description: t("tabAssistantDescription") },
    { title: t("tabCandidats"), description: t("tabCandidatsDescription") },
  ];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
      >
        <View className="flex-1 px-6 justify-center">
          <Text
            className="text-3xl font-bold text-gray-900 text-center mt-12 mb-2"
            accessibilityRole="header"
          >
            {t("welcome")}
          </Text>
          <Text className="text-base text-gray-600 text-center mb-8">
            {t("description")}
          </Text>

          <Text className="text-sm text-gray-700 text-center mb-8 px-4">
            {t("purpose")}
          </Text>

          <View className="gap-4 mb-8">
            {tabs.map((tab) => (
              <View key={tab.title} className="bg-gray-50 rounded-xl p-4">
                <Text className="text-base font-semibold text-gray-900 mb-1">
                  {tab.title}
                </Text>
                <Text className="text-sm text-gray-600">
                  {tab.description}
                </Text>
              </View>
            ))}
          </View>

          <View className="bg-blue-50 rounded-xl p-4 mb-8">
            <Text className="text-sm text-blue-800 text-center">
              {t("neutrality")}
            </Text>
          </View>

          <Pressable
            onPress={handleGetStarted}
            className="bg-blue-600 rounded-xl py-4 px-6 items-center"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel={t("getStarted")}
          >
            <Text className="text-white font-semibold text-base">
              {t("getStarted")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
