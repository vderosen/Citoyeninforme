import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { useCallback, useMemo, useRef, useState } from "react";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { SwipeCard, type SwipeCardHandle } from "./SwipeCard";
import { SwipeButtons } from "./SwipeButtons";
import { SwipeHint } from "./SwipeHint";
import type { StatementCard, SwipeDirection } from "../../data/schema";

interface SwipeStackProps {
  cards: StatementCard[];
  currentIndex: number;
  onSwipe: (cardId: string, direction: SwipeDirection, isX2Enabled: boolean) => void;
  swipedCards: { card: StatementCard; direction: SwipeDirection; isX2Enabled: boolean }[];
  x2ByCardId: Record<string, boolean>;
  onToggleX2: (cardId: string) => void;
  showSwipeHint?: boolean;
  onUndo?: () => void;
  onShowDescription?: (cardId: string) => void;
}

export function SwipeStack({
  cards,
  currentIndex,
  onSwipe,
  swipedCards,
  x2ByCardId,
  onToggleX2,
  showSwipeHint = false,
  onUndo,
  onShowDescription,
}: SwipeStackProps) {
  const { width, height: windowHeight } = useWindowDimensions();
  const isTabletLayout = width >= 768;
  const isLargePhone = width >= 428;
  const spacerFlex = isTabletLayout ? 0.2 : isLargePhone ? 0.08 : 0.05;
  const undoSlotHeight = onUndo ? (isTabletLayout ? 40 : 36) : 0;
  const [isButtonAnimating, setIsButtonAnimating] = useState(false);
  const [stackHeight, setStackHeight] = useState(0);
  const topCardRef = useRef<SwipeCardHandle>(null);
  const hasMeasuredStackHeight = stackHeight > 0;

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
      : Math.min(Math.max(windowHeight * 0.67, 500), 680);

    if (!stackHeight) return fallback;

    const controlsHeight = isTabletLayout ? 210 : isLargePhone ? 154 : 144;
    const available = stackHeight - controlsHeight - undoSlotHeight - 8;
    const desired = stackHeight * (isTabletLayout ? 0.74 : isLargePhone ? 0.73 : 0.7);
    const hardMin = isTabletLayout ? 560 : isLargePhone ? 460 : 420;
    const hardMax = isTabletLayout ? 980 : 680;
    const effectiveMax = available > 0 ? Math.min(hardMax, available) : hardMax;
    const effectiveMin = Math.min(hardMin, effectiveMax);

    return Math.min(effectiveMax, Math.max(effectiveMin, desired));
  }, [isLargePhone, isTabletLayout, stackHeight, undoSlotHeight, windowHeight]);

  const handleStackLayout = useCallback((nextHeight: number) => {
    if (nextHeight <= 0) return;
    setStackHeight((previousHeight) =>
      Math.abs(previousHeight - nextHeight) > 1 ? nextHeight : previousHeight,
    );
  }, []);

  return (
    <View
      className="flex-1"
      onLayout={(event) => handleStackLayout(event.nativeEvent.layout.height)}
    >
      {/* Card stack */}
      <View
        className="justify-center"
        style={{ height: cardHeight + (isTabletLayout ? 28 : 14) }}
      >
        {hasMeasuredStackHeight && (
          <>
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
                    isX2Enabled={!!x2ByCardId[card.id]}
                    onToggleX2={isTop ? () => onToggleX2(card.id) : undefined}
                  />
                </Animated.View>
              );
            })}

            <SwipeHint visible={showSwipeHint} />
          </>
        )}

      </View>

      {/* Undo slot — fixed height to avoid first-swipe layout shift */}
      {onUndo && (
        <View
          style={{
            height: undoSlotHeight,
            marginTop: isTabletLayout ? -12 : -15,
            justifyContent: "center",
          }}
        >
          {canUndo && (
            <Pressable
              onPress={onUndo}
              accessibilityRole="button"
              accessibilityLabel={t("undoLabel")}
              className="flex-row items-center justify-center gap-1.5 py-2"
            >
              <Ionicons name="arrow-undo" size={14} color="#9ca3af" />
              <Text className="font-body text-xs text-text-caption">
                {t("undoPreviousQuestion")}
              </Text>
            </Pressable>
          )}
        </View>
      )}

      <View style={{ flex: spacerFlex }} />

      {/* Button controls */}
      <SwipeButtons
        onButtonPress={handleButtonPress}
        disabled={isButtonAnimating || currentIndex >= cards.length}
      />
    </View>
  );
}
