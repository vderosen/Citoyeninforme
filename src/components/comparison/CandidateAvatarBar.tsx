import { View, Text, ScrollView } from "react-native";
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

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}
    >
      {candidates.map((candidate) => {
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
      })}
    </ScrollView>
  );
}
