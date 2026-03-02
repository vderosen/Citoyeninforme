import { Text } from "react-native";
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  type SharedValue,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const SWIPE_THRESHOLD = 120;

interface SwipeOverlayProps {
  translationX: SharedValue<number>;
  skipProgress: SharedValue<number>;
}

const DIRECTIONS = {
  agree: {
    icon: "checkmark" as keyof typeof Ionicons.glyphMap,
    color: "rgba(34, 197, 94, 1)",
    bg: "rgba(34, 197, 94, 0.25)",
    border: "rgba(34, 197, 94, 0.6)",
  },
  disagree: {
    icon: "close" as keyof typeof Ionicons.glyphMap,
    color: "rgba(239, 68, 68, 1)",
    bg: "rgba(239, 68, 68, 0.25)",
    border: "rgba(239, 68, 68, 0.6)",
  },
};

export function SwipeOverlay({ translationX, skipProgress }: SwipeOverlayProps) {
  const { t } = useTranslation("survey");
  const agreeStyle = useAnimatedStyle(() => ({
    opacity:
      translationX.value > 0
        ? interpolate(
            translationX.value,
            [0, SWIPE_THRESHOLD],
            [0, 1],
            Extrapolation.CLAMP
          )
        : 0,
  }));

  const disagreeStyle = useAnimatedStyle(() => ({
    opacity:
      translationX.value < 0
        ? interpolate(
            translationX.value,
            [0, -SWIPE_THRESHOLD],
            [0, 1],
            Extrapolation.CLAMP
          )
        : 0,
  }));

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
        const style = key === "agree" ? agreeStyle : disagreeStyle;

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
            <Ionicons name={dir.icon as any} size={56} color={dir.color} />
            <Text
              style={{
                color: dir.color,
                fontWeight: "700",
                fontSize: 16,
                marginTop: 8,
              }}
            >
              {key === "agree" ? t("swipeAgree") : t("swipeDisagree")}
            </Text>
          </Animated.View>
        );
      })}

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
        <Text style={{ fontSize: 56 }}>🤷‍♂️</Text>
        <Text
          style={{
            color: "rgba(107, 114, 128, 0.9)",
            fontWeight: "700",
            fontSize: 16,
            marginTop: 8,
          }}
        >
          {t("swipeSkip")}
        </Text>
      </Animated.View>
    </>
  );
}
