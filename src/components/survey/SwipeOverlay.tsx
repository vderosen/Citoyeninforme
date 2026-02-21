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
}

function OverlayBadge({
  icon,
  label,
  color,
  bgClass,
  textClass,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  bgClass: string;
  textClass: string;
}) {
  return (
    <View className={`${bgClass} rounded-xl px-3 py-2 flex-row items-center`}>
      <Ionicons name={icon} size={20} color={color} />
      <Text className={`font-body-medium ${textClass} ml-1 text-sm`}>
        {label}
      </Text>
    </View>
  );
}

export function SwipeOverlay({
  translationX,
  translationY,
}: SwipeOverlayProps) {
  const agreeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translationX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const disagreeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translationX.value,
      [0, -SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const stronglyAgreeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translationY.value,
      [0, -SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  const stronglyDisagreeStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translationY.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolation.CLAMP
    ),
  }));

  return (
    <>
      <Animated.View
        style={[agreeStyle]}
        className="absolute top-4 right-4"
        pointerEvents="none"
      >
        <OverlayBadge
          icon="checkmark-circle"
          label="D'accord"
          color="#22c55e"
          bgClass="bg-green-500/20"
          textClass="text-green-600"
        />
      </Animated.View>

      <Animated.View
        style={[disagreeStyle]}
        className="absolute top-4 left-4"
        pointerEvents="none"
      >
        <OverlayBadge
          icon="close-circle"
          label="Pas d'accord"
          color="#ef4444"
          bgClass="bg-red-500/20"
          textClass="text-red-600"
        />
      </Animated.View>

      <Animated.View
        style={[stronglyAgreeStyle]}
        className="absolute bottom-4 left-0 right-0 items-center"
        pointerEvents="none"
      >
        <OverlayBadge
          icon="heart"
          label={`Coup de c\u0153ur`}
          color="#f59e0b"
          bgClass="bg-amber-500/20"
          textClass="text-amber-600"
        />
      </Animated.View>

      <Animated.View
        style={[stronglyDisagreeStyle]}
        className="absolute top-1/2 left-0 right-0 items-center"
        pointerEvents="none"
      >
        <OverlayBadge
          icon="flash"
          label="Catastrophe"
          color="#374151"
          bgClass="bg-gray-700/20"
          textClass="text-gray-700"
        />
      </Animated.View>
    </>
  );
}
