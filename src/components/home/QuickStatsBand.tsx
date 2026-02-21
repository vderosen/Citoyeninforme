import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";

interface QuickStatsBandProps {
  candidateCount: number;
  themeCount: number;
  measureCount: number;
}

export function QuickStatsBand({
  candidateCount,
  themeCount,
  measureCount,
}: QuickStatsBandProps) {
  const { t } = useTranslation("home");

  const stats = [
    { value: candidateCount, label: t("statCandidates") },
    { value: themeCount, label: t("statThemes") },
    { value: measureCount, label: t("statMeasures") },
  ];

  return (
    <View className="mx-4 flex-row justify-around py-2">
      {stats.map((stat) => (
        <View key={stat.label} className="items-center">
          <Text className="font-display-bold text-2xl text-civic-navy">
            {stat.value}
          </Text>
          <Text className="font-body text-xs text-text-caption mt-0.5">
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}
