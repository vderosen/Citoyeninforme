import type { ReactNode } from "react";
import { type GestureResponderEvent, Pressable, type PressableProps } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from "react-native-reanimated";

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
  const reduceMotion = useReducedMotion();

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = (e: GestureResponderEvent) => {
    if (!reduceMotion) scale.value = withTiming(0.97, { duration: 100 });
    onPressIn?.(e);
  };

  const handlePressOut = (e: GestureResponderEvent) => {
    if (!reduceMotion) scale.value = withTiming(1, { duration: 150 });
    onPressOut?.(e);
  };

  const { testID, ...restProps } = props;

  return (
    <Animated.View style={reduceMotion ? undefined : animatedStyle} testID={testID}>
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
