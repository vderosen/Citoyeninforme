import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { SourceReference } from "../ui/SourceReference";
import type { Candidate } from "../../data/schema";

interface Props {
  candidateIds: string[];
  themeId: string;
}

export function ComparisonView({ candidateIds, themeId }: Props) {
  const { t } = useTranslation(["learn", "common"]);
  const getCandidateById = useElectionStore((s) => s.getCandidateById);
  const getThemeById = useElectionStore((s) => s.getThemeById);
  const getPositionForCandidateTheme = useElectionStore(
    (s) => s.getPositionForCandidateTheme
  );

  const theme = getThemeById(themeId);

  return (
    <View className="mt-4">
      {theme && (
        <Text
          className="text-lg font-semibold text-gray-900 mb-3"
          accessibilityRole="header"
        >
          {t("compareTitle")} — {theme.name}
        </Text>
      )}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {candidateIds.map((candidateId) => {
          const candidate = getCandidateById(candidateId);
          const position = getPositionForCandidateTheme(candidateId, themeId);

          if (!candidate) return null;

          return (
            <View
              key={candidateId}
              className="bg-white rounded-xl p-4 mr-3 shadow-sm"
              style={{ width: 280 }}
            >
              <Text className="text-base font-semibold text-gray-900">
                {candidate.name}
              </Text>
              <Text className="text-xs text-gray-500 mb-2">
                {candidate.party}
              </Text>

              {position ? (
                <View>
                  <Text className="text-sm text-gray-800 mb-2">
                    {position.summary}
                  </Text>
                  <Text className="text-sm text-gray-600 mb-2">
                    {position.details}
                  </Text>
                  <View className="border-t border-gray-200 pt-2">
                    {position.sources.map((source, index) => (
                      <SourceReference key={index} source={source} />
                    ))}
                  </View>
                </View>
              ) : (
                <View>
                  <Text className="text-sm text-gray-500 italic">
                    {t("common:noPositionDocumented")}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
                    {t("common:noPositionNote")}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
