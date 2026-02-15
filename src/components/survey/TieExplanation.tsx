import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import type { Candidate } from "../../data/schema";
import type { CandidateMatch } from "../../stores/survey";

interface TieExplanationProps {
  tiedCandidates: CandidateMatch[];
  candidates: Candidate[];
}

export function TieExplanation({ tiedCandidates, candidates }: TieExplanationProps) {
  const { t } = useTranslation("survey");

  const names = tiedCandidates
    .map((match) => candidates.find((c) => c.id === match.candidateId)?.name)
    .filter(Boolean)
    .join(", ");

  return (
    <View className="bg-civic-navy-light rounded-xl p-4 mb-4">
      <Text className="font-display-medium text-sm text-civic-navy mb-1">
        {t("tieTitle")}
      </Text>
      <Text className="font-body text-sm text-text-body">
        {t("tieExplanation", { candidates: names })}
      </Text>
    </View>
  );
}
