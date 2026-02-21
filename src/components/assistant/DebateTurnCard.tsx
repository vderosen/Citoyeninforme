import { View, Text } from "react-native";
import { DebateOptionButton } from "./DebateOptionButton";
import type { DebateTurn } from "../../stores/assistant";

interface DebateTurnCardProps {
  turn: DebateTurn;
  isCurrent: boolean;
  onSelectOption: (optionId: string) => void;
}

export function DebateTurnCard({
  turn,
  isCurrent,
  onSelectOption,
}: DebateTurnCardProps) {
  const isPast = !isCurrent && turn.selectedOptionId !== null;

  return (
    <View className="px-4 py-3">
      {/* AI Statement */}
      <View className="bg-civic-navy/5 rounded-2xl px-4 py-3 mb-3">
        <Text className="font-body text-sm text-civic-navy leading-5">
          {turn.statement}
        </Text>
      </View>

      {/* Options */}
      {isCurrent && (
        <View className="gap-2">
          {turn.options.map((option) => (
            <DebateOptionButton
              key={option.id}
              letter={option.id}
              text={option.text}
              state="selectable"
              onPress={() => onSelectOption(option.id)}
            />
          ))}
        </View>
      )}

      {/* Past turn: show only selected option */}
      {isPast && turn.selectedOptionId && (
        <View className="gap-2">
          {turn.options
            .filter((o) => o.id === turn.selectedOptionId)
            .map((option) => (
              <DebateOptionButton
                key={option.id}
                letter={option.id}
                text={option.text}
                state="selected"
                onPress={() => {}}
              />
            ))}
        </View>
      )}

      {/* Sources */}
      {turn.sources.length > 0 && (
        <View className="mt-2 px-1">
          {turn.sources.map((source, index) => (
            <Text
              key={index}
              className="font-body text-xs text-text-caption"
            >
              {source.title}
            </Text>
          ))}
        </View>
      )}
    </View>
  );
}
