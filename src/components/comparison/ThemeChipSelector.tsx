import { Text, ScrollView } from "react-native";
import type { Theme } from "../../data/schema";
import { PressableScale } from "../ui/PressableScale";

interface ThemeChipSelectorProps {
  themes: Theme[];
  selectedThemeId: string;
  onSelectTheme: (themeId: string) => void;
}

export function ThemeChipSelector({
  themes,
  selectedThemeId,
  onSelectTheme,
}: ThemeChipSelectorProps) {
  const sortedThemes = [...themes].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 16, paddingVertical: 8 }}
    >
      {sortedThemes.map((theme) => {
        const isSelected = theme.id === selectedThemeId;
        return (
          <PressableScale
            key={theme.id}
            onPress={() => onSelectTheme(theme.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={theme.name}
            className={`rounded-full px-4 py-2 ${
              isSelected ? "bg-civic-navy" : "bg-warm-gray"
            }`}
            style={{ minHeight: 44 }}
          >
            <Text
              className={`font-body-medium text-sm ${
                isSelected ? "text-text-inverse" : "text-civic-navy"
              }`}
            >
              {theme.name}
            </Text>
          </PressableScale>
        );
      })}
    </ScrollView>
  );
}
