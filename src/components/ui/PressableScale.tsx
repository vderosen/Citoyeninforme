import type { ReactNode } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  type PressableProps,
  type PressableStateCallbackType,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useMotionPreference } from "../../hooks/useMotionPreference";

const DEFAULT_HIT_SLOP = { top: 8, bottom: 8, left: 8, right: 8 } as const;
const IOS_MIN_TOUCH_TARGET = 44;

interface PressableScaleProps extends PressableProps {
  children: ReactNode;
  ensureMinTouchTarget?: boolean;
  minTouchSize?: number;
}

export function PressableScale({
  children,
  onPressIn,
  onPressOut,
  ensureMinTouchTarget = false,
  minTouchSize = IOS_MIN_TOUCH_TARGET,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);
  const { shouldAnimate } = useMotionPreference();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: GestureResponderEvent) => {
    if (shouldAnimate) scale.value = withTiming(0.97, { duration: 100 });
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    if (shouldAnimate) scale.value = withTiming(1, { duration: 150 });
    onPressOut?.(e);
  };

  const { testID, hitSlop, style, ...restProps } = props;

  const minTouchStyle = ensureMinTouchTarget
    ? { minWidth: minTouchSize, minHeight: minTouchSize }
    : undefined;

  const resolvedStyle = (
    state: PressableStateCallbackType
  ): StyleProp<ViewStyle> => {
    const computed = typeof style === "function" ? style(state) : style;
    return minTouchStyle ? [minTouchStyle, computed] : computed;
  };

  return (
    <Animated.View style={!shouldAnimate ? undefined : animatedStyle} testID={testID}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={hitSlop ?? DEFAULT_HIT_SLOP}
        style={resolvedStyle}
        {...restProps}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
