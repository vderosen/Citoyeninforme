import { View, Text } from "react-native";
import type { Candidate } from "../../data/schema";
import { CandidateAvatar } from "../candidates/CandidateAvatar";
import { PressableScale } from "../ui/PressableScale";

interface CandidateAvatarBarProps {
  candidates: Candidate[];
  selectedIds: string[];
  onToggle: (candidateId: string) => void;
  maxSelected?: number;
}

export function CandidateAvatarBar({
  candidates,
  selectedIds,
  onToggle,
  maxSelected = 4,
}: CandidateAvatarBarProps) {
  const maxReached = selectedIds.length >= maxSelected;
  const columnsPerRow = 4;
  const firstRow = candidates.slice(0, columnsPerRow);
  const secondRow = candidates.slice(columnsPerRow);

  const renderCandidate = (candidate: Candidate) => {
    const isSelected = selectedIds.includes(candidate.id);
    const isDisabled = maxReached && !isSelected;

    return (
      <PressableScale
        key={candidate.id}
        onPress={() => {
          if (!isDisabled) onToggle(candidate.id);
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected, disabled: isDisabled }}
        accessibilityLabel={candidate.name}
        className={`items-center rounded-xl px-2 py-2 ${
          isSelected
            ? "bg-accent-coral-light border-accent-coral"
            : "bg-[#F3F4F6]"
        }`}
        style={[
          {
            width: 72,
            minHeight: 60,
            opacity: isDisabled ? 0.5 : 1,
          },
          isSelected && { borderWidth: 2 },
        ]}
      >
        <CandidateAvatar candidate={candidate} size={36} showRing={false} />
        <Text
          className="font-body-medium text-xs text-civic-navy mt-1 text-center"
          numberOfLines={1}
        >
          {candidate.name.split(" ").pop()}
        </Text>
      </PressableScale>
    );
  };

  return (
    <View className="px-4 py-2">
      <View className="flex-row justify-center" style={{ gap: 8 }}>
        {firstRow.map(renderCandidate)}
      </View>
      {secondRow.length > 0 && (
        <View className="flex-row justify-center mt-2" style={{ gap: 8 }}>
          {secondRow.map(renderCandidate)}
        </View>
      )}
    </View>
  );
}
