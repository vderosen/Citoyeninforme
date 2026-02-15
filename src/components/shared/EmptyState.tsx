import { View, Text, Pressable } from "react-native";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <View
      className="flex-1 items-center justify-center px-8 py-12"
      accessibilityRole="alert"
    >
      {icon ? (
        <Text className="text-4xl mb-4">{icon}</Text>
      ) : null}
      <Text className="text-lg font-semibold text-gray-800 text-center mb-2">
        {title}
      </Text>
      <Text className="text-sm text-gray-500 text-center mb-6">
        {description}
      </Text>
      {action ? (
        <Pressable
          onPress={action.onPress}
          className="bg-blue-600 rounded-lg px-6 py-3"
          style={{ minHeight: 44 }}
          accessibilityRole="button"
          accessibilityLabel={action.label}
        >
          <Text className="text-white font-semibold text-center">
            {action.label}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}
