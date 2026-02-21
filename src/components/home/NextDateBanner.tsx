import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type { LogisticsDate } from "../../data/schema";
import { groupAndClassifyDates } from "../../utils/date-helpers";

interface NextDateBannerProps {
  keyDates: LogisticsDate[];
}

export function NextDateBanner({ keyDates }: NextDateBannerProps) {
  const { t } = useTranslation("home");

  const entries = groupAndClassifyDates(keyDates);
  const nextEntry = entries.find((e) => e.status === "next");

  if (!nextEntry) return null;

  return (
    <View className="mx-4 bg-civic-navy rounded-xl px-4 py-3 flex-row items-center gap-3">
      <View className="w-9 h-9 rounded-full bg-accent-coral items-center justify-center">
        <Ionicons name="calendar" size={18} color="#FAFAF8" />
      </View>
      <View className="flex-1">
        <Text className="font-body text-xs text-text-inverse opacity-70">
          {t("nextDate")}
        </Text>
        <Text className="font-display-semibold text-sm text-text-inverse">
          {nextEntry.labels.join(" · ")} · {nextEntry.formattedDate}
        </Text>
      </View>
    </View>
  );
}
