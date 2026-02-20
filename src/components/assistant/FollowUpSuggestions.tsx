import { useEffect } from "react";
import { ScrollView, Pressable, Text, ActivityIndicator, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn } from "react-native-reanimated";

interface FollowUpSuggestionsProps {
  suggestions: string[];
  isLoading: boolean;
  onSelect: (text: string) => void;
}

export function FollowUpSuggestions({
  suggestions,
  isLoading,
  onSelect,
}: FollowUpSuggestionsProps) {
  if (!isLoading && suggestions.length === 0) return null;

  return (
    <Animated.View entering={FadeIn.duration(300)} className="px-4 pt-3">
      {isLoading && suggestions.length === 0 ? (
        <View className="flex-row items-center gap-2 py-1">
          <ActivityIndicator size="small" color="#E8553A" />
        </View>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
          keyboardShouldPersistTaps="handled"
        >
          {suggestions.map((suggestion) => (
            <Pressable
              key={suggestion}
              onPress={() => onSelect(suggestion)}
              className="flex-row items-center border border-accent-coral bg-warm-white rounded-xl px-4 py-2.5 gap-2"
              style={{ minHeight: 40 }}
              accessibilityRole="button"
              accessibilityLabel={suggestion}
            >
              <Text className="font-body text-sm text-text-body" numberOfLines={1}>
                {suggestion}
              </Text>
              <Ionicons name="arrow-forward" size={12} color="#E8553A" />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </Animated.View>
  );
}
