import { Text } from "react-native";
import { useTranslation } from "react-i18next";

export function TrustCard() {
  const { t } = useTranslation("common");

  return (
    <Text className="font-body text-xs text-text-caption text-center leading-relaxed px-8">
      {t("neutralityStatement")}
    </Text>
  );
}
