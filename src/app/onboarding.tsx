import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppStore } from "../stores/app";
import { Ionicons } from "@expo/vector-icons";

export default function OnboardingScreen() {
  const { t } = useTranslation("onboarding");
  const router = useRouter();
  const acceptPrivacyPolicy = useAppStore((s) => s.acceptPrivacyPolicy);
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const [step, setStep] = useState<1 | 2>(1);

  const handleNext = () => {
    if (step === 1) {
      acceptPrivacyPolicy("1.0"); // Hardcoding 1.0 since we deleted the separate privacy file
      setStep(2);
    } else {
      completeOnboarding();
      router.replace("/(tabs)/cards");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-warm-white">
      <View className="flex-1 px-6 justify-center">
        {step === 1 ? (
          <>
            <View className="items-center mb-8">
              <Ionicons name="shield-checkmark-outline" size={64} color="#1B2A4A" />
            </View>
            <Text className="font-display-bold text-3xl text-civic-navy text-center mb-4">
              {t("step1.title")}
            </Text>
            <Text className="font-body text-base text-text-body text-center mb-8">
              {t("step1.description")}
            </Text>
            <View className="bg-warm-gray rounded-xl p-4 mb-8">
              <Text className="font-body-medium text-sm text-text-body text-center">
                {t("step1.privacy")}
              </Text>
            </View>
            <Pressable
              onPress={handleNext}
              className="bg-accent-coral rounded-xl py-4 px-6 items-center"
            >
              <Text className="font-display-medium text-text-inverse text-base">
                {t("step1.cta")}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            <View className="items-center mb-8">
              <Ionicons name="list-outline" size={64} color="#1B2A4A" />
            </View>
            <Text className="font-display-bold text-3xl text-civic-navy text-center mb-8">
              {t("step2.title")}
            </Text>

            <View className="bg-warm-gray rounded-xl p-4 mb-4">
              <Text className="font-body-medium text-base text-civic-navy mb-1">
                {t("step2.bullet1").split(':')[0]}:
              </Text>
              <Text className="font-body text-sm text-text-body">
                {t("step2.bullet1").split(':')[1]}
              </Text>
            </View>

            <View className="bg-warm-gray rounded-xl p-4 mb-4">
              <Text className="font-body-medium text-base text-civic-navy mb-1">
                {t("step2.bullet2").split(':')[0]}:
              </Text>
              <Text className="font-body text-sm text-text-body">
                {t("step2.bullet2").split(':')[1] || t("step2.bullet2").split(' ')[1] + " " + t("step2.bullet2")}
              </Text>
            </View>

            <View className="bg-warm-gray rounded-xl p-4 mb-8">
              <Text className="font-body-medium text-base text-civic-navy mb-1">
                {t("step2.bullet3").split(':')[0]}:
              </Text>
              <Text className="font-body text-sm text-text-body">
                {t("step2.bullet3").split(':')[1]}
              </Text>
            </View>

            <Pressable
              onPress={handleNext}
              className="bg-accent-coral rounded-xl py-4 px-6 items-center"
            >
              <Text className="font-display-medium text-text-inverse text-base">
                {t("step2.cta")}
              </Text>
            </Pressable>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
