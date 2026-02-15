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
        className="text-xl font-bold text-gray-900"
        accessibilityRole="header"
      >
        {t("heroHeading", { type: election.type, city: election.city, year: election.year })}
      </Text>
      <Text className="text-base text-gray-600 mt-2">
        {t("purpose")}
      </Text>
    </View>
  );
}
