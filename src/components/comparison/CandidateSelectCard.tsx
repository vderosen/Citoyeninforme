import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Candidate } from "../../data/schema";
import { CandidateAvatar } from "../candidates/CandidateAvatar";
import { PressableScale } from "../ui/PressableScale";

interface CandidateSelectCardProps {
  candidate: Candidate;
  isSelected: boolean;
  isDisabled: boolean;
  onToggle: () => void;
}

export function CandidateSelectCard({
  candidate,
  isSelected,
  isDisabled,
  onToggle,
}: CandidateSelectCardProps) {
  return (
    <PressableScale
      onPress={onToggle}
      disabled={isDisabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: isSelected, disabled: isDisabled }}
      accessibilityLabel={candidate.name}
      className={`flex-row items-center rounded-xl px-4 py-3 border ${
        isSelected
          ? "bg-accent-coral-light border-accent-coral"
          : "bg-white border-warm-gray"
      }`}
      style={[
        { minHeight: 56, opacity: isDisabled ? 0.5 : 1 },
        isSelected && { borderWidth: 2 },
      ]}
    >
      <CandidateAvatar candidate={candidate} size={44} showRing />
      <Text
        className="font-display-medium text-base text-civic-navy flex-1 ml-3"
        numberOfLines={0}
      >
        {candidate.name}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={22} color="#E8553A" />
      )}
    </PressableScale>
  );
}
