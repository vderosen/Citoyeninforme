import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";

interface ResultsProfileProps {
  themeScores: Record<string, number>;
}

export function ResultsProfile({ themeScores }: ResultsProfileProps) {
  const { t } = useTranslation("survey");
  const themes = useElectionStore((s) => s.themes);

  const sortedScores = Object.entries(themeScores)
    .map(([themeId, score]) => ({
      themeId,
      score,
      theme: themes.find((th) => th.id === themeId),
    }))
    .filter((entry) => entry.theme)
    .sort((a, b) => Math.abs(b.score) - Math.abs(a.score));

  return (
    <View className="mb-6">
      <Text
        className="font-display-semibold text-lg text-civic-navy mb-3"
        accessibilityRole="header"
      >
        {t("profileTitle")}
      </Text>
      {sortedScores.map(({ themeId, score, theme }) => {
        const normalizedScore = Math.min(Math.max(score, -1), 1);
        const barWidth = Math.abs(normalizedScore) * 100;
        const isPositive = normalizedScore >= 0;

        return (
          <View key={themeId} className="mb-3">
            <View className="flex-row justify-between mb-1">
              <Text className="font-body-medium text-sm text-civic-navy">
                {theme!.icon} {theme!.name}
              </Text>
              <Text className="font-display-bold text-xs text-text-caption">
                {score > 0 ? "+" : ""}{score.toFixed(1)}
              </Text>
            </View>
            <View className="w-full h-2 bg-warm-gray rounded-full">
              <View
                className={`h-2 rounded-full ${isPositive ? "bg-civic-navy" : "bg-signal-amber"}`}
                style={{ width: `${barWidth}%` }}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}
