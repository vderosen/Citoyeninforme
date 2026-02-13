import { View, Text, Pressable, Linking } from "react-native";
import { useTranslation } from "react-i18next";
import type { SourceReference as SourceReferenceType } from "../../data/schema";

interface Props {
  source: SourceReferenceType;
}

export function SourceReference({ source }: Props) {
  const { t } = useTranslation("common");

  const handlePress = () => {
    Linking.openURL(source.url);
  };

  return (
    <Pressable
      onPress={handlePress}
      accessibilityRole="link"
      accessibilityLabel={`${t("source")}: ${source.title}`}
      className="flex-row items-center py-1"
    >
      <Text className="text-blue-600 text-sm underline flex-1">
        {source.title}
      </Text>
      <Text className="text-gray-400 text-xs ml-2">
        {t("accessedOn", { date: source.accessDate })}
      </Text>
    </Pressable>
  );
}
