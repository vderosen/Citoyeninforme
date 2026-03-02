import { ScrollView, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import type { Theme } from "../../data/schema";
import { AppText as Text } from "../ui/AppText";

interface Props {
  themes: Theme[];
  selectedThemeId: string | null;
  onSelectTheme: (themeId: string | null) => void;
}

export function ThemeFilter({ themes, selectedThemeId, onSelectTheme }: Props) {
  const { t } = useTranslation("candidates");

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="py-2"
      contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      accessibilityRole="tablist"
    >
      <Pressable
        onPress={() => onSelectTheme(null)}
        accessibilityRole="tab"
        accessibilityState={{ selected: selectedThemeId === null }}
        className={`px-4 py-2 rounded-full ${
          selectedThemeId === null ? "bg-civic-navy" : "bg-warm-gray"
        }`}
        style={{ minHeight: 44, justifyContent: "center" }}
        hitSlop={8}
      >
        <Text
          className={`font-body-medium text-sm ${
            selectedThemeId === null ? "text-text-inverse" : "text-civic-navy"
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
          className={`px-4 py-2 rounded-full ${
            selectedThemeId === theme.id ? "bg-civic-navy" : "bg-warm-gray"
          }`}
          style={{ minHeight: 44, justifyContent: "center" }}
          hitSlop={8}
        >
          <Text
            className={`font-body-medium text-sm ${
              selectedThemeId === theme.id ? "text-text-inverse" : "text-civic-navy"
            }`}
          >
            {theme.icon} {theme.name}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
