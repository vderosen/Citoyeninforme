import { View, Text, Pressable } from "react-native";
import { useCallback, useState } from "react";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SwipeCard } from "./SwipeCard";
import { SwipeButtons } from "./SwipeButtons";
import { useElectionStore } from "../../stores/election";
import type { StatementCard, SwipeDirection } from "../../data/schema";

interface SwipeStackProps {
  cards: StatementCard[];
  currentIndex: number;
  onSwipe: (cardId: string, direction: SwipeDirection) => void;
  swipedCards: { card: StatementCard; direction: SwipeDirection }[];
  onUndo?: () => void;
}

function DirectionHints() {
  const { t } = useTranslation("survey");

  return (
    <View
      pointerEvents="none"
      className="absolute inset-0 justify-center items-center"
    >
      {/* Top — Coup de cœur */}
      <View className="absolute top-1 left-0 right-0 flex-row justify-center items-center gap-1">
        <Ionicons name="arrow-up" size={10} color="#6B7280" style={{ opacity: 0.4 }} />
        <Text className="font-body text-text-caption" style={{ fontSize: 9, opacity: 0.4 }}>
          {t("swipeStronglyAgree")}
        </Text>
      </View>

      {/* Bottom — Catastrophe */}
      <View className="absolute bottom-1 left-0 right-0 flex-row justify-center items-center gap-1">
        <Ionicons name="arrow-down" size={10} color="#6B7280" style={{ opacity: 0.4 }} />
        <Text className="font-body text-text-caption" style={{ fontSize: 9, opacity: 0.4 }}>
          {t("swipeStronglyDisagree")}
        </Text>
      </View>

      {/* Left — Pas d'accord */}
      <View className="absolute left-1 top-0 bottom-0 justify-center">
        <View className="flex-row items-center gap-0.5">
          <Ionicons name="arrow-back" size={10} color="#6B7280" style={{ opacity: 0.4 }} />
          <Text className="font-body text-text-caption" style={{ fontSize: 9, opacity: 0.4 }}>
            {t("swipeDisagree")}
          </Text>
        </View>
      </View>

      {/* Right — D'accord */}
      <View className="absolute right-1 top-0 bottom-0 justify-center">
        <View className="flex-row items-center gap-0.5">
          <Text className="font-body text-text-caption" style={{ fontSize: 9, opacity: 0.4 }}>
            {t("swipeAgree")}
          </Text>
          <Ionicons name="arrow-forward" size={10} color="#6B7280" style={{ opacity: 0.4 }} />
        </View>
      </View>
    </View>
  );
}

export function SwipeStack({
  cards,
  currentIndex,
  onSwipe,
  swipedCards,
  onUndo,
}: SwipeStackProps) {
  const themes = useElectionStore((s) => s.themes);
  const [isButtonAnimating, setIsButtonAnimating] = useState(false);

  const getThemeInfo = useCallback(
    (themeIds: string[]) => {
      const theme = themes.find((t) => t.id === themeIds[0]);
      return {
        icon: theme?.icon ?? "\uD83D\uDCCB",
        name: theme?.name ?? "",
      };
    },
    [themes]
  );

  const handleButtonPress = useCallback(
    (direction: SwipeDirection) => {
      const currentCard = cards[currentIndex];
      if (!currentCard || isButtonAnimating) return;
      setIsButtonAnimating(true);
      onSwipe(currentCard.id, direction);
      setTimeout(() => setIsButtonAnimating(false), 100);
    },
    [cards, currentIndex, isButtonAnimating, onSwipe]
  );

  // Show up to 2 cards: current + next preview
  const visibleCards = cards.slice(currentIndex, currentIndex + 2).reverse();

  return (
    <View className="flex-1">
      {/* Undo button */}
      {onUndo && swipedCards.length > 0 && (
        <View className="flex-row justify-end px-4 mb-2">
          <Pressable
            onPress={onUndo}
            accessibilityRole="button"
            accessibilityLabel="Annuler"
            className="flex-row items-center bg-warm-gray rounded-lg px-3 py-2"
            style={{ minHeight: 36 }}
          >
            <Ionicons name="arrow-undo" size={18} color="#1a365d" />
          </Pressable>
        </View>
      )}

      {/* Card stack with direction hints */}
      <View className="flex-1 justify-center" style={{ minHeight: 320 }}>
        <DirectionHints />
        {visibleCards.map((card, stackIndex) => {
          const isTop = stackIndex === visibleCards.length - 1;
          const { icon, name } = getThemeInfo(card.themeIds);

          return (
            <Animated.View
              key={card.id}
              style={[
                {
                  position: "absolute",
                  width: "100%",
                  top: 0,
                  zIndex: stackIndex,
                },
                !isTop && {
                  transform: [{ scale: 0.95 }, { translateY: 10 }],
                  opacity: 0.7,
                },
              ]}
            >
              <SwipeCard
                card={card}
                themeIcon={icon}
                themeName={name}
                onSwipe={onSwipe}
                isTop={isTop}
              />
            </Animated.View>
          );
        })}
      </View>

      {/* Accessible button alternatives */}
      <SwipeButtons
        onButtonPress={handleButtonPress}
        disabled={isButtonAnimating || currentIndex >= cards.length}
      />
    </View>
  );
}
