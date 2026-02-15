import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import * as WebBrowser from "expo-web-browser";
import { useAppStore } from "../../stores/app";

const PRIVACY_POLICY_URL =
  process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL ?? "https://lucide.app/privacy-policy";

export function PrivacySection() {
  const { t } = useTranslation("settings");
  const consentTimestamp = useAppStore((s) => s.consentTimestamp);
  const privacyConsentVersion = useAppStore((s) => s.privacyConsentVersion);

  const formattedDate = consentTimestamp
    ? new Date(consentTimestamp).toLocaleDateString("fr-FR")
    : null;

  return (
    <View className="mb-6">
      <Text className="font-display-medium text-base text-civic-navy mb-3 px-4">
        {t("privacy.title")}
      </Text>

      <Pressable
        onPress={() => WebBrowser.openBrowserAsync(PRIVACY_POLICY_URL)}
        className="bg-warm-gray rounded-xl px-4 py-3 mb-2"
        accessibilityRole="link"
      >
        <Text className="font-body text-sm text-accent-coral">
          {t("privacy.policy")}
        </Text>
      </Pressable>

      {formattedDate && (
        <View className="bg-warm-gray rounded-xl px-4 py-3 mb-2">
          <Text className="font-body text-sm text-text-body">
            {t("privacy.consentDate", { date: formattedDate })}
          </Text>
          {privacyConsentVersion && (
            <Text className="font-body text-xs text-text-caption mt-1">
              {t("privacy.policyVersion", { version: privacyConsentVersion })}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
