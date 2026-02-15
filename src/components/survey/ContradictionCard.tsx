import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import type { Contradiction } from "../../stores/survey";

interface Props {
  contradiction: Contradiction;
}

export function ContradictionCard({ contradiction }: Props) {
  const { t } = useTranslation("survey");
  const getThemeById = useElectionStore((s) => s.getThemeById);

  const themeA = getThemeById(contradiction.themeA);
  const themeB = getThemeById(contradiction.themeB);

  const severityColor = {
    low: "bg-yellow-100 border-yellow-300",
    medium: "bg-orange-100 border-orange-300",
    high: "bg-red-100 border-red-300",
  };

  const severityTextColor = {
    low: "text-yellow-800",
    medium: "text-orange-800",
    high: "text-red-800",
  };

  return (
    <View
      className={`rounded-xl p-4 mb-3 border ${severityColor[contradiction.severity]}`}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-sm font-medium text-gray-800">
          {themeA?.name ?? contradiction.themeA} ↔{" "}
          {themeB?.name ?? contradiction.themeB}
        </Text>
        <Text
          className={`text-xs font-medium px-2 py-0.5 rounded ${severityTextColor[contradiction.severity]}`}
        >
          {t(`severity${contradiction.severity.charAt(0).toUpperCase() + contradiction.severity.slice(1)}`)}
        </Text>
      </View>
      <Text className="text-sm text-gray-700">{contradiction.description}</Text>
    </View>
  );
}
