import { View, Text, Pressable, Linking } from "react-native";
import { useTranslation } from "react-i18next";
import type { SourceReference as SourceReferenceType } from "../../data/schema";

interface SourceReferenceProps {
  source: SourceReferenceType;
  compact?: boolean;
}

export function SourceReference({ source, compact = false }: SourceReferenceProps) {
  const { t } = useTranslation("common");

  const handlePress = () => {
    Linking.openURL(source.url);
  };

  if (compact) {
    return (
      <Pressable
        onPress={handlePress}
        accessibilityRole="link"
        accessibilityLabel={`${t("source")}: ${source.title}`}
        hitSlop={8}
      >
        <Text className="text-blue-600 text-xs underline" numberOfLines={1}>
          {source.title}
        </Text>
      </Pressable>
    );
  }

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
