import { forwardRef, useImperativeHandle, useRef, useCallback } from "react";
import { View, Text, Pressable, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  runOnJS,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { useMotionPreference } from "../../hooks/useMotionPreference";
import { SwipeOverlay } from "./SwipeOverlay";
import type { StatementCard, SwipeDirection } from "../../data/schema";

const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 800;
const VELOCITY_REDUCED_THRESHOLD = 60;
const DOUBLE_TAP_DELAY = 350;

export interface SwipeCardHandle {
  triggerSwipe: (direction: SwipeDirection) => void;
}

interface SwipeCardProps {
  card: StatementCard;
  onSwipe: (cardId: string, direction: SwipeDirection) => void;
  onShowDescription?: () => void;
  isTop: boolean;
}

function detectDirection(
  translationX: number,
  velocityX: number
): SwipeDirection | null {
  "worklet";
  const absX = Math.abs(translationX);
  const fastFlick = Math.abs(velocityX) > VELOCITY_THRESHOLD;
  const threshold = fastFlick ? VELOCITY_REDUCED_THRESHOLD : SWIPE_THRESHOLD;

  if (absX < threshold) return null;
  return translationX > 0 ? "agree" : "disagree";
}

/** Animate exit after a gesture — card is already at drag position */
function animateGestureExit(
  direction: SwipeDirection,
  shouldAnimate: boolean,
  width: number,
  height: number,
  translateX: SharedValue<number>,
  translateY: SharedValue<number>,
  opacity: SharedValue<number>,
  scale: SharedValue<number>,
  isAnimatingOut: SharedValue<boolean>,
  onCompleteSwipe: (direction: SwipeDirection) => void
) {
  "worklet";
  isAnimatingOut.value = true;

  if (shouldAnimate) {
    const exitX =
      direction === "agree" ? width : direction === "disagree" ? -width : 0;
    const exitY =
      direction === "strongly_agree"
        ? -height
        : direction === "strongly_disagree"
          ? height
          : 0;

    translateX.value = withTiming(exitX, { duration: 500 });
    translateY.value = withTiming(exitY, { duration: 500 }, () => {
      runOnJS(onCompleteSwipe)(direction);
    });
    scale.value = withTiming(0.92, { duration: 500 });
  } else {
    const flashX =
      direction === "agree"
        ? SWIPE_THRESHOLD
        : direction === "disagree"
          ? -SWIPE_THRESHOLD
          : 0;
    const flashY =
      direction === "strongly_agree"
        ? -SWIPE_THRESHOLD
        : direction === "strongly_disagree"
          ? SWIPE_THRESHOLD
          : 0;

    translateX.value = withTiming(flashX, { duration: 150 });
    translateY.value = withTiming(flashY, { duration: 150 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onCompleteSwipe)(direction);
    });
  }
}

/** Animate exit from a button press — two-stage: show color, then fly off */
function animateButtonExit(
  direction: SwipeDirection,
  shouldAnimate: boolean,
  width: number,
  height: number,
  translateX: SharedValue<number>,
  translateY: SharedValue<number>,
  opacity: SharedValue<number>,
  scale: SharedValue<number>,
  skipProgress: SharedValue<number>,
  isAnimatingOut: SharedValue<boolean>,
  onCompleteSwipe: (direction: SwipeDirection) => void
) {
  isAnimatingOut.value = true;

  if (direction === "skip") {
    skipProgress.value = withTiming(1, { duration: 250 });
    opacity.value = withDelay(
      300,
      withTiming(0, { duration: 250 }, () => {
        runOnJS(onCompleteSwipe)("skip");
      })
    );
    return;
  }

  // Stage 1 target: snap to threshold to show the colored overlay
  const thresholdX =
    direction === "agree"
      ? SWIPE_THRESHOLD
      : direction === "disagree"
        ? -SWIPE_THRESHOLD
        : 0;
  const thresholdY =
    direction === "strongly_agree"
      ? -SWIPE_THRESHOLD
      : direction === "strongly_disagree"
        ? SWIPE_THRESHOLD
        : 0;

  // Stage 2 target: fly off screen
  const exitX =
    direction === "agree" ? width : direction === "disagree" ? -width : 0;
  const exitY =
    direction === "strongly_agree"
      ? -height
      : direction === "strongly_disagree"
        ? height
        : 0;

  if (shouldAnimate) {
    // Stage 1: snap to threshold (200ms) → Stage 2: fly off (400ms)
    translateX.value = withSequence(
      withTiming(thresholdX, { duration: 200 }),
      withTiming(exitX, { duration: 400 })
    );
    translateY.value = withSequence(
      withTiming(thresholdY, { duration: 200 }),
      withTiming(exitY, { duration: 400 }, () => {
        runOnJS(onCompleteSwipe)(direction);
      })
    );
    scale.value = withDelay(200, withTiming(0.92, { duration: 400 }));
  } else {
    translateX.value = withTiming(thresholdX, { duration: 150 });
    translateY.value = withTiming(thresholdY, { duration: 150 });
    opacity.value = withDelay(
      200,
      withTiming(0, { duration: 200 }, () => {
        runOnJS(onCompleteSwipe)(direction);
      })
    );
  }
}

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  function SwipeCard({ card, onSwipe, onShowDescription, isTop }, ref) {
    const { width, height } = useWindowDimensions();
    const { shouldAnimate } = useMotionPreference();
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const skipProgress = useSharedValue(0);
    const isAnimatingOut = useSharedValue(false);
    const lastTapTime = useRef(0);

    const handleSwipe = useCallback(
      (direction: SwipeDirection) => {
        onSwipe(card.id, direction);
      },
      [card.id, onSwipe]
    );

    const triggerSkip = useCallback(() => {
      if (isAnimatingOut.value) return;
      animateButtonExit(
        "skip",
        shouldAnimate,
        width,
        height,
        translateX,
        translateY,
        opacity,
        scale,
        skipProgress,
        isAnimatingOut,
        handleSwipe
      );
    }, [handleSwipe, shouldAnimate, width, height]);

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
        if (isAnimatingOut.value) return;
        animateButtonExit(
          direction,
          shouldAnimate,
          width,
          height,
          translateX,
          translateY,
          opacity,
          scale,
          skipProgress,
          isAnimatingOut,
          handleSwipe
        );
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
          animateGestureExit(
            direction,
            shouldAnimate,
            width,
            height,
            translateX,
            translateY,
            opacity,
            scale,
            isAnimatingOut,
            handleSwipe
          );
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

    return (
      <GestureDetector gesture={panGesture}>
        <Animated.View
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
            <View className="mx-4 bg-warm-white rounded-2xl p-6 shadow-lg border border-warm-gray min-h-[280px]">
              {/* Statement text */}
              <Text
                className="font-display-bold text-xl text-civic-navy leading-snug flex-1"
                accessibilityRole="header"
              >
                {card.text}
              </Text>

              {card.description && (
                <Pressable
                  onPress={onShowDescription}
                  className="mt-6 py-3.5 px-6 bg-white rounded-2xl shadow-sm border border-warm-gray/50 items-center justify-center"
                  hitSlop={10}
                >
                  <Text className="font-display-bold text-sm text-civic-navy uppercase tracking-wider">
                    + EN SAVOIR PLUS
                  </Text>
                </Pressable>
              )}

              {/* Direction overlays — opacity driven by gesture position */}
              <SwipeOverlay
                translationX={translateX}
                translationY={translateY}
                skipProgress={skipProgress}
              />
            </View>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    );
  }
);
