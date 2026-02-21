import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import type { Position, Theme } from "../../data/schema";
import { SourceReference } from "../shared/SourceReference";

interface Props {
  position: Position;
  theme?: Theme;
  partyColor?: string;
  onAskInChat?: (position: Position) => void;
}

export function PositionCard({ position, theme, partyColor, onAskInChat }: Props) {
  const { t } = useTranslation("candidates");
  const [showDetails, setShowDetails] = useState(false);
  const barColor = partyColor || "#9CA3AF";

  return (
    <View
      className="rounded-lg p-3 mb-2"
      style={{
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.04)",
        borderLeftWidth: 3,
        borderLeftColor: barColor,
        backgroundColor: "#F9FAFB",
      }}
    >
      {theme && (
        <Text className="font-body-medium text-xs text-accent-coral-dark mb-1">
          {theme.name}
        </Text>
      )}
      <Text className="font-body text-sm text-text-body">{position.summary}</Text>

      <Pressable
        onPress={() => setShowDetails(!showDetails)}
        accessibilityRole="button"
        accessibilityLabel={showDetails ? t("hideDetails") : t("details")}
        className="mt-2 flex-row items-center justify-end gap-1"
        style={{ minHeight: 44 }}
      >
        <Text className="font-body-medium text-sm text-civic-navy">
          {showDetails ? "Masquer" : "Détails"}
        </Text>
        <Ionicons
          name={showDetails ? "chevron-up" : "chevron-down"}
          size={14}
          color="#1B2A4A"
        />
      </Pressable>

      {showDetails && (
        <Animated.View entering={FadeIn.duration(200)} exiting={FadeOut.duration(150)} className="mt-2">
          <Text className="font-body text-sm text-text-body mb-2">
            {position.details}
          </Text>
          <View className="border-t border-warm-white pt-2">
            {position.sources.map((source, index) => (
              <SourceReference key={index} source={source} />
            ))}
          </View>
        </Animated.View>
      )}

      {onAskInChat && (
        <Pressable
          onPress={() => onAskInChat(position)}
          accessibilityRole="button"
          accessibilityLabel={t("askAbout")}
          className="mt-2"
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text className="font-body-medium text-sm text-accent-coral-dark">
            {t("askAbout")}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
