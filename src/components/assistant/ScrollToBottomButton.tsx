import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";

interface ScrollToBottomButtonProps {
  visible: boolean;
  onPress: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ScrollToBottomButton({ visible, onPress }: ScrollToBottomButtonProps) {
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: withTiming(visible ? 1 : 0, { duration: 200 }),
    transform: [
      { translateY: withTiming(visible ? 0 : 10, { duration: 200 }) },
    ],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      style={[
        {
          position: "absolute",
          bottom: 80,
          alignSelf: "center",
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: "#FFFFFF",
          alignItems: "center",
          justifyContent: "center",
          shadowColor: "#1B2A4A",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.12,
          shadowRadius: 12,
          elevation: 4,
        },
        animatedStyle,
      ]}
      pointerEvents={visible ? "auto" : "none"}
      accessibilityRole="button"
      accessibilityLabel="Scroll to bottom"
    >
      <Ionicons name="chevron-down" size={22} color="#1B2A4A" />
    </AnimatedPressable>
  );
}
