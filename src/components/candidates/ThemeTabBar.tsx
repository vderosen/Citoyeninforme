import { useCallback, useRef, useState } from "react";
import { ScrollView, Pressable, Text, View, type LayoutChangeEvent } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useReducedMotion,
} from "react-native-reanimated";
import type { Theme } from "../../data/schema";

interface Props {
  themes: Theme[];
  activeThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

interface TabLayout {
  x: number;
  width: number;
}

const ANIMATION_DURATION = 250;

function firstWord(name: string): string {
  return name.split(/\s+/)[0] || name;
}

export function ThemeTabBar({ themes, activeThemeId, onSelectTheme }: Props) {
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<ScrollView>(null);
  const tabLayouts = useRef<Map<string, TabLayout>>(new Map());

  const indicatorX = useSharedValue(0);
  const indicatorWidth = useSharedValue(0);
  const [initialized, setInitialized] = useState(false);

  const handleTabLayout = useCallback(
    (themeId: string, event: LayoutChangeEvent) => {
      const { x, width } = event.nativeEvent.layout;
      tabLayouts.current.set(themeId, { x, width });

      if (themeId === activeThemeId) {
        if (!initialized) {
          indicatorX.value = x;
          indicatorWidth.value = width;
          setInitialized(true);
        } else {
          const duration = reduceMotion ? 0 : ANIMATION_DURATION;
          indicatorX.value = withTiming(x, { duration });
          indicatorWidth.value = withTiming(width, { duration });
        }
      }
    },
    [activeThemeId, initialized, reduceMotion, indicatorX, indicatorWidth],
  );

  const handleSelectTheme = useCallback(
    (themeId: string) => {
      onSelectTheme(themeId);
      const layout = tabLayouts.current.get(themeId);
      if (layout) {
        const duration = reduceMotion ? 0 : ANIMATION_DURATION;
        indicatorX.value = withTiming(layout.x, { duration });
        indicatorWidth.value = withTiming(layout.width, { duration });

        // Scroll to make the selected tab visible
        scrollRef.current?.scrollTo({ x: Math.max(0, layout.x - 40), animated: !reduceMotion });
      }
    },
    [onSelectTheme, reduceMotion, indicatorX, indicatorWidth],
  );

  const indicatorStyle = useAnimatedStyle(() => ({
    position: "absolute" as const,
    bottom: 0,
    left: indicatorX.value,
    width: indicatorWidth.value,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "#1B2A4A",
  }));

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 12 }}
    >
      <View style={{ flexDirection: "row", position: "relative", paddingBottom: 4 }}>
        {themes.map((theme) => {
          const isActive = theme.id === activeThemeId;
          return (
            <Pressable
              key={theme.id}
              onPress={() => handleSelectTheme(theme.id)}
              onLayout={(e) => handleTabLayout(theme.id, e)}
              style={{
                paddingHorizontal: 10,
                paddingTop: 6,
                paddingBottom: 14,
                minHeight: 44,
                alignItems: "center",
                justifyContent: "center",
                opacity: isActive ? 1 : 0.45,
              }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={theme.name}
            >
              <Text style={{ fontSize: 22 }}>{theme.icon}</Text>
              <Text
                style={{
                  fontSize: 10,
                  marginTop: 2,
                  color: "#1B2A4A",
                  fontWeight: isActive ? "600" : "400",
                }}
                numberOfLines={1}
              >
                {firstWord(theme.name)}
              </Text>
            </Pressable>
          );
        })}
        {initialized && <Animated.View style={indicatorStyle} />}
      </View>
    </ScrollView>
  );
}
