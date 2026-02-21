import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { SwipeDirection } from "../../data/schema";

interface SwipeButtonsProps {
  onButtonPress: (direction: SwipeDirection) => void;
  disabled?: boolean;
}

const GRID_BUTTONS: {
  direction: SwipeDirection;
  i18nKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}[] = [
  {
    direction: "disagree",
    i18nKey: "swipeDisagree",
    icon: "close-circle",
    color: "#ef4444",
    bgColor: "bg-red-50",
  },
  {
    direction: "agree",
    i18nKey: "swipeAgree",
    icon: "checkmark-circle",
    color: "#22c55e",
    bgColor: "bg-green-50",
  },
  {
    direction: "strongly_disagree",
    i18nKey: "swipeStronglyDisagree",
    icon: "flash",
    color: "#374151",
    bgColor: "bg-gray-100",
  },
  {
    direction: "strongly_agree",
    i18nKey: "swipeStronglyAgree",
    icon: "heart",
    color: "#f59e0b",
    bgColor: "bg-amber-50",
  },
];

export function SwipeButtons({ onButtonPress, disabled }: SwipeButtonsProps) {
  const { t } = useTranslation("survey");

  return (
    <View className="px-4 py-3">
      {/* 2×2 grid */}
      <View className="flex-row gap-3 mb-2">
        {GRID_BUTTONS.slice(0, 2).map((btn) => (
          <Pressable
            key={btn.direction}
            onPress={() => onButtonPress(btn.direction)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={t(btn.i18nKey)}
            className={`${btn.bgColor} rounded-xl px-3 py-2 flex-row items-center gap-2 flex-1`}
            style={{ minHeight: 48, opacity: disabled ? 0.5 : 1 }}
          >
            <Ionicons name={btn.icon} size={22} color={btn.color} />
            <Text
              className="font-body text-xs"
              style={{ color: btn.color }}
            >
              {t(btn.i18nKey)}
            </Text>
          </Pressable>
        ))}
      </View>
      <View className="flex-row gap-3 mb-3">
        {GRID_BUTTONS.slice(2, 4).map((btn) => (
          <Pressable
            key={btn.direction}
            onPress={() => onButtonPress(btn.direction)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={t(btn.i18nKey)}
            className={`${btn.bgColor} rounded-xl px-3 py-2 flex-row items-center gap-2 flex-1`}
            style={{ minHeight: 48, opacity: disabled ? 0.5 : 1 }}
          >
            <Ionicons name={btn.icon} size={22} color={btn.color} />
            <Text
              className="font-body text-xs"
              style={{ color: btn.color }}
            >
              {t(btn.i18nKey)}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* "Pas d'avis" as a discrete text link */}
      <Pressable
        onPress={() => onButtonPress("skip")}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={t("swipeSkip")}
        style={{ minHeight: 48, opacity: disabled ? 0.5 : 1 }}
        className="items-center justify-center"
      >
        <Text className="font-body text-xs text-text-caption underline">
          {t("swipeSkip")}
        </Text>
      </Pressable>
    </View>
  );
}
