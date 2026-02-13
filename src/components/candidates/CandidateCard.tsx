import { View, Text, Pressable } from "react-native";
import type { Candidate } from "../../data/schema";

interface Props {
  candidate: Candidate;
  onPress: (candidateId: string) => void;
  isExpanded: boolean;
  children?: React.ReactNode;
}

export function CandidateCard({
  candidate,
  onPress,
  isExpanded,
  children,
}: Props) {
  return (
    <View className="bg-white rounded-xl mb-3 shadow-sm overflow-hidden">
      <Pressable
        onPress={() => onPress(candidate.id)}
        accessibilityRole="button"
        accessibilityLabel={`${candidate.name}, ${candidate.party}`}
        accessibilityState={{ expanded: isExpanded }}
        className="p-4"
        style={{ minHeight: 44 }}
      >
        <View className="flex-row items-center">
          <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center mr-3">
            <Text className="text-lg font-bold text-gray-600">
              {candidate.name.charAt(0)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-gray-900">
              {candidate.name}
            </Text>
            <Text className="text-sm text-gray-500">{candidate.party}</Text>
          </View>
        </View>
        {isExpanded && (
          <Text className="text-sm text-gray-600 mt-2">{candidate.bio}</Text>
        )}
      </Pressable>
      {isExpanded && children && <View className="px-4 pb-4">{children}</View>}
    </View>
  );
}
