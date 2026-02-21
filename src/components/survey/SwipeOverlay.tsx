import { View, Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const SWIPE_THRESHOLD = 120;

interface SwipeOverlayProps {
  translationX: SharedValue<number>;
  translationY: SharedValue<number>;
  skipProgress: SharedValue<number>;
}

const DIRECTIONS = {
  agree: {
    icon: "checkmark-circle" as keyof typeof Ionicons.glyphMap,
    label: "D'accord",
    color: "rgba(34, 197, 94, 1)",
    bg: "rgba(34, 197, 94, 0.25)",
    border: "rgba(34, 197, 94, 0.6)",
  },
  disagree: {
    icon: "close-circle" as keyof typeof Ionicons.glyphMap,
    label: "Pas d'accord",
    color: "rgba(239, 68, 68, 1)",
    bg: "rgba(239, 68, 68, 0.25)",
    border: "rgba(239, 68, 68, 0.6)",
  },
  strongly_agree: {
    icon: "heart" as keyof typeof Ionicons.glyphMap,
    label: "Coup de c\u0153ur",
    color: "rgba(245, 158, 11, 1)",
    bg: "rgba(245, 158, 11, 0.25)",
    border: "rgba(245, 158, 11, 0.6)",
  },
  strongly_disagree: {
    icon: "flash" as keyof typeof Ionicons.glyphMap,
    label: "Catastrophe",
    color: "rgba(55, 65, 81, 1)",
    bg: "rgba(55, 65, 81, 0.25)",
    border: "rgba(55, 65, 81, 0.6)",
  },
};

export function SwipeOverlay({
  translationX,
  translationY,
  skipProgress,
}: SwipeOverlayProps) {
  // Agree (right)
  const agreeStyle = useAnimatedStyle(() => {
    const absX = Math.abs(translationX.value);
    const absY = Math.abs(translationY.value);
    const isHorizontal = absX >= absY;
    const isRight = translationX.value > 0;
    const active = isHorizontal && isRight;

    return {
      opacity: active
        ? interpolate(
            translationX.value,
            [0, SWIPE_THRESHOLD],
            [0, 1],
            Extrapolation.CLAMP
          )
        : 0,
    };
  });

  // Disagree (left)
  const disagreeStyle = useAnimatedStyle(() => {
    const absX = Math.abs(translationX.value);
    const absY = Math.abs(translationY.value);
    const isHorizontal = absX >= absY;
    const isLeft = translationX.value < 0;
    const active = isHorizontal && isLeft;

    return {
      opacity: active
        ? interpolate(
            translationX.value,
            [0, -SWIPE_THRESHOLD],
            [0, 1],
            Extrapolation.CLAMP
          )
        : 0,
    };
  });

  // Strongly agree (up)
  const stronglyAgreeStyle = useAnimatedStyle(() => {
    const absX = Math.abs(translationX.value);
    const absY = Math.abs(translationY.value);
    const isVertical = absY > absX;
    const isUp = translationY.value < 0;
    const active = isVertical && isUp;

    return {
      opacity: active
        ? interpolate(
            translationY.value,
            [0, -SWIPE_THRESHOLD],
            [0, 1],
            Extrapolation.CLAMP
          )
        : 0,
    };
  });

  // Strongly disagree (down)
  const stronglyDisagreeStyle = useAnimatedStyle(() => {
    const absX = Math.abs(translationX.value);
    const absY = Math.abs(translationY.value);
    const isVertical = absY > absX;
    const isDown = translationY.value > 0;
    const active = isVertical && isDown;

    return {
      opacity: active
        ? interpolate(
            translationY.value,
            [0, SWIPE_THRESHOLD],
            [0, 1],
            Extrapolation.CLAMP
          )
        : 0,
    };
  });

  const skipStyle = useAnimatedStyle(() => ({
    opacity: skipProgress.value,
  }));

  return (
    <>
      {(
        Object.entries(DIRECTIONS) as [
          keyof typeof DIRECTIONS,
          (typeof DIRECTIONS)[keyof typeof DIRECTIONS],
        ][]
      ).map(([key, dir]) => {
        const style =
          key === "agree"
            ? agreeStyle
            : key === "disagree"
            ? disagreeStyle
            : key === "strongly_agree"
            ? stronglyAgreeStyle
            : stronglyDisagreeStyle;

        return (
          <Animated.View
            key={key}
            style={[
              style,
              {
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                borderRadius: 16,
                backgroundColor: dir.bg,
                borderWidth: 3,
                borderColor: dir.border,
                justifyContent: "center",
                alignItems: "center",
              },
            ]}
            pointerEvents="none"
          >
            <Ionicons name={dir.icon} size={56} color={dir.color} />
            <Text
              style={{
                color: dir.color,
                fontWeight: "700",
                fontSize: 16,
                marginTop: 8,
              }}
            >
              {dir.label}
            </Text>
          </Animated.View>
        );
      })}

      {/* Skip overlay — gray */}
      <Animated.View
        style={[
          skipStyle,
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 16,
            backgroundColor: "rgba(156, 163, 175, 0.3)",
            borderWidth: 3,
            borderColor: "rgba(156, 163, 175, 0.5)",
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
        pointerEvents="none"
      >
        <Ionicons name="remove-circle" size={56} color="rgba(107, 114, 128, 0.8)" />
        <Text
          style={{
            color: "rgba(107, 114, 128, 0.9)",
            fontWeight: "700",
            fontSize: 16,
            marginTop: 8,
          }}
        >
          Pas d'avis
        </Text>
      </Animated.View>
    </>
  );
}
