import { View, Text } from "react-native";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  return (
    <View
      className="px-4 py-3"
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: current + 1 }}
      accessibilityLabel={`Question ${current + 1} sur ${total}`}
    >
      <Text className="font-body-medium text-xs text-text-caption mb-2 text-right">
        {current + 1} / {total}
      </Text>
      <View className="flex-row gap-1">
        {Array.from({ length: total }).map((_, i) => (
          <View
            key={i}
            className={`h-2 flex-1 rounded-sm ${
              i <= current ? "bg-accent-coral" : "bg-warm-gray"
            }`}
          />
        ))}
      </View>
    </View>
  );
}
