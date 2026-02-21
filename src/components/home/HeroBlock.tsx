import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import type { Election } from "../../data/schema";

interface HeroBlockProps {
  election: Election;
}

export function HeroBlock({ election }: HeroBlockProps) {
  const { t } = useTranslation("home");
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View>
      {/* Hero content — extends to screen top, no header boundary */}
      <View
        className="bg-civic-navy px-5 pb-6"
        style={{ paddingTop: insets.top + 8 }}
      >
        {/* Decorative circles — positioned to overlap status bar naturally */}
        <View
          className="absolute -right-6 w-32 h-32 rounded-full"
          style={{ backgroundColor: "rgba(232,85,58,0.12)", top: insets.top + 39 }}
        />
        <View
          className="absolute -right-3 w-20 h-20 rounded-full"
          style={{ backgroundColor: "rgba(232,85,58,0.08)", top: insets.top + 87 }}
        />

        {/* Inline header — centered title, settings on right */}
        <View className="flex-row items-center mb-3">
          <View className="w-10" />
          <View className="flex-1 items-center">
            <Text className="font-display-semibold text-[17px] text-text-inverse">
              Lucide
            </Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            className="w-10 items-end p-1"
            accessibilityRole="button"
            accessibilityLabel="Paramètres"
          >
            <Ionicons name="settings-outline" size={22} color="#FAFAF8" />
          </Pressable>
        </View>

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
