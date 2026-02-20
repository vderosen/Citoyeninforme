import { View, Text, Pressable as RNPressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { AssistantMode } from "../../stores/assistant";

interface ModeSelectorProps {
  activeMode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
}

const MODES: {
  id: AssistantMode;
  labelKey: string;
  shortLabelKey: string;
  descriptionKey: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: "comprendre",
    labelKey: "comprendreMode",
    shortLabelKey: "comprendreModeShort",
    descriptionKey: "comprendreModeDescription",
    icon: "book-outline",
  },
  {
    id: "parler",
    labelKey: "parlerMode",
    shortLabelKey: "parlerModeShort",
    descriptionKey: "parlerModeDescription",
    icon: "chatbubble-ellipses-outline",
  },
  {
    id: "debattre",
    labelKey: "debattreMode",
    shortLabelKey: "debattreModeShort",
    descriptionKey: "debattreModeDescription",
    icon: "scale-outline",
  },
];

export function ModeSelector({ activeMode, onModeChange }: ModeSelectorProps) {
  const { t } = useTranslation("assistant");
  const activeModeData = MODES.find((mode) => mode.id === activeMode) ?? MODES[0];

  return (
    <View className="mx-4">
      <View
        className="flex-row gap-1 rounded-2xl border border-civic-navy-light bg-warm-gray p-1"
        accessibilityRole="tablist"
      >
        {MODES.map((mode) => {
          const isActive = activeMode === mode.id;
          return (
            <RNPressable
              key={mode.id}
              onPress={() => onModeChange(mode.id)}
              className={`flex-1 flex-row items-center justify-center gap-1 rounded-xl border px-2 py-2.5 ${
                isActive
                  ? "bg-civic-navy border-civic-navy"
                  : "bg-warm-white border-civic-navy-light"
              }`}
              style={{ minHeight: 44 }}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
              accessibilityLabel={t(mode.labelKey)}
            >
              <Ionicons
                name={mode.icon}
                size={16}
                color={isActive ? "#FAFAF8" : "#6B7280"}
              />
              <Text
                className={`text-sm font-body-medium text-center ${
                  isActive ? "text-text-inverse" : "text-civic-navy"
                }`}
                numberOfLines={1}
              >
                {t(mode.shortLabelKey)}
              </Text>
            </RNPressable>
          );
        })}
      </View>

      <Text className="px-1 pt-2 text-xs font-body text-text-caption">
        {t(activeModeData.descriptionKey)}
      </Text>
    </View>
  );
}
