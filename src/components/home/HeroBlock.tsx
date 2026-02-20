import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import type { Election } from "../../data/schema";

interface HeroBlockProps {
  election: Election;
}

export function HeroBlock({ election }: HeroBlockProps) {
  const { t } = useTranslation("home");

  return (
    <View className="bg-civic-navy px-5 pt-8 pb-6">
      <Text
        className="font-display-bold text-[28px] leading-tight text-text-inverse"
        accessibilityRole="header"
      >
        {t("heroHeading", { city: election.city, year: election.year })}
      </Text>
      <Text className="font-display-semibold text-lg text-accent-coral mt-1">
        {t("subtitle")}
      </Text>
      <Text className="font-body text-[13px] text-text-inverse mt-3 opacity-80 leading-snug">
        {t("purpose")}
      </Text>
    </View>
  );
}
