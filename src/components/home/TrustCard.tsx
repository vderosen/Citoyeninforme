import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { TrustBadge } from "../shared/TrustBadge";

export function TrustCard() {
  const { t } = useTranslation("common");
  const { t: tHome } = useTranslation("home");

  return (
    <View className="mx-4 bg-warm-gray rounded-xl p-4">
      <Text className="font-display-semibold text-base text-civic-navy mb-2">
        {tHome("trustTitle")}
      </Text>
      <Text className="font-body text-sm text-text-body mb-3 leading-relaxed">
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
