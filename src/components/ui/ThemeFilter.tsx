import { ScrollView, Pressable, Text } from "react-native";
import { useTranslation } from "react-i18next";
import type { Theme } from "../../data/schema";

interface Props {
  themes: Theme[];
  selectedThemeId: string | null;
  onSelectTheme: (themeId: string | null) => void;
}

export function ThemeFilter({ themes, selectedThemeId, onSelectTheme }: Props) {
  const { t } = useTranslation("learn");

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-2"
      accessibilityRole="tablist"
    >
      <Pressable
        onPress={() => onSelectTheme(null)}
        accessibilityRole="tab"
        accessibilityState={{ selected: selectedThemeId === null }}
        className={`px-4 py-2 mr-2 rounded-full ${
          selectedThemeId === null
            ? "bg-blue-600"
            : "bg-gray-200"
        }`}
        style={{ minHeight: 44, justifyContent: "center" }}
      >
        <Text
          className={`text-sm font-medium ${
            selectedThemeId === null ? "text-white" : "text-gray-700"
          }`}
        >
          {t("allThemes")}
        </Text>
      </Pressable>
      {themes.map((theme) => (
        <Pressable
          key={theme.id}
          onPress={() => onSelectTheme(theme.id)}
          accessibilityRole="tab"
          accessibilityState={{ selected: selectedThemeId === theme.id }}
          className={`px-4 py-2 mr-2 rounded-full ${
            selectedThemeId === theme.id
              ? "bg-blue-600"
              : "bg-gray-200"
          }`}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text
            className={`text-sm font-medium ${
              selectedThemeId === theme.id
                ? "text-white"
                : "text-gray-700"
            }`}
          >
            {theme.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
