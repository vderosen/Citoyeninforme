import { Pressable, Linking } from "react-native";
import { useTranslation } from "react-i18next";
import type { SourceReference as SourceReferenceType } from "../../data/schema";
import { AppText as Text } from "../ui/AppText";

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
        style={{ minHeight: 44, justifyContent: "center" }}
      >
        <Text className="font-body text-civic-navy text-xs underline" numberOfLines={1}>
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
      hitSlop={8}
      style={{ minHeight: 44 }}
    >
      <Text className="font-body text-civic-navy text-sm underline flex-1">
        {source.title}
      </Text>
      <Text className="font-body text-text-caption text-xs ml-2">
        {t("accessedOn", { date: source.accessDate })}
      </Text>
    </Pressable>
  );
}
