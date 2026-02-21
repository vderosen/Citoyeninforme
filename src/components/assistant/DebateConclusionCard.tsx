import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { PressableScale } from "../ui/PressableScale";
import { CandidateAvatar } from "../candidates/CandidateAvatar";
import type { DebateTurn } from "../../stores/assistant";
import type { Candidate } from "../../data/schema";

interface DebateConclusionCardProps {
  turn: DebateTurn;
  candidates: Candidate[];
  onNewDebate: () => void;
  onBack: () => void;
}

export function DebateConclusionCard({
  turn,
  candidates,
  onNewDebate,
  onBack,
}: DebateConclusionCardProps) {
  const { t } = useTranslation("assistant");
  const summary = turn.summary;

  if (!summary) return null;

  return (
    <View className="px-4 py-3">
      {/* Header */}
      <View className="flex-row items-center gap-2 mb-4">
        <Ionicons name="flag-outline" size={20} color="#1B2A4A" />
        <Text className="font-display-medium text-base text-civic-navy">
          {t("debateConclusionTitle")}
        </Text>
      </View>

      {/* Statement */}
      <View className="bg-civic-navy/5 rounded-2xl px-4 py-3 mb-4">
        <Text className="font-body text-sm text-civic-navy leading-5">
          {turn.statement}
        </Text>
      </View>

      {/* Themes explored */}
      <Text className="font-display-medium text-sm text-civic-navy mb-2">
        {t("debateThemesExplored")}
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-4">
        {summary.themesExplored.map((themeId) => (
          <View
            key={themeId}
            className="bg-accent-blue/10 rounded-full px-3 py-1"
          >
            <Text className="font-body text-xs text-accent-blue">
              {themeId}
            </Text>
          </View>
        ))}
      </View>

      {/* Key insight */}
      <Text className="font-display-medium text-sm text-civic-navy mb-2">
        {t("debateKeyInsight")}
      </Text>
      <View className="bg-warm-white border border-warm-gray rounded-2xl px-4 py-3 mb-4">
        <Text className="font-body text-sm text-civic-navy leading-5">
          {summary.keyInsight}
        </Text>
      </View>

      {/* Candidate proximity */}
      {summary.candidateProximity &&
        summary.candidateProximity.length > 0 && (
          <>
            <Text className="font-display-medium text-sm text-civic-navy mb-2">
              {t("debateCandidateProximity")}
            </Text>
            <View className="gap-3 mb-4">
              {summary.candidateProximity.map((entry) => {
                const candidate = candidates.find(
                  (c) => c.id === entry.candidateId
                );
                if (!candidate) return null;

                return (
                  <View
                    key={entry.candidateId}
                    className="flex-row items-start gap-3 bg-warm-white border border-warm-gray rounded-2xl px-4 py-3"
                  >
                    <CandidateAvatar candidate={candidate} size={36} />
                    <View className="flex-1">
                      <Text className="font-display-medium text-sm text-civic-navy mb-1">
                        {candidate.name}
                      </Text>
                      <Text className="font-body text-xs text-text-caption leading-4">
                        {entry.reason}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          </>
        )}

      {/* Action buttons */}
      <View className="gap-3 mt-2 mb-4">
        <PressableScale
          onPress={onNewDebate}
          className="bg-accent-blue rounded-full py-3 items-center"
        >
          <Text className="font-display-medium text-sm text-white">
            {t("debateNewButton")}
          </Text>
        </PressableScale>

        <PressableScale
          onPress={onBack}
          className="bg-warm-white border border-warm-gray rounded-full py-3 items-center"
        >
          <Text className="font-display-medium text-sm text-civic-navy">
            {t("debateBackButton")}
          </Text>
        </PressableScale>
      </View>
    </View>
  );
}
