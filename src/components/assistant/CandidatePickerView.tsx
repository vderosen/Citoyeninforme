import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { Candidate } from "../../data/schema";
import { CandidateAvatar } from "../candidates/CandidateAvatar";
import { PressableScale } from "../ui/PressableScale";

interface CandidatePickerViewProps {
  candidates: Candidate[];
  onSelect: (candidateId: string) => void;
  onBack: () => void;
}

export function CandidatePickerView({
  candidates,
  onSelect,
  onBack,
}: CandidatePickerViewProps) {
  const { t } = useTranslation("assistant");
  const firstRow = candidates.slice(0, 4);
  const secondRow = candidates.slice(4);

  const renderCandidate = (candidate: Candidate) => (
    <PressableScale
      key={candidate.id}
      onPress={() => onSelect(candidate.id)}
      accessibilityRole="button"
      accessibilityLabel={candidate.name}
      className="items-center rounded-xl bg-[#F3F4F6] px-2 py-2"
      style={{ width: 80, minHeight: 72 }}
    >
      <CandidateAvatar candidate={candidate} size={48} showRing />
      <Text
        className="font-body-medium text-xs text-civic-navy mt-1 text-center"
        numberOfLines={1}
      >
        {candidate.name.split(" ").pop()}
      </Text>
      <Text
        className="font-body text-[10px] text-text-caption text-center"
        numberOfLines={1}
      >
        {candidate.party}
      </Text>
    </PressableScale>
  );

  return (
    <View className="flex-1 px-4">
      <Pressable
        onPress={onBack}
        className="flex-row items-center py-3"
        accessibilityRole="button"
        accessibilityLabel={t("candidatePickerBack")}
        style={{ minHeight: 44 }}
      >
        <Ionicons name="arrow-back" size={20} color="#1B2A4A" />
        <Text className="font-body-medium text-sm text-civic-navy ml-1">
          {t("candidatePickerBack")}
        </Text>
      </Pressable>

      <Text className="font-display-medium text-xl text-civic-navy text-center mt-4 mb-6">
        {t("candidatePickerTitle")}
      </Text>

      <View className="flex-row justify-center" style={{ gap: 8 }}>
        {firstRow.map(renderCandidate)}
      </View>
      {secondRow.length > 0 && (
        <View className="flex-row justify-center mt-3" style={{ gap: 8 }}>
          {secondRow.map(renderCandidate)}
        </View>
      )}
    </View>
  );
}
