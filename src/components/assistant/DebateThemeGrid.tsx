import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { PressableScale } from "../ui/PressableScale";
import type { Theme } from "../../data/schema";

interface DebateThemeGridProps {
  themes: Theme[];
  onSelectTheme: (themeId: string) => void;
}

export function DebateThemeGrid({
  themes,
  onSelectTheme,
}: DebateThemeGridProps) {
  const { t } = useTranslation("assistant");

  return (
    <View className="flex-1 px-4 pt-6">
      <Text className="font-display-medium text-lg text-civic-navy text-center mb-6">
        {t("debateThemeGridTitle")}
      </Text>

      <View className="flex-row flex-wrap">
        {themes.map((theme) => (
          <View key={theme.id} className="w-1/2 p-1.5">
            <PressableScale
              onPress={() => onSelectTheme(theme.id)}
              className="bg-warm-white border border-warm-gray rounded-2xl py-4 items-center gap-1"
              accessibilityRole="button"
              accessibilityLabel={theme.name}
            >
              <Text style={{ fontSize: 32 }}>{theme.icon}</Text>
              <Text
                className="font-body text-xs text-text-caption text-center"
                numberOfLines={1}
              >
                {theme.name}
              </Text>
            </PressableScale>
          </View>
        ))}
      </View>
    </View>
  );
}
