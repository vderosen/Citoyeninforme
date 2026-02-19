import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";

export function TrustCard() {
  const { t } = useTranslation("common");

  return (
    <View className="mx-4 px-4 py-3 bg-warm-gray/50 rounded-lg flex-row items-center gap-2">
      <Ionicons name="shield-checkmark-outline" size={16} color="#1B2A4A" />
      <Text className="font-body text-xs text-text-caption leading-relaxed flex-1">
        {t("neutralityStatement")}
      </Text>
    </View>
  );
}
