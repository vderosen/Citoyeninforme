import type { ReactNode } from "react";
import { type GestureResponderEvent, Pressable, type PressableProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useMotionPreference } from "../../hooks/useMotionPreference";

interface PressableScaleProps extends PressableProps {
  children: ReactNode;
}

export function PressableScale({
  children,
  onPressIn,
  onPressOut,
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

  const { testID, ...restProps } = props;

  return (
    <Animated.View style={!shouldAnimate ? undefined : animatedStyle} testID={testID}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        {...restProps}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
