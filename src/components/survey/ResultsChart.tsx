import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import type { CandidateMatch } from "../../stores/survey";

interface Props {
  themeScores: Record<string, number>;
  candidateRanking: CandidateMatch[];
}

export function ResultsChart({ themeScores, candidateRanking }: Props) {
  const { t } = useTranslation("survey");
  const getThemeById = useElectionStore((s) => s.getThemeById);
  const getCandidateById = useElectionStore((s) => s.getCandidateById);

  const maxScore = Math.max(
    ...Object.values(themeScores).map(Math.abs),
    1
  );

  return (
    <View>
      <Text
        className="text-lg font-semibold text-gray-900 mb-4"
        accessibilityRole="header"
      >
        {t("yourProfile")}
      </Text>

      {Object.entries(themeScores).map(([themeId, score]) => {
        const theme = getThemeById(themeId);
        const normalizedWidth = Math.abs(score) / maxScore;
        const isPositive = score >= 0;

        return (
          <View key={themeId} className="mb-3">
            <Text className="text-sm text-gray-700 mb-1">
              {theme?.name ?? themeId}
            </Text>
            <View className="flex-row items-center">
              <View className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden">
                <View
                  className={`h-4 rounded-full ${
                    isPositive ? "bg-blue-500" : "bg-orange-500"
                  }`}
                  style={{ width: `${normalizedWidth * 100}%` }}
                />
              </View>
              <Text className="text-xs text-gray-500 ml-2 w-8 text-right">
                {score > 0 ? `+${score}` : score}
              </Text>
            </View>
          </View>
        );
      })}

      <Text
        className="text-lg font-semibold text-gray-900 mt-6 mb-4"
        accessibilityRole="header"
      >
        {t("candidateRanking")}
      </Text>

      {candidateRanking.map((match, index) => {
        const candidate = getCandidateById(match.candidateId);
        return (
          <View
            key={match.candidateId}
            className="bg-white rounded-xl p-4 mb-3 shadow-sm"
          >
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Text className="text-lg font-bold text-gray-400 mr-3">
                  {index + 1}
                </Text>
                <View>
                  <Text className="text-base font-semibold text-gray-900">
                    {candidate?.name ?? match.candidateId}
                  </Text>
                  <Text className="text-sm text-gray-500">
                    {candidate?.party}
                  </Text>
                </View>
              </View>
              <View className="bg-blue-100 px-3 py-1 rounded-full">
                <Text className="text-blue-800 font-bold">
                  {match.alignmentScore}%
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap">
              {match.justification.map((j) => {
                const theme = getThemeById(j.themeId);
                return (
                  <View
                    key={j.themeId}
                    className={`px-2 py-1 rounded mr-1 mb-1 ${
                      j.alignment === "agree"
                        ? "bg-green-100"
                        : j.alignment === "partial"
                          ? "bg-yellow-100"
                          : "bg-red-100"
                    }`}
                  >
                    <Text
                      className={`text-xs ${
                        j.alignment === "agree"
                          ? "text-green-700"
                          : j.alignment === "partial"
                            ? "text-yellow-700"
                            : "text-red-700"
                      }`}
                    >
                      {theme?.name ?? j.themeId}: {t(j.alignment)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        );
      })}
    </View>
  );
}
