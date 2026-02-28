import { forwardRef, useImperativeHandle, useRef, useCallback } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useMotionPreference } from "../../hooks/useMotionPreference";
import { SwipeOverlay } from "./SwipeOverlay";
import { getCategoryTheme } from "../../utils/categoryTheme";
import { useSwipeAnimation, detectDirection } from "../../hooks/useSwipeAnimation";
import type { StatementCard, SwipeDirection } from "../../data/schema";

const DOUBLE_TAP_DELAY = 350;

export interface SwipeCardHandle {
  triggerSwipe: (direction: SwipeDirection) => void;
}

interface SwipeCardProps {
  card: StatementCard;
  onSwipe: (cardId: string, direction: SwipeDirection) => void;
  onShowDescription?: () => void;
  isTop: boolean;
  cardHeight: number;
}

function getStatementTypography(text: string, isTabletLayout: boolean): { fontSize: number; lineHeight: number } {
  const normalizedText = text.trim();
  const statementLength = normalizedText.length;
  const words = normalizedText.split(/\s+/);
  const longestWordLength = words.reduce((max, word) => Math.max(max, word.length), 0);

  if (isTabletLayout) {
    if (statementLength > 160 || longestWordLength > 20) return { fontSize: 38, lineHeight: 47 };
    if (statementLength > 125 || longestWordLength > 17) return { fontSize: 41, lineHeight: 50 };
    if (statementLength > 90) return { fontSize: 44, lineHeight: 54 };
    return { fontSize: 48, lineHeight: 58 };
  }

  if (statementLength > 160 || longestWordLength > 20) return { fontSize: 24, lineHeight: 31 };
  if (statementLength > 125 || longestWordLength > 17) return { fontSize: 26, lineHeight: 33 };
  if (statementLength > 90) return { fontSize: 28, lineHeight: 35 };
  return { fontSize: 30, lineHeight: 38 };
}

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  function SwipeCard({ card, onSwipe, onShowDescription, isTop, cardHeight }, ref) {
    const { width, height } = useWindowDimensions();
    const isTabletLayout = width >= 768;
    const { shouldAnimate } = useMotionPreference();
    const lastTapTime = useRef(0);

    const handleSwipe = useCallback(
      (direction: SwipeDirection) => {
        onSwipe(card.id, direction);
      },
      [card.id, onSwipe]
    );

    const {
      translateX,
      translateY,
      opacity,
      scale,
      skipProgress,
      isAnimatingOut,
      animateButtonExit,
      animateGestureExit,
    } = useSwipeAnimation({
      shouldAnimate,
      width,
      height,
      onCompleteSwipe: handleSwipe,
    });

    const triggerSkip = useCallback(() => {
      animateButtonExit("skip");
    }, [animateButtonExit]);

    const handleCardPress = useCallback(() => {
      const now = Date.now();
      if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
        lastTapTime.current = 0;
        triggerSkip();
      } else {
        lastTapTime.current = now;
      }
    }, [triggerSkip]);

    useImperativeHandle(ref, () => ({
      triggerSwipe(direction: SwipeDirection) {
        animateButtonExit(direction);
      },
    }));

    const panGesture = Gesture.Pan()
      .enabled(isTop)
      .onUpdate((event) => {
        if (isAnimatingOut.value) return;
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.1;
      })
      .onEnd((event) => {
        if (isAnimatingOut.value) return;
        const direction = detectDirection(
          event.translationX,
          event.velocityX
        );

        if (direction) {
          animateGestureExit(direction);
        } else {
          translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
          translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
        }
      });

    const cardStyle = useAnimatedStyle(() => {
      if (!shouldAnimate) {
        return {
          transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
          ],
          opacity: opacity.value,
        };
      }

      const rotation = interpolate(
        translateX.value,
        [-width, 0, width],
        [-20, 0, 20],
        Extrapolation.CLAMP
      );

      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { rotate: `${rotation}deg` },
          { scale: scale.value },
        ],
        opacity: opacity.value,
      };
    });

    const theme = getCategoryTheme(card.category || 'Autre');
    const sideInset = isTabletLayout ? 14 : 32;
    const { fontSize: statementFontSize, lineHeight: statementLineHeight } = getStatementTypography(
      card.text,
      isTabletLayout
    );

    return (
      <View style={{ width: "100%", position: "absolute", zIndex: isTop ? 10 : 0 }}>
        <GestureDetector gesture={panGesture}>
          <Animated.View
            testID={isTop ? 'active-card' : `swipe-card-${card.id}`}
            style={[
              cardStyle,
              {
                position: "absolute",
                width: "100%",
                zIndex: isTop ? 10 : 0,
              },
            ]}
          >
            <Pressable onPress={isTop ? handleCardPress : undefined}>
              {/* Fake card stacks in the background - only show for !isTop (the next card) */}
              {!isTop && (
                <>
                  <View
                    className="absolute inset-0 rounded-3xl shadow-sm"
                    style={{
                      marginHorizontal: sideInset,
                      backgroundColor: "#E2E8F0",
                      transform: [{ translateX: 14 }, { translateY: -14 }],
                      zIndex: -2
                    }}
                  />
                  <View
                    className="absolute inset-0 rounded-3xl shadow-sm"
                    style={{
                      marginHorizontal: sideInset,
                      backgroundColor: "#F1F5F9",
                      transform: [{ translateX: 7 }, { translateY: -7 }],
                      zIndex: -1
                    }}
                  />
                </>
              )}
              {/* Main Card */}
              <View
                className="overflow-hidden rounded-3xl shadow-elevated border border-warm-gray/40"
                style={{
                  backgroundColor: theme.bg,
                  marginHorizontal: sideInset,
                  height: cardHeight,
                  minHeight: cardHeight,
                }}
              >
                {/* Category Badge Top Left */}
                <View
                  className="flex-row items-center"
                  style={{
                    paddingTop: isTabletLayout ? 28 : 24,
                    paddingHorizontal: isTabletLayout ? 28 : 24,
                  }}
                >
                  <View
                    style={{ backgroundColor: 'white' }}
                    className="flex-row items-center self-start px-3 py-1.5 rounded-full shadow-sm"
                  >
                    <Ionicons
                      name={theme.icon as any}
                      size={isTabletLayout ? 18 : 14}
                      color={theme.bg}
                    />
                    <Text
                      className="ml-1.5 font-display-bold uppercase tracking-widest"
                      style={{ color: theme.bg, fontSize: isTabletLayout ? 13 : 12 }}
                    >
                      {card.category}
                    </Text>
                  </View>
                </View>

                {/* Statement text */}
                <View
                  className="flex-1 justify-start"
                  style={{
                    paddingHorizontal: isTabletLayout ? 40 : 24,
                    paddingTop: isTabletLayout ? 36 : 26,
                    paddingBottom: isTabletLayout ? 24 : 12,
                  }}
                >
                  <Text
                    className="font-display-bold"
                    numberOfLines={isTabletLayout ? 6 : 8}
                    style={{
                      color: "white",
                      fontSize: statementFontSize,
                      lineHeight: statementLineHeight,
                    }}
                    accessibilityRole="header"
                  >
                    {card.text}
                  </Text>
                </View>

                {card.description && (
                  <Pressable
                    onPress={onShowDescription}
                    className="bg-white rounded-full shadow-sm border border-warm-gray/50 items-center justify-center"
                    style={{
                      marginHorizontal: isTabletLayout ? 40 : 32,
                      marginBottom: isTabletLayout ? 24 : 24,
                      paddingVertical: isTabletLayout ? 16 : 14,
                      paddingHorizontal: 24,
                    }}
                    hitSlop={10}
                  >
                    <Text
                      className="font-display-bold text-civic-navy uppercase tracking-wider"
                      style={{ fontSize: isTabletLayout ? 17 : 14 }}
                    >
                      + EN SAVOIR PLUS
                    </Text>
                  </Pressable>
                )}

                {/* Direction overlays — opacity driven by gesture position */}
                {process.env.NODE_ENV !== 'test' && (
                  <SwipeOverlay
                    translationX={translateX}
                    translationY={translateY}
                    skipProgress={skipProgress}
                  />
                )}
              </View>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }
);
