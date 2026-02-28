import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SwipeCard, type SwipeCardHandle } from "./SwipeCard";
import { SwipeButtons } from "./SwipeButtons";
import type { StatementCard, SwipeDirection } from "../../data/schema";

interface SwipeStackProps {
  cards: StatementCard[];
  currentIndex: number;
  onSwipe: (cardId: string, direction: SwipeDirection) => void;
  swipedCards: { card: StatementCard; direction: SwipeDirection }[];
  onUndo?: () => void;
  onShowDescription?: (cardId: string) => void;
}

export function SwipeStack({
  cards,
  currentIndex,
  onSwipe,
  swipedCards,
  onUndo,
  onShowDescription,
}: SwipeStackProps) {
  const { width, height: windowHeight } = useWindowDimensions();
  const isTabletLayout = width >= 768;
  const [isButtonAnimating, setIsButtonAnimating] = useState(false);
  const [stackHeight, setStackHeight] = useState(0);
  const topCardRef = useRef<SwipeCardHandle>(null);

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

  const cardHeight = useMemo(() => {
    const fallback = isTabletLayout
      ? Math.min(Math.max(windowHeight * 0.62, 700), 960)
      : Math.min(Math.max(windowHeight * 0.6, 500), 660);

    if (!stackHeight) return fallback;

    const controlsHeight = isTabletLayout ? 190 : 150;
    const undoHeight = onUndo && canUndo ? 36 : 0;
    const available = stackHeight - controlsHeight - undoHeight - 8;
    const desired = stackHeight * (isTabletLayout ? 0.74 : 0.66);
    const hardMin = isTabletLayout ? 560 : 420;
    const hardMax = isTabletLayout ? 980 : 660;
    const effectiveMax = available > 0 ? Math.min(hardMax, available) : hardMax;
    const effectiveMin = Math.min(hardMin, effectiveMax);

    return Math.min(effectiveMax, Math.max(effectiveMin, desired));
  }, [canUndo, isTabletLayout, onUndo, stackHeight, windowHeight]);

  return (
    <View
      className="flex-1"
      onLayout={(event) => setStackHeight(event.nativeEvent.layout.height)}
    >
      {/* Card stack */}
      <View
        className="justify-center"
        style={{ height: cardHeight + (isTabletLayout ? 28 : 14) }}
      >
        {/* Background dark blue line */}
        <View
          className="absolute bg-civic-navy"
          style={{
            top: "50%",
            left: isTabletLayout ? -36 : -50,
            right: isTabletLayout ? -36 : -50,
            height: isTabletLayout ? 72 : 64,
            marginTop: isTabletLayout ? -36 : -32,
            zIndex: 0,
          }}
        />

        {visibleCards.map((card, stackIndex) => {
          const isTop = stackIndex === visibleCards.length - 1;
          return (
            <Animated.View
              key={card.id}
              style={[
                {
                  position: "absolute",
                  width: "100%",
                  top: 0,
                  zIndex: stackIndex + 1,
                },
                !isTop && {
                  // Hidden exactly beneath the top card.
                  opacity: 1,
                },
              ]}
            >
              <SwipeCard
                ref={isTop ? topCardRef : undefined}
                card={card}
                onSwipe={onSwipe}
                onShowDescription={onShowDescription ? () => onShowDescription(card.id) : undefined}
                isTop={isTop}
                cardHeight={cardHeight}
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

      <View style={{ flex: isTabletLayout ? 0.2 : 1 }} />

      {/* Button controls */}
      <SwipeButtons
        onButtonPress={handleButtonPress}
        disabled={isButtonAnimating || currentIndex >= cards.length}
      />
    </View>
  );
}
