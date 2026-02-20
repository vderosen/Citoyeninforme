import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import type { Theme } from "../../data/schema";
import { PressableScale } from "../ui/PressableScale";

interface ThemeChipSelectorProps {
  themes: Theme[];
  selectedThemeId: string | null;
  onSelectTheme: (themeId: string | null) => void;
}

export function ThemeChipSelector({
  themes,
  selectedThemeId,
  onSelectTheme,
}: ThemeChipSelectorProps) {
  const { t } = useTranslation("comparison");
  const sortedThemes = [...themes].sort(
    (a, b) => a.displayOrder - b.displayOrder
  );

  const allChips: { id: string | null; label: string }[] = [
    { id: null, label: t("allThemes") },
    ...sortedThemes.map((theme) => ({ id: theme.id, label: theme.name })),
  ];

  return (
    <View className="flex-row flex-wrap gap-2">
      {allChips.map((chip) => {
        const isSelected = chip.id === selectedThemeId;
        return (
          <PressableScale
            key={chip.id ?? "all"}
            onPress={() => onSelectTheme(chip.id)}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={chip.label}
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
              {chip.label}
            </Text>
          </PressableScale>
        );
      })}
    </View>
  );
}
