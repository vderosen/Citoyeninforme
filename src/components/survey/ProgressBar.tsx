import { View, Text } from "react-native";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const progress = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <View
      className="px-4 py-2"
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: current + 1 }}
      accessibilityLabel={`Question ${current + 1} sur ${total}`}
    >
      <Text className="text-xs text-gray-500 mb-1 text-right">
        {current + 1} / {total}
      </Text>
      <View className="w-full h-1.5 bg-gray-200 rounded-full">
        <View
          className="h-1.5 bg-blue-600 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
}
