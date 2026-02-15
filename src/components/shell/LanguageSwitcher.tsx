import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

const LANGUAGES = ["fr", "en"] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  return (
    <View className="flex-row items-center gap-1 mr-3">
      {LANGUAGES.map((lang, index) => {
        const isActive = currentLang.startsWith(lang);
        return (
          <View key={lang} className="flex-row items-center">
            {index > 0 && (
              <Text className="font-body text-xs text-text-inverse opacity-40 mx-0.5">/</Text>
            )}
            <Pressable
              onPress={() => i18n.changeLanguage(lang)}
              accessibilityRole="button"
              accessibilityLabel={lang === "fr" ? "Français" : "English"}
              accessibilityState={{ selected: isActive }}
              style={{ minWidth: 28, minHeight: 28, justifyContent: "center", alignItems: "center" }}
            >
              <Text
                className={`font-body-medium text-xs uppercase ${
                  isActive
                    ? "text-accent-coral"
                    : "text-text-inverse opacity-60"
                }`}
              >
                {lang.toUpperCase()}
              </Text>
            </Pressable>
          </View>
        );
      })}
    </View>
  );
}
