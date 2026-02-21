import { View, Text, Pressable } from "react-native";
import { useCallback, useRef, useState } from "react";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SwipeCard, type SwipeCardHandle } from "./SwipeCard";
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

export function SwipeStack({
  cards,
  currentIndex,
  onSwipe,
  swipedCards,
  onUndo,
}: SwipeStackProps) {
  const themes = useElectionStore((s) => s.themes);
  const [isButtonAnimating, setIsButtonAnimating] = useState(false);
  const topCardRef = useRef<SwipeCardHandle>(null);

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
      if (!cards[currentIndex] || isButtonAnimating) return;
      setIsButtonAnimating(true);
      if (topCardRef.current) {
        topCardRef.current.triggerSwipe(direction);
      }
      // Reset after animation completes (200ms lead-in + 400ms fly-off + buffer)
      setTimeout(() => setIsButtonAnimating(false), 800);
    },
    [cards, currentIndex, isButtonAnimating]
  );

  // Show up to 2 cards: current + next preview
  const visibleCards = cards.slice(currentIndex, currentIndex + 2).reverse();
  const canUndo = currentIndex > 0 || swipedCards.length > 0;

  const { t } = useTranslation("survey");

  return (
    <View className="flex-1">
      {/* Card stack */}
      <View className="justify-center" style={{ minHeight: 320, maxHeight: 420 }}>
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
                ref={isTop ? topCardRef : undefined}
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

      {/* Undo — centered link directly under the card */}
      {onUndo && canUndo && (
        <Pressable
          onPress={onUndo}
          accessibilityRole="button"
          accessibilityLabel={t("undoLabel")}
          className="flex-row items-center justify-center gap-1.5 py-2"
          style={{ marginTop: -15 }}
        >
          <Ionicons name="arrow-undo" size={14} color="#9ca3af" />
          <Text className="font-body text-xs text-text-caption">
            {t("undoPreviousQuestion")}
          </Text>
        </Pressable>
      )}

      <View className="flex-1" />

      {/* Button controls */}
      <SwipeButtons
        onButtonPress={handleButtonPress}
        disabled={isButtonAnimating || currentIndex >= cards.length}
      />
    </View>
  );
}
