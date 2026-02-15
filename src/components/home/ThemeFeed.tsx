import { View, FlatList, Text, Pressable } from "react-native";
import Animated, {
  FadeInDown,
  useReducedMotion,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import DistrictBlockCard from "../ui/DistrictBlockCard";
import type { Theme } from "../../data/schema";

interface ThemeFeedProps {
  themes: Theme[];
  onThemePress: (themeId: string) => void;
}

const THEME_COLORS = [
  "#1B2A4A", "#E8553A", "#16A34A", "#D97706", "#6B7280",
  "#1B2A4A", "#E8553A", "#16A34A", "#D97706", "#6B7280",
];

function ThemeFeedItem({
  item,
  index,
  reduceMotion,
  onPress,
}: {
  item: Theme;
  index: number;
  reduceMotion: boolean;
  onPress: (id: string) => void;
}) {
  const scale = useSharedValue(1);
  const pressStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      entering={reduceMotion ? undefined : FadeInDown.delay(index * 50).duration(400)}
    >
      <Animated.View style={reduceMotion ? undefined : pressStyle}>
        <DistrictBlockCard clipCorner="top-right" className="bg-warm-gray" style={{ width: 160 }}>
          <View
            style={{ height: 4, backgroundColor: THEME_COLORS[index % THEME_COLORS.length] }}
          />
          <Pressable
            onPress={() => onPress(item.id)}
            onPressIn={() => {
              if (!reduceMotion) scale.value = withTiming(0.97, { duration: 100 });
            }}
            onPressOut={() => {
              if (!reduceMotion) scale.value = withTiming(1, { duration: 150 });
            }}
            className="px-4 py-3"
            style={{ minHeight: 48 }}
            accessibilityRole="button"
            accessibilityLabel={item.name}
          >
            <Text className="text-lg mb-1">{item.icon}</Text>
            <Text className="font-display-medium text-[15px] text-civic-navy">
              {item.name}
            </Text>
          </Pressable>
        </DistrictBlockCard>
      </Animated.View>
    </Animated.View>
  );
}

export function ThemeFeed({ themes, onThemePress }: ThemeFeedProps) {
  const { t } = useTranslation("home");
  const reduceMotion = useReducedMotion();

  if (themes.length === 0) return null;

  return (
    <View>
      <Text className="font-display-semibold text-xl text-civic-navy px-4 mb-3">
        {t("themeSectionTitle")}
      </Text>
      <FlatList
        data={themes}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
        renderItem={({ item, index }) => (
          <ThemeFeedItem
            item={item}
            index={index}
            reduceMotion={reduceMotion}
            onPress={onThemePress}
          />
        )}
      />
    </View>
  );
}
