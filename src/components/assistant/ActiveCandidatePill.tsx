import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import type { Candidate } from "../../data/schema";
import { CandidateAvatar } from "../candidates/CandidateAvatar";

interface ActiveCandidatePillProps {
  candidate: Candidate;
  onDeselect: () => void;
}

export function ActiveCandidatePill({
  candidate,
  onDeselect,
}: ActiveCandidatePillProps) {
  return (
    <View className="px-4 pt-3 pb-1">
      <View className="self-start flex-row items-center bg-accent-coral-light border border-accent-coral rounded-full px-3 py-1.5">
        <CandidateAvatar candidate={candidate} size={28} showRing={false} />
        <Text className="font-body-medium text-sm text-civic-navy ml-2 mr-1">
          {candidate.name}
        </Text>
        <Pressable
          onPress={onDeselect}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Changer de candidat"
          style={{ minWidth: 28, minHeight: 28, alignItems: "center", justifyContent: "center" }}
        >
          <Ionicons name="close" size={16} color="#1B2A4A" />
        </Pressable>
      </View>
    </View>
  );
}
