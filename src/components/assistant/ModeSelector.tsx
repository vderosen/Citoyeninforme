import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { AssistantMode } from "../../stores/assistant";

interface ModeSelectorProps {
  activeMode: AssistantMode;
  onModeChange: (mode: AssistantMode) => void;
}

const MODES: { id: AssistantMode; labelKey: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { id: "comprendre", labelKey: "comprendreMode", icon: "book-outline" },
  { id: "parler", labelKey: "parlerMode", icon: "chatbubble-ellipses-outline" },
  { id: "debattre", labelKey: "debattreMode", icon: "scale-outline" },
];

export function ModeSelector({ activeMode, onModeChange }: ModeSelectorProps) {
  const { t } = useTranslation("assistant");

  return (
    <View
      className="flex-row bg-warm-gray rounded-xl mx-4 p-1"
      accessibilityRole="tablist"
    >
      {MODES.map((mode) => {
        const isActive = activeMode === mode.id;
        return (
          <Pressable
            key={mode.id}
            onPress={() => onModeChange(mode.id)}
            className={`flex-1 flex-row items-center justify-center gap-1 py-2 px-2 rounded-lg ${
              isActive ? "bg-warm-white border border-accent-coral-light" : ""
            }`}
            style={{ minHeight: 40 }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            accessibilityLabel={t(mode.labelKey)}
          >
            <Ionicons
              name={mode.icon}
              size={16}
              color={isActive ? "#1B2A4A" : "#6B7280"}
            />
            <Text
              className={`text-sm font-body-medium text-center ${
                isActive ? "text-civic-navy" : "text-text-caption"
              }`}
            >
              {t(mode.labelKey)}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
