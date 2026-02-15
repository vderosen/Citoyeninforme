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

  return (
    <View className="rounded-xl p-4 mb-3 border border-signal-amber bg-warm-gray">
      <View className="flex-row items-center justify-between mb-2">
        <Text className="font-body-medium text-sm text-civic-navy">
          {themeA?.name ?? contradiction.themeA} {"\u2194"}{" "}
          {themeB?.name ?? contradiction.themeB}
        </Text>
        <Text className="font-body-medium text-xs text-signal-amber px-2 py-0.5 rounded bg-warm-white">
          {t(`severity${contradiction.severity.charAt(0).toUpperCase() + contradiction.severity.slice(1)}`)}
        </Text>
      </View>
      <Text className="font-body text-sm text-text-body">{contradiction.description}</Text>
    </View>
  );
}
