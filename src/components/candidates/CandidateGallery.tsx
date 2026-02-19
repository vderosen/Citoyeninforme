import { useMemo } from "react";
import { View, Text, Pressable, Image, useWindowDimensions } from "react-native";
import Animated, {
  FadeInDown,
  useReducedMotion,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type { Candidate } from "../../data/schema";
import { deterministicShuffle, dailySeed } from "../../utils/shuffle";
import { getCandidateImageSource } from "../../utils/candidateImageSource";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";

const CONTAINER_PADDING = 12;
const GAP_H = 8;
const GAP_V = 8;
const COLUMNS = 3;
const AVATAR_SIZE = 72;
const CARD_HEIGHT = 130;

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
  cardWidth,
  reduceMotion,
  onPress,
  compareMode,
  isSelected,
  onToggleCompare,
}: {
  item: Candidate;
  index: number;
  cardWidth: number;
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
  const partyColor = getCandidatePartyColor(item.id);
  const ringColor = compareMode && isSelected ? "#E8523F" : partyColor;

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
      style={{ width: cardWidth, height: CARD_HEIGHT }}
    >
      <Animated.View style={[reduceMotion ? undefined : pressStyle, { flex: 1 }]}>
        <Pressable
          onPress={handlePress}
          onPressIn={() => {
            if (!reduceMotion) scale.value = withTiming(0.97, { duration: 100 });
          }}
          onPressOut={() => {
            if (!reduceMotion) scale.value = withTiming(1, { duration: 150 });
          }}
          style={{ flex: 1, alignItems: "center", minHeight: 44, paddingTop: 6 }}
          className={`rounded-xl ${compareMode && isSelected ? "bg-accent-coral-light" : ""}`}
          accessibilityRole="button"
          accessibilityLabel={`${item.name}, ${item.party}`}
          accessibilityState={compareMode ? { selected: isSelected } : undefined}
        >
          {/* Avatar with party color ring */}
          <View style={{ position: "relative" }}>
            <View
              style={{
                width: AVATAR_SIZE + 6,
                height: AVATAR_SIZE + 6,
                borderRadius: (AVATAR_SIZE + 6) / 2,
                borderWidth: 3,
                borderColor: ringColor,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {imageSource ? (
                <Image
                  source={imageSource}
                  style={{
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    borderRadius: AVATAR_SIZE / 2,
                  }}
                  resizeMode="cover"
                  accessibilityIgnoresInvertColors
                />
              ) : (
                <View
                  style={{
                    width: AVATAR_SIZE,
                    height: AVATAR_SIZE,
                    borderRadius: AVATAR_SIZE / 2,
                    backgroundColor: "#E5E7EB",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Ionicons name="person" size={36} color="#9CA3AF" />
                </View>
              )}
            </View>

            {/* Compare mode checkmark badge */}
            {compareMode && (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#FAFAF8",
                  borderRadius: 8,
                }}
              >
                <Ionicons
                  name={isSelected ? "checkmark-circle" : "ellipse-outline"}
                  size={16}
                  color={isSelected ? "#E8523F" : "#6B7280"}
                />
              </View>
            )}
          </View>

          {/* Name and party */}
          <Text
            className="font-display-medium text-xs text-civic-navy text-center mt-1"
            numberOfLines={1}
            style={{ width: cardWidth - 8 }}
          >
            {item.name}
          </Text>
          <Text
            className="font-body text-[10px] text-text-caption text-center"
            numberOfLines={1}
            style={{ width: cardWidth - 8 }}
          >
            {item.party}
          </Text>
        </Pressable>
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
  const { width: screenWidth } = useWindowDimensions();

  const cardWidth = (screenWidth - CONTAINER_PADDING * 2 - GAP_H * (COLUMNS - 1)) / COLUMNS;

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

  // Split candidates into rows of 3
  const rows: Candidate[][] = [];
  for (let i = 0; i < shuffled.length; i += COLUMNS) {
    rows.push(shuffled.slice(i, i + COLUMNS));
  }

  return (
    <View style={{ padding: CONTAINER_PADDING }}>
      {rows.map((row, rowIndex) => {
        const isLastRow = rowIndex === rows.length - 1;
        const isIncomplete = row.length < COLUMNS;

        return (
          <View
            key={rowIndex}
            style={{
              flexDirection: "row",
              justifyContent: isLastRow && isIncomplete ? "center" : "flex-start",
              gap: GAP_H,
              marginBottom: rowIndex < rows.length - 1 ? GAP_V : 0,
            }}
          >
            {row.map((item, colIndex) => (
              <CandidateCardItem
                key={item.id}
                item={item}
                index={rowIndex * COLUMNS + colIndex}
                cardWidth={cardWidth}
                reduceMotion={reduceMotion}
                onPress={onCandidatePress}
                compareMode={compareMode}
                isSelected={selectedForCompare?.includes(item.id)}
                onToggleCompare={onToggleCompare}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}
