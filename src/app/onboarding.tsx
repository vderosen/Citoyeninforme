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
    <SafeAreaView className="flex-1 bg-warm-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
      >
        <View className="flex-1 px-6 justify-center">
          <Text
            className="font-display-bold text-3xl text-civic-navy text-center mt-12 mb-2"
            accessibilityRole="header"
          >
            {t("welcome")}
          </Text>
          <Text className="font-body text-base text-text-body text-center mb-8">
            {t("description")}
          </Text>

          <Text className="font-body text-sm text-text-body text-center mb-8 px-4">
            {t("purpose")}
          </Text>

          <View className="gap-4 mb-8">
            {tabs.map((tab) => (
              <View key={tab.title} className="bg-warm-gray rounded-xl p-4">
                <Text className="font-display-medium text-base text-civic-navy mb-1">
                  {tab.title}
                </Text>
                <Text className="font-body text-sm text-text-body">
                  {tab.description}
                </Text>
              </View>
            ))}
          </View>

          <View className="bg-civic-navy-light rounded-xl p-4 mb-8">
            <Text className="font-body text-sm text-civic-navy text-center">
              {t("neutrality")}
            </Text>
          </View>

          <Pressable
            onPress={handleGetStarted}
            className="bg-accent-coral rounded-xl py-4 px-6 items-center"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel={t("getStarted")}
          >
            <Text className="font-display-medium text-text-inverse text-base">
              {t("getStarted")}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
