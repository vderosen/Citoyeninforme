import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type { Position, Theme } from "../../data/schema";
import { TrustBadge } from "../shared/TrustBadge";
import { SourceReference } from "../shared/SourceReference";

interface Props {
  position: Position;
  theme?: Theme;
  onAskInChat?: (position: Position) => void;
}

export function PositionCard({ position, theme, onAskInChat }: Props) {
  const { t } = useTranslation("candidates");
  const [showDetails, setShowDetails] = useState(false);

  return (
    <View className="bg-warm-gray rounded-lg p-3 mb-2">
      {theme && (
        <Text className="font-body-medium text-xs text-accent-coral-dark mb-1">
          {theme.name}
        </Text>
      )}
      <Text className="font-body text-sm text-text-body">{position.summary}</Text>

      <View className="flex-row flex-wrap gap-1 mt-2">
        {position.sources.map((source, index) => (
          <TrustBadge
            key={index}
            variant="source"
            source={source}
            onPress={() => {}}
          />
        ))}
      </View>

      <Pressable
        onPress={() => setShowDetails(!showDetails)}
        accessibilityRole="button"
        accessibilityLabel={showDetails ? t("hideDetails") : t("details")}
        className="mt-2 flex-row items-center gap-1"
        style={{ minHeight: 44, justifyContent: "center" }}
      >
        <Ionicons
          name={showDetails ? "chevron-up" : "chevron-down"}
          size={14}
          color="#1B2A4A"
        />
        <Text className="font-body-medium text-sm text-civic-navy">
          {showDetails ? "Masquer" : "Détails"}
        </Text>
      </Pressable>

      {showDetails && (
        <View className="mt-2">
          <Text className="font-body text-sm text-text-body mb-2">
            {position.details}
          </Text>
          <View className="border-t border-warm-white pt-2">
            {position.sources.map((source, index) => (
              <SourceReference key={index} source={source} />
            ))}
          </View>
        </View>
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
