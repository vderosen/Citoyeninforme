import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import Constants from "expo-constants";

export function AboutSection() {
  const { t } = useTranslation("settings");
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";
  const buildNumber =
    Constants.expoConfig?.ios?.buildNumber ??
    String(Constants.expoConfig?.android?.versionCode ?? "1");

  return (
    <View className="mb-6">
      <Text className="font-display-medium text-base text-civic-navy mb-3 px-4">
        {t("about.title")}
      </Text>

      <View className="bg-warm-gray rounded-xl px-4 py-3 mb-2">
        <View className="flex-row justify-between">
          <Text className="font-body text-sm text-text-body">
            {t("about.version")}
          </Text>
          <Text className="font-body text-sm text-text-caption">
            {appVersion}
          </Text>
        </View>
      </View>

      <View className="bg-warm-gray rounded-xl px-4 py-3 mb-2">
        <View className="flex-row justify-between">
          <Text className="font-body text-sm text-text-body">
            {t("about.build")}
          </Text>
          <Text className="font-body text-sm text-text-caption">
            {buildNumber}
          </Text>
        </View>
      </View>

      <View className="bg-warm-gray rounded-xl px-4 py-3">
        <Text className="font-body text-xs text-text-caption text-center">
          {t("about.credits")}
        </Text>
      </View>
    </View>
  );
}
