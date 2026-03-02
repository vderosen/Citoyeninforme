import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type { Candidate, Position, Theme } from "../../data/schema";
import { PositionCard } from "./PositionCard";
import { ThemeTabBar } from "./ThemeTabBar";
import { getCandidateImageSource } from "../../utils/candidateImageSource";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";
import { getCandidatePartyLogo } from "../../utils/candidatePartyLogo";

interface CandidateProfileCardProps {
  candidate: Candidate;
  positions: Position[];
  themes: Theme[];
  onOpenAssistant: () => void;
}

export function CandidateProfileCard({
  candidate,
  positions,
  themes,
  onOpenAssistant,
}: CandidateProfileCardProps) {
  const { t } = useTranslation(["candidates", "common"]);
  const [activeThemeId, setActiveThemeId] = useState(themes[0]?.id ?? "");
  const imageSource = getCandidateImageSource(candidate);
  const partyColor = getCandidatePartyColor(candidate.id);
  const partyLogo = getCandidatePartyLogo(candidate.id);

  const activePosition = positions.find((p) => p.themeId === activeThemeId);

  return (
    <View className="pb-6">
      {/* Header — avatar + name/party row, then bio full-width below */}
      <View
        style={{ backgroundColor: partyColor + "14" }}
        className="px-4 pt-4 pb-3"
      >
        <View className="flex-row items-center">
          {imageSource ? (
            <Image
              source={imageSource}
              className="rounded-full bg-warm-gray"
              style={{ width: 64, height: 64 }}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View
              className="rounded-full bg-warm-gray items-center justify-center"
              style={{ width: 64, height: 64 }}
            >
              <Text className="text-2xl">👤</Text>
            </View>
          )}
          <View className="flex-1 ml-3">
            <Text className="font-display-bold text-lg text-civic-navy">
              {candidate.name}
            </Text>
            <View className="flex-row items-center mt-0.5">
              {partyLogo && (
                <Image
                  source={partyLogo}
                  style={{ width: 20, height: 20, marginRight: 6 }}
                  resizeMode="contain"
                />
              )}
              <View
                className="rounded-full px-3 py-0.5 self-start"
                style={{ backgroundColor: partyColor + "1A" }}
              >
                <Text className="font-body-medium text-xs" style={{ color: partyColor }}>
                  {candidate.party}
                </Text>
              </View>
            </View>
          </View>
        </View>
        {candidate.bio ? (
          <Text
            className="font-body text-xs text-text-body leading-relaxed mt-2"
            numberOfLines={3}
          >
            {candidate.bio}
          </Text>
        ) : null}
      </View>

      {/* Divider */}
      <View className="border-t border-warm-gray mx-4" />

      {/* Positions by theme — tab bar */}
      <View className="py-5">
        <Text className="font-display-semibold text-base text-civic-navy mb-2 px-4">
          {t("candidates:positionsByTheme")}
        </Text>

        <ThemeTabBar
          themes={themes}
          activeThemeId={activeThemeId}
          onSelectTheme={setActiveThemeId}
        />

        {/* Position content */}
        <View className="px-4 mt-3">
          {activePosition ? (
            <PositionCard position={activePosition} partyColor={partyColor} />
          ) : (
            <View className="bg-warm-gray rounded-lg p-3">
              <Text className="font-body text-sm text-text-caption italic">
                {t("candidates:noPositionDocumented")}
              </Text>
              <Text className="font-body text-xs text-text-caption mt-1">
                {t("candidates:noPositionNote")}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Divider */}
      <View className="border-t border-warm-gray mx-4" />

      {/* Action button — outlined, centered */}
      <View className="px-4 pt-5 pb-4 items-center">
        <Pressable
          onPress={onOpenAssistant}
          className="rounded-xl py-3 px-8 flex-row items-center justify-center"
          style={{
            minHeight: 48,
            borderWidth: 1.5,
            borderColor: "#1B2A4A",
          }}
          accessibilityRole="button"
          accessibilityLabel={t("candidates:openAssistant")}
        >
          <Ionicons name="chatbubble-outline" size={18} color="#1B2A4A" style={{ marginRight: 8 }} />
          <Text className="font-display-medium text-sm text-civic-navy">
            {t("candidates:openAssistant")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
