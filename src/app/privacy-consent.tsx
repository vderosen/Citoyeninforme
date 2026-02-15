import { useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import * as WebBrowser from "expo-web-browser";
import { useAppStore } from "../stores/app";

export const PRIVACY_POLICY_VERSION = "1.0";
const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? "https://lucide.app/privacy-policy";

export default function PrivacyConsentScreen() {
  const { t } = useTranslation("privacy");
  const router = useRouter();
  const acceptPrivacyPolicy = useAppStore((s) => s.acceptPrivacyPolicy);
  const hasCompletedOnboarding = useAppStore((s) => s.hasCompletedOnboarding);
  const privacyConsentVersion = useAppStore((s) => s.privacyConsentVersion);
  const [declined, setDeclined] = useState(false);
  const [policyError, setPolicyError] = useState(false);

  const isReConsent = privacyConsentVersion !== null;

  const handleAccept = () => {
    acceptPrivacyPolicy(PRIVACY_POLICY_VERSION);
    if (hasCompletedOnboarding) {
      router.replace("/(tabs)");
    } else {
      router.replace("/onboarding");
    }
  };

  const handleDecline = () => {
    setDeclined(true);
  };

  const handleOpenPolicy = async () => {
    try {
      setPolicyError(false);
      await WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL);
    } catch {
      setPolicyError(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-warm-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32, flexGrow: 1 }}
      >
        <View className="flex-1 px-6 justify-center">
          <Text
            className="font-display-bold text-3xl text-civic-navy text-center mt-12 mb-4"
            accessibilityRole="header"
          >
            {t("title")}
          </Text>

          {isReConsent && (
            <View className="bg-amber-50 rounded-xl p-4 mb-4">
              <Text className="font-body text-sm text-amber-800 text-center">
                {t("updatedPolicy")}
              </Text>
            </View>
          )}

          <Text className="font-body text-base text-text-body text-center mb-6">
            {t("description")}
          </Text>

          <View className="bg-warm-gray rounded-xl p-4 mb-4">
            <Text className="font-body text-sm text-text-body text-center">
              {t("dataStorage")}
            </Text>
          </View>

          <View className="bg-warm-gray rounded-xl p-4 mb-6">
            <Text className="font-body text-sm text-text-body text-center">
              {t("crashReports")}
            </Text>
          </View>

          <Pressable
            onPress={handleOpenPolicy}
            className="mb-8"
            accessibilityRole="link"
            accessibilityLabel={t("policyLink")}
          >
            <Text className="font-body-medium text-accent-coral text-center text-base underline">
              {t("policyLink")}
            </Text>
          </Pressable>

          {policyError && (
            <View className="bg-red-50 rounded-xl p-3 mb-4">
              <Text className="font-body text-xs text-red-800 text-center">
                Impossible d'ouvrir la politique de confidentialité. Vérifiez votre connexion internet.
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleAccept}
            className="bg-accent-coral rounded-xl py-4 px-6 items-center mb-3"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel={t("accept")}
          >
            <Text className="font-display-medium text-text-inverse text-base">
              {t("accept")}
            </Text>
          </Pressable>

          <Pressable
            onPress={handleDecline}
            className="bg-warm-gray rounded-xl py-4 px-6 items-center"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel={t("decline")}
          >
            <Text className="font-display-medium text-civic-navy text-base">
              {t("decline")}
            </Text>
          </Pressable>

          {declined && (
            <View className="bg-red-50 rounded-xl p-4 mt-4">
              <Text className="font-body text-sm text-red-800 text-center">
                {t("declineMessage")}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
