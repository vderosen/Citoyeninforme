import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";

const DOT_SIZE = 8;
const BOUNCE_HEIGHT = -6;
const DURATION = 300;

function BouncingDot({ delay }: { delay: number }) {
  const translateY = useSharedValue(0);

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(BOUNCE_HEIGHT, { duration: DURATION }),
          withTiming(0, { duration: DURATION })
        ),
        -1,
        false
      )
    );
  }, [delay, translateY]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View
      style={[
        {
          width: DOT_SIZE,
          height: DOT_SIZE,
          borderRadius: DOT_SIZE / 2,
          backgroundColor: "#6B7280",
        },
        animatedStyle,
      ]}
    />
  );
}

export function TypingIndicator() {
  return (
    <View className="mb-3 max-w-[85%] self-start">
      <View className="flex-row items-center">
        <View
          className="rounded-2xl px-4 py-3 bg-white"
          style={{
            shadowColor: "#1B2A4A",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.08,
            shadowRadius: 3,
            elevation: 2,
          }}
        >
          <View className="flex-row items-center gap-1.5">
            <BouncingDot delay={0} />
            <BouncingDot delay={150} />
            <BouncingDot delay={300} />
          </View>
        </View>
      </View>
    </View>
  );
}
