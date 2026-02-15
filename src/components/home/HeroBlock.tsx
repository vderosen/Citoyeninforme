import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import type { Election } from "../../data/schema";

interface HeroBlockProps {
  election: Election;
}

export function HeroBlock({ election }: HeroBlockProps) {
  const { t } = useTranslation("home");

  return (
    <View className="px-4 pt-6 pb-4">
      <Text
        className="text-3xl font-bold text-gray-900"
        accessibilityRole="header"
      >
        {election.city}
      </Text>
      <Text className="text-lg text-blue-600 font-medium mt-1">
        {election.type} {election.year}
      </Text>
      <Text className="text-base text-gray-600 mt-2">
        {t("purpose")}
      </Text>
    </View>
  );
}
