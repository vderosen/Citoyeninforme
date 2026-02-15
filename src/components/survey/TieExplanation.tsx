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
    <View className="bg-blue-50 rounded-xl p-4 mb-4">
      <Text className="text-sm font-semibold text-blue-900 mb-1">
        {t("tieTitle")}
      </Text>
      <Text className="text-sm text-blue-800">
        {t("tieExplanation", { candidates: names })}
      </Text>
    </View>
  );
}
