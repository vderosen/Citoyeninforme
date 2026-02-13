import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { deterministicShuffle, dailySeed } from "../../utils/shuffle";
import { CandidateCard } from "./CandidateCard";
import { PositionCard } from "./PositionCard";
import type { Candidate, Position } from "../../data/schema";
import { useState } from "react";

interface Props {
  selectedThemeId: string | null;
  onAskInChat?: (position: Position) => void;
}

export function CandidateList({ selectedThemeId, onAskInChat }: Props) {
  const { t } = useTranslation(["learn", "common"]);
  const candidates = useElectionStore((s) => s.candidates);
  const themes = useElectionStore((s) => s.themes);
  const positions = useElectionStore((s) => s.positions);
  const getThemeById = useElectionStore((s) => s.getThemeById);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const shuffledCandidates = deterministicShuffle(candidates, dailySeed());

  const getPositionsForCandidate = (candidateId: string): Position[] => {
    let filtered = positions.filter((p) => p.candidateId === candidateId);
    if (selectedThemeId) {
      filtered = filtered.filter((p) => p.themeId === selectedThemeId);
    }
    return filtered;
  };

  const handlePress = (candidateId: string) => {
    setExpandedId(expandedId === candidateId ? null : candidateId);
  };

  return (
    <View>
      {shuffledCandidates.map((candidate: Candidate) => {
        const candidatePositions = getPositionsForCandidate(candidate.id);

        return (
          <CandidateCard
            key={candidate.id}
            candidate={candidate}
            onPress={handlePress}
            isExpanded={expandedId === candidate.id}
          >
            {candidatePositions.length > 0 ? (
              candidatePositions.map((position) => (
                <PositionCard
                  key={position.id}
                  position={position}
                  theme={
                    !selectedThemeId
                      ? getThemeById(position.themeId)
                      : undefined
                  }
                  onAskInChat={onAskInChat}
                />
              ))
            ) : (
              <View className="bg-gray-50 rounded-lg p-3 mb-2">
                <Text className="text-sm text-gray-500 italic">
                  {t("common:noPositionDocumented")}
                </Text>
                <Text className="text-xs text-gray-400 mt-1">
                  {t("common:noPositionNote")}
                </Text>
              </View>
            )}
          </CandidateCard>
        );
      })}
    </View>
  );
}
