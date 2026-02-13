import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import type { Position, Theme } from "../../data/schema";
import { SourceReference } from "../ui/SourceReference";

interface Props {
  position: Position;
  theme?: Theme;
  onAskInChat?: (position: Position) => void;
}

export function PositionCard({ position, theme, onAskInChat }: Props) {
  const { t } = useTranslation("learn");
  const [showDetails, setShowDetails] = useState(false);

  return (
    <View className="bg-gray-50 rounded-lg p-3 mb-2">
      {theme && (
        <Text className="text-xs font-medium text-blue-600 mb-1">
          {theme.name}
        </Text>
      )}
      <Text className="text-sm text-gray-800">{position.summary}</Text>

      <Pressable
        onPress={() => setShowDetails(!showDetails)}
        accessibilityRole="button"
        accessibilityLabel={showDetails ? t("hideDetails") : t("details")}
        className="mt-2"
        style={{ minHeight: 44, justifyContent: "center" }}
      >
        <Text className="text-sm text-blue-600 font-medium">
          {showDetails ? t("hideDetails") : t("details")}
        </Text>
      </Pressable>

      {showDetails && (
        <View className="mt-2">
          <Text className="text-sm text-gray-700 mb-2">
            {position.details}
          </Text>
          <View className="border-t border-gray-200 pt-2">
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
          accessibilityLabel={t("askInChat")}
          className="mt-2"
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <Text className="text-sm text-purple-600 font-medium">
            {t("askInChat")}
          </Text>
        </Pressable>
      )}
    </View>
  );
}
