import { View, Text, Pressable, Image } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
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
  const reduceMotion = useReducedMotion();
  const topScore = ranking[0]?.alignmentScore ?? 0;

  return (
    <View className="mb-6">
      <Text
        className="font-display-semibold text-lg text-civic-navy mb-3"
        accessibilityRole="header"
      >
        {t("alignmentTitle")}
      </Text>
      {ranking.map((match, index) => {
        const candidate = candidates.find((c) => c.id === match.candidateId);
        if (!candidate) return null;
        const isTop = index === 0;
        const barWidth = topScore > 0 ? (match.alignmentScore / topScore) * 100 : 0;

        return (
          <Animated.View
            key={match.candidateId}
            entering={reduceMotion ? undefined : FadeInDown.delay(index * 50).duration(400)}
          >
            <Pressable
              onPress={() => onCandidatePress(match.candidateId)}
              className="mb-3"
              style={{ minHeight: 56 }}
              accessibilityRole="button"
              accessibilityLabel={`${candidate.name}, ${Math.round(match.alignmentScore)}% d'alignement`}
            >
              <View className="flex-row items-center mb-1">
                {candidate.photoUrl ? (
                  <Image
                    source={{ uri: candidate.photoUrl }}
                    className="w-8 h-8 rounded-lg bg-warm-gray mr-3"
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <View className="w-8 h-8 rounded-lg bg-warm-gray items-center justify-center mr-3">
                    <Text className="text-sm">👤</Text>
                  </View>
                )}
                <Text className="font-display-medium text-sm text-civic-navy flex-1">
                  {candidate.name}
                </Text>
                <Text
                  className={`font-display-bold text-xl ${
                    isTop ? "text-accent-coral" : "text-civic-navy"
                  }`}
                >
                  {Math.round(match.alignmentScore)}%
                </Text>
              </View>
              <View className="ml-11 h-3 bg-warm-gray rounded-sm overflow-hidden">
                <View
                  className={`h-3 rounded-sm ${isTop ? "bg-accent-coral" : "bg-civic-navy"}`}
                  style={{ width: `${barWidth}%` }}
                />
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
