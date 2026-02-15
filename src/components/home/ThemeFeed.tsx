import { View, FlatList, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import type { Theme } from "../../data/schema";

interface ThemeFeedProps {
  themes: Theme[];
  onThemePress: (themeId: string) => void;
}

export function ThemeFeed({ themes, onThemePress }: ThemeFeedProps) {
  const { t } = useTranslation("home");

  if (themes.length === 0) return null;

  return (
    <View>
      <Text className="text-base font-semibold text-gray-900 px-4 mb-2">
        {t("themeSectionTitle")}
      </Text>
      <FlatList
      data={themes}
      keyExtractor={(item) => item.id}
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      renderItem={({ item }) => (
        <Pressable
          onPress={() => onThemePress(item.id)}
          className="bg-gray-100 rounded-full px-4 py-2"
          style={{ minHeight: 40 }}
          accessibilityRole="button"
          accessibilityLabel={item.name}
        >
          <Text className="text-sm font-medium text-gray-700">
            {item.icon} {item.name}
          </Text>
        </Pressable>
      )}
    />
    </View>
  );
}
