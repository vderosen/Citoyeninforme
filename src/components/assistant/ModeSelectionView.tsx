import { View, Text, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { PressableScale } from "../ui/PressableScale";
import type { AssistantMode } from "../../stores/assistant";

interface ModeSelectionViewProps {
  onModeSelect: (mode: AssistantMode) => void;
}

const MODES: {
  id: AssistantMode;
  labelKey: string;
  descriptionKey: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  {
    id: "comprendre",
    labelKey: "comprendreMode",
    descriptionKey: "comprendreModeDescription",
    icon: "book-outline",
  },
  {
    id: "parler",
    labelKey: "parlerMode",
    descriptionKey: "parlerModeDescription",
    icon: "chatbubble-ellipses-outline",
  },
  {
    id: "debattre",
    labelKey: "debattreMode",
    descriptionKey: "debattreModeDescription",
    icon: "flash-outline",
  },
];

export function ModeSelectionView({ onModeSelect }: ModeSelectionViewProps) {
  const { t } = useTranslation("assistant");

  return (
    <ScrollView
      className="flex-1"
      contentContainerClassName="px-4 pt-6 pb-8"
    >
      <Text className="font-display-medium text-xl text-civic-navy text-center mb-6">
        {t("selectMode")}
      </Text>

      <View style={{ gap: 12 }}>
        {MODES.map((mode) => (
          <PressableScale
            key={mode.id}
            onPress={() => onModeSelect(mode.id)}
            accessibilityRole="button"
            accessibilityLabel={t(mode.labelKey)}
            className="flex-row items-center rounded-2xl border border-civic-navy-light/50 bg-white px-4 py-4"
            style={{
              minHeight: 88,
              shadowColor: "#1B2A4A",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 6,
              elevation: 3,
            }}
          >
            <View
              className="items-center justify-center rounded-full bg-civic-navy"
              style={{ width: 44, height: 44 }}
            >
              <Ionicons name={mode.icon} size={22} color="#FAFAF8" />
            </View>

            <View className="ml-4 flex-1">
              <Text className="font-display-medium text-base text-civic-navy">
                {t(mode.labelKey)}
              </Text>
              <Text className="font-body text-sm text-text-caption mt-0.5" numberOfLines={2}>
                {t(mode.descriptionKey)}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </PressableScale>
        ))}
      </View>
    </ScrollView>
  );
}
