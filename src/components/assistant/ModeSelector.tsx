import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import type { AssistantMode } from "../../stores/assistant";

interface ModeSelectorProps {
  activeMode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
}

const MODES: { id: AssistantMode; labelKey: string }[] = [
  { id: "comprendre", labelKey: "comprendreMode" },
  { id: "parler", labelKey: "parlerMode" },
  { id: "debattre", labelKey: "debattreMode" },
];

export function ModeSelector({ activeMode, onModeChange }: ModeSelectorProps) {
  const { t } = useTranslation("assistant");

  return (
    <View
      className="flex-row bg-gray-100 rounded-xl mx-4 p-1"
      accessibilityRole="tablist"
    >
      {MODES.map((mode) => (
        <Pressable
          key={mode.id}
          onPress={() => onModeChange(mode.id)}
          className={`flex-1 py-2 px-2 rounded-lg items-center ${
            activeMode === mode.id ? "bg-white border border-blue-100" : ""
          }`}
          style={{ minHeight: 40 }}
          accessibilityRole="tab"
          accessibilityState={{ selected: activeMode === mode.id }}
          accessibilityLabel={t(mode.labelKey)}
        >
          <Text
            className={`text-xs font-medium text-center ${
              activeMode === mode.id ? "text-blue-600" : "text-gray-600"
            }`}
            numberOfLines={1}
          >
            {t(mode.labelKey)}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}
