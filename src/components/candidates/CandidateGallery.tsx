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
import DistrictBlockCard from "../ui/DistrictBlockCard";
import type { Candidate } from "../../data/schema";
import { deterministicShuffle, dailySeed } from "../../utils/shuffle";

interface CandidateGalleryProps {
  candidates: Candidate[];
  onCandidatePress: (candidateId: string) => void;
  activeThemeFilter?: string;
  positionSnippets?: Record<string, string>;
}

function CandidateCardItem({
  item,
  index,
  reduceMotion,
  onPress,
  activeThemeFilter,
  positionSnippets,
}: {
  item: Candidate;
  index: number;
  reduceMotion: boolean;
  onPress: (id: string) => void;
  activeThemeFilter?: string;
  positionSnippets?: Record<string, string>;
}) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.delay(index * 50).duration(400)}
      className="flex-1"
    >
      <Animated.View style={reduceMotion ? undefined : pressStyle} className="flex-1">
        <DistrictBlockCard clipCorner="top-right" className="flex-1 bg-warm-gray shadow-card">
          <View
            style={{
              height: 4,
              backgroundColor: item.partyColor || "#9CA3AF",
            }}
          />
          <Pressable
            onPress={() => onPress(item.id)}
            onPressIn={() => {
              if (!reduceMotion) scale.value = withTiming(0.97, { duration: 100 });
            }}
            onPressOut={() => {
              if (!reduceMotion) scale.value = withTiming(1, { duration: 150 });
            }}
            style={{ minHeight: 44 }}
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.party}`}
          >
            {item.photoUrl ? (
              <Image
                source={{ uri: item.photoUrl }}
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
              {activeThemeFilter && positionSnippets?.[item.id] && (
                <Text className="font-body text-xs text-text-body mt-1" numberOfLines={2}>
                  {positionSnippets[item.id]}
                </Text>
              )}
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
  activeThemeFilter,
  positionSnippets,
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
          activeThemeFilter={activeThemeFilter}
          positionSnippets={positionSnippets}
        />
      )}
    />
  );
}
