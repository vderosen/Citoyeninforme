import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type { Candidate, Position, Theme } from "../../data/schema";
import type { AssistantContext } from "../../stores/assistant";
import { PositionCard } from "./PositionCard";
import { FeedbackAction } from "../shared/FeedbackAction";

interface CandidateProfileCardProps {
  candidate: Candidate;
  positions: Position[];
  themes: Theme[];
  onCompare: () => void;
  onDebate: () => void;
  onAskAbout: (context: AssistantContext) => void;
}

export function CandidateProfileCard({
  candidate,
  positions,
  themes,
  onCompare,
  onDebate,
  onAskAbout,
}: CandidateProfileCardProps) {
  const { t } = useTranslation("candidates");
  const [expandedThemes, setExpandedThemes] = useState<Set<string>>(new Set());

  const positionsByTheme = themes
    .map((theme) => ({
      theme,
      position: positions.find((p) => p.themeId === theme.id),
    }))
    .filter((entry) => entry.position || true);

  const toggleTheme = (themeId: string) => {
    setExpandedThemes((prev) => {
      const next = new Set(prev);
      if (next.has(themeId)) {
        next.delete(themeId);
      } else {
        next.add(themeId);
      }
      return next;
    });
  };

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
        {candidate.photoUrl ? (
          <Image
            source={{ uri: candidate.photoUrl }}
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
          {t("enBref")}
        </Text>
        <Text className="font-body text-sm text-text-body leading-relaxed">{candidate.bio}</Text>
      </View>

      {/* Positions by theme */}
      <View className="px-4 pb-4">
        <Text className="font-display-semibold text-base text-civic-navy mb-2">
          {t("positionsByTheme")}
        </Text>
        {positionsByTheme.map(({ theme, position }) => (
          <View key={theme.id} className="mb-2">
            <Pressable
              onPress={() => toggleTheme(theme.id)}
              className="flex-row items-center py-2"
              style={{ minHeight: 44 }}
              accessibilityRole="button"
              accessibilityState={{ expanded: expandedThemes.has(theme.id) }}
              accessibilityLabel={theme.name}
            >
              <Text className="font-body-medium text-sm text-civic-navy flex-1">
                {theme.icon} {theme.name}
              </Text>
              <Ionicons
                name={expandedThemes.has(theme.id) ? "chevron-up" : "chevron-down"}
                size={16}
                color="#1B2A4A"
              />
            </Pressable>
            {expandedThemes.has(theme.id) && (
              position ? (
                <PositionCard position={position} />
              ) : (
                <View className="bg-warm-gray rounded-lg p-3 mb-2">
                  <Text className="font-body text-sm text-text-caption italic">
                    {t("noPositionDocumented")}
                  </Text>
                  <Text className="font-body text-xs text-text-caption mt-1">
                    {t("noPositionNote")}
                  </Text>
                </View>
              )
            )}
          </View>
        ))}
      </View>

      {/* Action buttons */}
      <View className="px-4 flex-row gap-3 pb-4">
        <Pressable
          onPress={onCompare}
          className="flex-1 bg-warm-gray rounded-xl py-3"
          style={{ minHeight: 48 }}
          accessibilityRole="button"
          accessibilityLabel={t("compare")}
        >
          <Text className="font-display-medium text-sm text-civic-navy text-center">
            {t("compare")}
          </Text>
        </Pressable>
        <Pressable
          onPress={onDebate}
          className="flex-1 bg-warm-gray rounded-xl py-3"
          style={{ minHeight: 48 }}
          accessibilityRole="button"
          accessibilityLabel={t("debate")}
        >
          <Text className="font-display-medium text-sm text-civic-navy text-center">
            {t("debate")}
          </Text>
        </Pressable>
      </View>

      {/* Ask about this candidate */}
      <View className="px-4 pb-4">
        <Pressable
          onPress={() =>
            onAskAbout({
              type: "candidate",
              candidateId: candidate.id,
              themeId: null,
              promptText: null,
            })
          }
          className="bg-accent-coral-light border border-accent-coral rounded-xl py-3"
          style={{ minHeight: 48 }}
          accessibilityRole="button"
          accessibilityLabel={t("askAbout")}
        >
          <Text className="font-display-medium text-sm text-accent-coral-dark text-center">
            {t("askAbout")}
          </Text>
        </Pressable>
      </View>

      {/* Feedback */}
      <View className="px-4">
        <FeedbackAction screen="candidate" entityId={candidate.id} />
      </View>
    </View>
  );
}
