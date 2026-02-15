import { View, Text, Pressable, Image } from "react-native";
import { useTranslation } from "react-i18next";
import type { Candidate } from "../../data/schema";
import type { CandidateMatch } from "../../stores/survey";

interface AlignmentRankingProps {
  ranking: CandidateMatch[];
  candidates: Candidate[];
  onCandidatePress: (candidateId: string) => void;
}

export function AlignmentRanking({
  ranking,
  candidates,
  onCandidatePress,
}: AlignmentRankingProps) {
  const { t } = useTranslation("survey");

  return (
    <View className="mb-6">
      <Text
        className="text-lg font-semibold text-gray-900 mb-3"
        accessibilityRole="header"
      >
        {t("alignmentTitle")}
      </Text>
      {ranking.map((match) => {
        const candidate = candidates.find((c) => c.id === match.candidateId);
        if (!candidate) return null;

        return (
          <Pressable
            key={match.candidateId}
            onPress={() => onCandidatePress(match.candidateId)}
            className="flex-row items-center bg-white rounded-xl border border-gray-200 p-3 mb-2"
            style={{ minHeight: 56 }}
            accessibilityRole="button"
            accessibilityLabel={`${candidate.name}, ${Math.round(match.alignmentScore)}% d'alignement`}
          >
            {candidate.photoUrl ? (
              <Image
                source={{ uri: candidate.photoUrl }}
                className="w-10 h-10 rounded-full bg-gray-200 mr-3"
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View className="w-10 h-10 rounded-full bg-gray-200 items-center justify-center mr-3">
                <Text className="text-lg">👤</Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="text-sm font-semibold text-gray-900">
                {candidate.name}
              </Text>
              <Text className="text-xs text-gray-500">{candidate.party}</Text>
            </View>
            <View className="items-end">
              <Text className="text-lg font-bold text-blue-600">
                {Math.round(match.alignmentScore)}%
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}
