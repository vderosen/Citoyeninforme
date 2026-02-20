import { useState } from "react";
import { View, Text, Image, Pressable, Modal } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type { Candidate, Position, Theme } from "../../data/schema";
import { PositionCard } from "./PositionCard";
import { ThemeTabBar } from "./ThemeTabBar";
import { FeedbackAction } from "../shared/FeedbackAction";
import { getCandidateImageSource } from "../../utils/candidateImageSource";

interface CandidateProfileCardProps {
  candidate: Candidate;
  positions: Position[];
  themes: Theme[];
  onDebate: () => void;
}

export function CandidateProfileCard({
  candidate,
  positions,
  themes,
  onDebate,
}: CandidateProfileCardProps) {
  const { t } = useTranslation(["candidates", "common"]);
  const [activeThemeId, setActiveThemeId] = useState(themes[0]?.id ?? "");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const imageSource = getCandidateImageSource(candidate);

  const activePosition = positions.find((p) => p.themeId === activeThemeId);
  const activeTheme = themes.find((th) => th.id === activeThemeId);

  return (
    <View className="pb-6">
      {/* Header with party color bar */}
      <View
        style={{
          height: 6,
          backgroundColor: candidate.partyColor || "#9CA3AF",
        }}
      />
      <View className="items-center px-4 pt-6 pb-4">
        {/* Flag icon top-right */}
        <Pressable
          onPress={() => setFeedbackOpen(true)}
          style={{ position: "absolute", top: 12, right: 12, minHeight: 44, minWidth: 44, alignItems: "center", justifyContent: "center" }}
          accessibilityRole="button"
          accessibilityLabel={t("common:feedbackSignal")}
        >
          <Ionicons name="flag-outline" size={20} color="#9CA3AF" />
        </Pressable>

        {imageSource ? (
          <Image
            source={imageSource}
            className="w-24 h-24 rounded-xl bg-warm-gray"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="w-24 h-24 rounded-xl bg-warm-gray items-center justify-center">
            <Text className="text-4xl">👤</Text>
          </View>
        )}
        <Text className="font-display-bold text-xl text-civic-navy mt-3">
          {candidate.name}
        </Text>
        <Text className="font-body text-sm text-text-caption">{candidate.party}</Text>
      </View>

      {/* En bref */}
      <View className="px-4 pb-4">
        <Text className="font-display-semibold text-base text-civic-navy mb-1">
          {t("candidates:enBref")}
        </Text>
        <Text className="font-body text-sm text-text-body leading-relaxed">{candidate.bio}</Text>
      </View>

      {/* Positions by theme — tab bar */}
      <View className="pb-4">
        <Text className="font-display-semibold text-base text-civic-navy mb-2 px-4">
          {t("candidates:positionsByTheme")}
        </Text>

        <ThemeTabBar
          themes={themes}
          activeThemeId={activeThemeId}
          onSelectTheme={setActiveThemeId}
        />

        {/* Active theme name */}
        {activeTheme && (
          <Text className="font-body-medium text-sm text-civic-navy px-4 mt-3 mb-1">
            {activeTheme.icon} {activeTheme.name}
          </Text>
        )}

        {/* Position content */}
        <View className="px-4 mt-1">
          {activePosition ? (
            <PositionCard position={activePosition} />
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

      {/* Action button */}
      <View className="px-4 pb-4">
        <Pressable
          onPress={onDebate}
          className="bg-civic-navy rounded-xl py-3"
          style={{ minHeight: 48 }}
          accessibilityRole="button"
          accessibilityLabel={t("candidates:debate")}
        >
          <Text className="font-display-medium text-sm text-text-inverse text-center">
            {t("candidates:debate")}
          </Text>
        </Pressable>
      </View>

      {/* Feedback modal (flag icon pattern from assistant) */}
      <Modal
        visible={feedbackOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFeedbackOpen(false)}
      >
        <View
          className="flex-1 justify-center px-4"
          style={{ backgroundColor: "rgba(27,42,74,0.4)" }}
        >
          <Pressable
            onPress={() => setFeedbackOpen(false)}
            className="absolute inset-0"
            accessibilityRole="button"
            accessibilityLabel={t("common:close")}
          />
          <View className="rounded-2xl border border-warm-gray bg-warm-white p-4">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-display-medium text-base text-civic-navy">
                {t("common:feedbackSignal")}
              </Text>
              <Pressable
                onPress={() => setFeedbackOpen(false)}
                className="h-9 w-9 items-center justify-center rounded-full bg-warm-gray"
                accessibilityRole="button"
                accessibilityLabel={t("common:close")}
              >
                <Ionicons name="close" size={18} color="#1B2A4A" />
              </Pressable>
            </View>
            <FeedbackAction screen="candidate" entityId={candidate.id} />
          </View>
        </View>
      </Modal>
    </View>
  );
}
