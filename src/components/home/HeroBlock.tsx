import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import type { Election } from "../../data/schema";

interface HeroBlockProps {
  election: Election;
}

export function HeroBlock({ election }: HeroBlockProps) {
  const { t } = useTranslation("home");

  return (
    <View>
      {/* Hero content with decorative circles */}
      <View className="bg-civic-navy px-5 pt-4 pb-6 overflow-hidden">
        {/* Decorative circles — top-right corner */}
        <View
          className="absolute -top-6 -right-6 w-32 h-32 rounded-full"
          style={{ backgroundColor: "rgba(232,85,58,0.12)" }}
        />
        <View
          className="absolute top-8 -right-3 w-20 h-20 rounded-full"
          style={{ backgroundColor: "rgba(232,85,58,0.08)" }}
        />

        <Text
          className="font-display-bold text-[24px] leading-tight text-text-inverse"
          accessibilityRole="header"
        >
          {t("heroHeading", { city: election.city, year: election.year })}
        </Text>
        <Text className="font-display-semibold text-lg text-accent-coral mt-1">
          {t("subtitle")}
        </Text>
        <Text className="font-body text-[13px] text-text-inverse mt-2 opacity-80 leading-snug">
          {t("purpose")}
        </Text>
      </View>

      {/* Curve transition — navy → warm-gray */}
      <View className="bg-civic-navy">
        <View
          className="bg-warm-gray h-4"
          style={{ borderTopLeftRadius: 20, borderTopRightRadius: 20 }}
        />
      </View>
    </View>
  );
}
