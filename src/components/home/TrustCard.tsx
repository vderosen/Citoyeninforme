import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { TrustBadge } from "../shared/TrustBadge";

export function TrustCard() {
  const { t } = useTranslation("common");
  const { t: tHome } = useTranslation("home");

  return (
    <View className="mx-4 bg-blue-50 rounded-xl p-4">
      <Text className="text-base font-semibold text-gray-900 mb-2">
        {tHome("trustTitle")}
      </Text>
      <Text className="text-sm text-gray-600 mb-3">
        {t("neutralityStatement")}
      </Text>
      <View className="flex-row flex-wrap gap-2">
        <TrustBadge variant="source" />
        <TrustBadge variant="non_documente" />
        <TrustBadge variant="incertain" />
      </View>
    </View>
  );
}
