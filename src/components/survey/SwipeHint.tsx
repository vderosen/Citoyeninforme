import { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { useMotionPreference } from "../../hooks/useMotionPreference";

interface SwipeHintProps {
  visible: boolean;
}

export function SwipeHint({ visible }: SwipeHintProps) {
  const { shouldAnimate } = useMotionPreference();
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!visible || !shouldAnimate) {
      progress.value = 0;
      return;
    }

    progress.value = -1;
    progress.value = withRepeat(withTiming(1, { duration: 1700 }), -1, true);
  }, [progress, shouldAnimate, visible]);

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 56 }],
  }));

  if (!visible) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: "50%",
        marginTop: -9,
        alignItems: "center",
        zIndex: 30,
      }}
    >
      <Animated.View
        style={[
          {
            position: "absolute",
            top: -5,
            width: 24,
            height: 24,
            borderRadius: 12,
            backgroundColor: "rgba(255,255,255,0.92)",
            shadowColor: "#FFFFFF",
            shadowOpacity: 0.25,
            shadowRadius: 7,
            shadowOffset: { width: 0, height: 0 },
            elevation: 4,
          },
          dotStyle,
        ]}
      />
    </View>
  );
}
