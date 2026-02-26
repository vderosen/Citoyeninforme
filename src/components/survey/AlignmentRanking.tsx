import React from "react";
import { View, Text, Pressable, Image } from "react-native";
import Animated, { FadeInDown, useReducedMotion } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import type { Candidate } from "../../data/schema";
import type { CandidateMatchResult } from "../../services/matching";
import { getCandidateImageSource } from "../../utils/candidateImageSource";

interface AlignmentRankingProps {
  ranking: CandidateMatchResult[];
  candidates: Candidate[];
  onCandidatePress: (candidateId: string) => void;
  headerRight?: React.ReactNode;
}

export function AlignmentRanking({
  ranking,
  candidates,
  onCandidatePress,
  headerRight,
}: AlignmentRankingProps) {
  const { t } = useTranslation("survey");
  const reduceMotion = useReducedMotion();

  return (
    <View
      className="mb-6 rounded-2xl p-4"
      style={{ backgroundColor: '#EEF2F7' }}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text
          className="font-display-semibold text-lg text-civic-navy"
          accessibilityRole="header"
        >
          {t("alignmentTitle")}
        </Text>
        {headerRight}
      </View>
      {ranking.map((match, index) => {
        const candidate = candidates.find((c) => c.id === match.candidateId);
        if (!candidate) return null;
        const imageSource = getCandidateImageSource(candidate);
        const isTop = index === 0;

        return (
          <Animated.View
            key={match.candidateId}
            entering={reduceMotion ? undefined : FadeInDown.delay(index * 50).duration(400)}
          >
            <Pressable
              onPress={() => onCandidatePress(match.candidateId)}
              className="mb-3 bg-white rounded-xl p-3 shadow-sm border-2"
              style={{ borderColor: candidate.partyColor || '#E5E7EB' }}
              accessibilityRole="button"
              accessibilityLabel={`${candidate.name}, ${match.alignmentScore} points`}
            >
              <View className="flex-row items-center">
                {imageSource ? (
                  <Image
                    source={imageSource}
                    className="w-10 h-10 rounded-full bg-warm-gray mr-3"
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <View className="w-10 h-10 rounded-full bg-warm-gray items-center justify-center mr-3">
                    <Text className="text-sm">👤</Text>
                  </View>
                )}
                <Text className="font-display-medium text-base text-civic-navy flex-1">
                  {candidate.name}
                </Text>
                <Text
                  className={`font-display-bold text-xl ${isTop ? "text-accent-coral" : "text-civic-navy"
                    }`}
                >
                  {match.alignmentScore > 0 ? `+${match.alignmentScore}` : match.alignmentScore} pts
                </Text>
              </View>
            </Pressable>
          </Animated.View>
        );
      })}
    </View>
  );
}
