import { useMemo } from "react";
import { View, Text, FlatList, Pressable, Image } from "react-native";
import Animated, {
  FadeInDown,
  useReducedMotion,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import DistrictBlockCard from "../ui/DistrictBlockCard";
import type { Candidate } from "../../data/schema";
import { deterministicShuffle, dailySeed } from "../../utils/shuffle";
import { getCandidateImageSource } from "../../utils/candidateImageSource";

interface CandidateGalleryProps {
  candidates: Candidate[];
  onCandidatePress: (candidateId: string) => void;
  compareMode?: boolean;
  selectedForCompare?: string[];
  onToggleCompare?: (candidateId: string) => void;
}

function CandidateCardItem({
  item,
  index,
  reduceMotion,
  onPress,
  compareMode,
  isSelected,
  onToggleCompare,
}: {
  item: Candidate;
  index: number;
  reduceMotion: boolean;
  onPress: (id: string) => void;
  compareMode?: boolean;
  isSelected?: boolean;
  onToggleCompare?: (id: string) => void;
}) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  const imageSource = getCandidateImageSource(item);

  const handlePress = () => {
    if (compareMode && onToggleCompare) {
      onToggleCompare(item.id);
    } else {
      onPress(item.id);
    }
  };

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.delay(index * 50).duration(400)}
      className="flex-1"
    >
      <Animated.View style={reduceMotion ? undefined : pressStyle} className="flex-1">
        <DistrictBlockCard
          clipCorner="top-right"
          className={`flex-1 shadow-card ${isSelected ? "bg-accent-coral-light" : "bg-warm-gray"}`}
        >
          <View
            style={{
              height: 4,
              backgroundColor: item.partyColor || "#9CA3AF",
            }}
          />
          <Pressable
            onPress={handlePress}
            onPressIn={() => {
              if (!reduceMotion) scale.value = withTiming(0.97, { duration: 100 });
            }}
            onPressOut={() => {
              if (!reduceMotion) scale.value = withTiming(1, { duration: 150 });
            }}
            style={{ minHeight: 44 }}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.party}`}
            accessibilityState={compareMode ? { selected: isSelected } : undefined}
          >
            {compareMode && (
              <View className="absolute top-2 right-2 z-10">
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                  size={24}
                  color={isSelected ? "#E8523F" : "#6B7280"}
                />
              </View>
            )}
            {imageSource ? (
              <Image
                source={imageSource}
                className="w-full aspect-square bg-warm-gray"
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View className="w-full aspect-square bg-warm-gray items-center justify-center">
                <Text className="text-3xl">👤</Text>
              </View>
            )}
            <View className="p-3">
              <Text className="font-display-medium text-sm text-civic-navy" numberOfLines={1}>
                {item.name}
              </Text>
              <Text className="font-body text-xs text-text-caption mt-0.5" numberOfLines={1}>
                {item.party}
              </Text>
            </View>
          </Pressable>
        </DistrictBlockCard>
      </Animated.View>
    </Animated.View>
  );
}

export function CandidateGallery({
  candidates,
  onCandidatePress,
  compareMode,
  selectedForCompare,
  onToggleCompare,
}: CandidateGalleryProps) {
  const { t } = useTranslation("candidates");
  const reduceMotion = useReducedMotion();

  const shuffled = useMemo(
    () => deterministicShuffle(candidates, dailySeed()),
    [candidates]
  );

  if (candidates.length === 0) {
    return (
      <View className="flex-1 items-center justify-center px-8 py-12">
        <Text className="font-display-semibold text-lg text-civic-navy text-center mb-2">
          {t("emptyGallery")}
        </Text>
        <Text className="font-body text-sm text-text-caption text-center">
          {t("emptyGalleryDescription")}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={shuffled}
      keyExtractor={(item) => item.id}
      numColumns={2}
      columnWrapperStyle={{ gap: 12 }}
      contentContainerStyle={{ padding: 16, gap: 12 }}
      renderItem={({ item, index }) => (
        <CandidateCardItem
          item={item}
          index={index}
          reduceMotion={reduceMotion}
          onPress={onCandidatePress}
          compareMode={compareMode}
          isSelected={selectedForCompare?.includes(item.id)}
          onToggleCompare={onToggleCompare}
        />
      )}
    />
  );
}
