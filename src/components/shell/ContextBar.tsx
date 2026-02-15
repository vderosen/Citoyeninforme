import { View, Text } from "react-native";
import { useElectionStore } from "../../stores/election";

export function ContextBar() {
  const election = useElectionStore((s) => s.election);

  if (!election) return null;

  return (
    <View
      className="bg-white border-b border-gray-200 px-4 py-2 flex-row items-center justify-between"
      accessibilityRole="header"
      accessibilityLabel={`${election.city} - ${election.type} ${election.year}`}
    >
      <Text className="text-sm font-semibold text-gray-800">
        {election.city} — {election.type} {election.year}
      </Text>
      <Text className="text-xs text-gray-400">
        Mis à jour le {election.lastUpdated}
      </Text>
    </View>
  );
}
