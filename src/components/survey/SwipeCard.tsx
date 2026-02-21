import { View, Text, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { useMotionPreference } from "../../hooks/useMotionPreference";
import { SwipeOverlay } from "./SwipeOverlay";
import type { StatementCard, SwipeDirection } from "../../data/schema";

const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 800;
const VELOCITY_REDUCED_THRESHOLD = 60;

interface SwipeCardProps {
  card: StatementCard;
  themeIcon: string;
  themeName: string;
  onSwipe: (cardId: string, direction: SwipeDirection) => void;
  isTop: boolean;
}

function detectDirection(
  translationX: number,
  translationY: number,
  velocityX: number,
  velocityY: number
): SwipeDirection | null {
  "worklet";
  const absX = Math.abs(translationX);
  const absY = Math.abs(translationY);
  const fastFlick =
    Math.abs(velocityX) > VELOCITY_THRESHOLD ||
    Math.abs(velocityY) > VELOCITY_THRESHOLD;
  const threshold = fastFlick ? VELOCITY_REDUCED_THRESHOLD : SWIPE_THRESHOLD;

  if (absX < threshold && absY < threshold) return null;

  if (absX > absY) {
    return translationX > 0 ? "agree" : "disagree";
  } else {
    return translationY < 0 ? "strongly_agree" : "strongly_disagree";
  }
}

export function SwipeCard({
  card,
  themeIcon,
  themeName,
  onSwipe,
  isTop,
}: SwipeCardProps) {
  const { width, height } = useWindowDimensions();
  const { shouldAnimate } = useMotionPreference();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(1);
  const isAnimatingOut = useSharedValue(false);

  const handleSwipe = (direction: SwipeDirection) => {
    onSwipe(card.id, direction);
  };

  const panGesture = Gesture.Pan()
    .enabled(isTop)
    .onUpdate((event) => {
      if (isAnimatingOut.value) return;
      translateX.value = event.translationX;
      translateY.value = event.translationY;
    })
    .onEnd((event) => {
      if (isAnimatingOut.value) return;
      const direction = detectDirection(
        event.translationX,
        event.translationY,
        event.velocityX,
        event.velocityY
      );

      if (direction) {
        isAnimatingOut.value = true;

        if (shouldAnimate) {
          // Full animation: card flies off-screen
          const exitX =
            direction === "agree"
              ? width
              : direction === "disagree"
              ? -width
              : 0;
          const exitY =
            direction === "strongly_agree"
              ? -height
              : direction === "strongly_disagree"
              ? height
              : 0;

          translateX.value = withTiming(exitX, { duration: 300 });
          translateY.value = withTiming(exitY, { duration: 300 }, () => {
            runOnJS(handleSwipe)(direction);
          });
        } else {
          // Reduced motion: fade out instead of flying off-screen
          translateX.value = withTiming(0, { duration: 100 });
          translateY.value = withTiming(0, { duration: 100 });
          opacity.value = withTiming(0, { duration: 200 }, () => {
            runOnJS(handleSwipe)(direction);
          });
        }
      } else {
        translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
        translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .enabled(isTop)
    .numberOfTaps(2)
    .onEnd(() => {
      if (isAnimatingOut.value) return;
      isAnimatingOut.value = true;
      // Skip: fade out the card
      opacity.value = withTiming(0, { duration: 200 }, () => {
        runOnJS(handleSwipe)("skip");
      });
    });

  const composedGesture = Gesture.Simultaneous(panGesture, doubleTapGesture);

  const cardStyle = useAnimatedStyle(() => {
    if (!shouldAnimate) {
      // Reduced motion: no rotation, translate for gesture tracking only
      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
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
      ],
      opacity: opacity.value,
    };
  });

  return (
    <GestureDetector gesture={composedGesture}>
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
        <View className="mx-4 bg-warm-white rounded-2xl p-6 shadow-lg border border-warm-gray min-h-[280px]">
          {/* Theme badge */}
          <View className="flex-row items-center mb-4">
            <Text className="text-lg mr-2">{themeIcon}</Text>
            <Text className="font-body-medium text-sm text-text-caption">
              {themeName}
            </Text>
          </View>

          {/* Statement text */}
          <Text
            className="font-display-bold text-xl text-civic-navy leading-snug flex-1"
            accessibilityRole="header"
          >
            {card.text}
          </Text>

          {/* Direction overlays — opacity driven by gesture position */}
          <SwipeOverlay
            translationX={translateX}
            translationY={translateY}
          />
        </View>
      </Animated.View>
    </GestureDetector>
  );
}
