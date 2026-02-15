import { useState } from "react";
import { View, Text, Image, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
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
      {/* Header */}
      <View className="items-center px-4 pt-6 pb-4">
        {candidate.photoUrl ? (
          <Image
            source={{ uri: candidate.photoUrl }}
            className="w-24 h-24 rounded-full bg-gray-200"
            accessibilityIgnoresInvertColors
          />
        ) : (
          <View className="w-24 h-24 rounded-full bg-gray-200 items-center justify-center">
            <Text className="text-4xl">👤</Text>
          </View>
        )}
        <Text className="text-xl font-bold text-gray-900 mt-3">
          {candidate.name}
        </Text>
        <Text className="text-sm text-gray-500">{candidate.party}</Text>
      </View>

      {/* En bref */}
      <View className="px-4 pb-4">
        <Text className="text-base font-semibold text-gray-900 mb-1">
          {t("enBref")}
        </Text>
        <Text className="text-sm text-gray-700">{candidate.bio}</Text>
      </View>

      {/* Positions by theme */}
      <View className="px-4 pb-4">
        <Text className="text-base font-semibold text-gray-900 mb-2">
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
              <Text className="text-sm font-medium text-gray-800 flex-1">
                {theme.icon} {theme.name}
              </Text>
              <Text className="text-gray-400">
                {expandedThemes.has(theme.id) ? "▲" : "▼"}
              </Text>
            </Pressable>
            {expandedThemes.has(theme.id) && (
              position ? (
                <PositionCard position={position} />
              ) : (
                <View className="bg-gray-50 rounded-lg p-3 mb-2">
                  <Text className="text-sm text-gray-500 italic">
                    {t("noPositionDocumented")}
                  </Text>
                  <Text className="text-xs text-gray-400 mt-1">
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
          className="flex-1 bg-gray-100 rounded-xl py-3"
          style={{ minHeight: 48 }}
          accessibilityRole="button"
          accessibilityLabel={t("compare")}
        >
          <Text className="text-sm font-semibold text-gray-800 text-center">
            {t("compare")}
          </Text>
        </Pressable>
        <Pressable
          onPress={onDebate}
          className="flex-1 bg-gray-100 rounded-xl py-3"
          style={{ minHeight: 48 }}
          accessibilityRole="button"
          accessibilityLabel={t("debate")}
        >
          <Text className="text-sm font-semibold text-gray-800 text-center">
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
          className="bg-blue-50 rounded-xl py-3"
          style={{ minHeight: 48 }}
          accessibilityRole="button"
          accessibilityLabel={t("askAbout")}
        >
          <Text className="text-sm font-semibold text-blue-700 text-center">
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
