import { View, Text, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

interface ComparisonBottomBarProps {
  selectedCount: number;
  themeName: string;
  isEnabled: boolean;
  onCompare: () => void;
}

export function ComparisonBottomBar({
  selectedCount,
  themeName,
  isEnabled,
  onCompare,
}: ComparisonBottomBarProps) {
  const { t } = useTranslation("comparison");
  const insets = useSafeAreaInsets();

  return (
    <View
      className="absolute bottom-0 left-0 right-0 bg-warm-white border-t border-warm-gray px-4 pt-3"
      style={{ paddingBottom: insets.bottom + 12 }}
    >
      <Text
        className={`font-body-medium text-sm text-center mb-2 ${
          isEnabled ? "text-text-body" : "text-text-caption"
        }`}
      >
        {isEnabled
          ? t("summaryText", { count: selectedCount, theme: themeName })
          : t("selectMinimum")}
      </Text>
      <Pressable
        onPress={onCompare}
        disabled={!isEnabled}
        accessibilityRole="button"
        accessibilityState={{ disabled: !isEnabled }}
        accessibilityLabel={t("compareCta")}
        className="bg-accent-coral rounded-xl items-center justify-center"
        style={{
          minHeight: 48,
          paddingVertical: 12,
          opacity: isEnabled ? 1 : 0.5,
        }}
      >
        <Text className="font-display-medium text-base text-text-inverse">
          {t("compareCta")}
        </Text>
      </Pressable>
    </View>
  );
}
