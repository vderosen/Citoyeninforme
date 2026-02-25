import { useState, useCallback, useMemo } from "react";
import { View, Text, Image, ScrollView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useElectionStore } from "../../stores/election";
import { useAssistantStore } from "../../stores/assistant";
import { LoadingState } from "../../components/shared/LoadingState";
import { CandidateAvatarBar } from "../../components/comparison/CandidateAvatarBar";
import { ThemeTabBar } from "../../components/candidates/ThemeTabBar";
import { SinglePositionView } from "../../components/candidates/SinglePositionView";
import { ComparisonView } from "../../components/candidates/ComparisonView";
import { getCandidateImageSource } from "../../utils/candidateImageSource";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";
import { deterministicShuffle, dailySeed } from "../../utils/shuffle";
import { CandidateInfoModal } from "../../components/candidates/CandidateInfoModal";
import type { Candidate } from "../../data/schema";
import { useCandidateSelection } from "../../hooks/useCandidateSelection";

const MAX_SELECTED = 4;

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  android: { elevation: 2 },
  default: {},
});

export default function CandidatesScreen() {
  const { t } = useTranslation("candidates");
  const router = useRouter();
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const candidates = useElectionStore((s) => s.candidates);
  const themes = useElectionStore((s) => s.themes);
  const positions = useElectionStore((s) => s.positions);
  const selectCandidate = useAssistantStore((s) => s.selectCandidate);

  const { selectedIds, selectedCandidates, toggleCandidate } = useCandidateSelection(
    candidates,
    MAX_SELECTED
  );

  const [activeThemeId, setActiveThemeId] = useState(themes[0]?.id ?? "");
  const [showCandidateInfo, setShowCandidateInfo] = useState(false);

  const shuffledCandidates = useMemo(
    () => deterministicShuffle(candidates, dailySeed()),
    [candidates]
  );

  const handleDebate = useCallback(() => {
    if (selectedIds.length !== 1) return;
    selectCandidate(selectedIds[0]);
    router.push("/(tabs)/assistant");
  }, [selectedIds, selectCandidate, router]);

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-warm-white">
        <LoadingState />
      </SafeAreaView>
    );
  }

  const renderCandidateHeader = (
    candidate: Candidate,
    options: { showBio: boolean; compact: boolean; onLearnMore?: () => void }
  ) => {
    const partyColor = getCandidatePartyColor(candidate.id);
    const imageSource = getCandidateImageSource(candidate);
    const avatarSize = options.compact ? 36 : 48;
    const padding = options.compact ? "px-2 pt-2 pb-1.5" : "px-3 pt-3 pb-2";
    const nameClass = options.compact
      ? "font-display-bold text-xs text-civic-navy"
      : "font-display-bold text-base text-civic-navy";

    return (
      <View
        key={candidate.id}
        className="flex-1 rounded-xl overflow-hidden bg-warm-white"
        style={cardShadow}
      >
        <View
          style={{ backgroundColor: partyColor + "14" }}
          className={padding}
        >
          <View className="flex-row items-center">
            {imageSource ? (
              <Image
                source={imageSource}
                className="rounded-full bg-warm-gray"
                style={{ width: avatarSize, height: avatarSize }}
                accessibilityIgnoresInvertColors
              />
            ) : (
              <View
                className="rounded-full bg-warm-gray items-center justify-center"
                style={{ width: avatarSize, height: avatarSize }}
              >
                <Text className={options.compact ? "text-base" : "text-xl"}>
                  👤
                </Text>
              </View>
            )}
            <View className="flex-1 ml-2" style={{ minWidth: 0 }}>
              <Text className={nameClass} numberOfLines={1}>
                {candidate.name}
              </Text>
              {!options.compact && (
                <View
                  className="rounded-full px-2 py-0.5 mt-0.5 self-start"
                  style={{ backgroundColor: partyColor + "1A" }}
                >
                  <Text
                    className="font-body-medium text-xs"
                    style={{ color: partyColor }}
                    numberOfLines={1}
                  >
                    {candidate.party}
                  </Text>
                </View>
              )}
            </View>
            {options.onLearnMore && (
              <Pressable
                onPress={options.onLearnMore}
                className="items-center pl-2"
                accessibilityRole="button"
                accessibilityLabel={t("learnMore")}
              >
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color="#1B2A4A"
                />
                <Text className="font-body text-xs text-civic-navy mt-0.5">
                  {t("learnMore")}
                </Text>
              </Pressable>
            )}
          </View>
          {options.showBio && candidate.bio ? (
            <Text
              className="font-body text-xs text-text-body leading-relaxed mt-2"
              numberOfLines={3}
            >
              {candidate.bio}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  const activeTheme = useMemo(
    () => themes.find((t) => t.id === activeThemeId),
    [themes, activeThemeId]
  );

  const count = selectedCandidates.length;
  const isSingle = count === 1;
  const isCompact = count >= 3;

  return (
    <SafeAreaView className="flex-1 bg-warm-white" edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <CandidateAvatarBar
          candidates={shuffledCandidates}
          selectedIds={selectedIds}
          onToggle={toggleCandidate}
          maxSelected={MAX_SELECTED}
        />
        <View>
          {/* Candidate header zone — fixed minHeight so ThemeTabBar stays stable */}
          {count === 0 ? (
            <View className="px-4 items-center justify-center" style={{ minHeight: 68 }}>
              <Text className="font-body text-sm text-text-caption text-center">
                {t("emptyStateDescription")}
              </Text>
            </View>
          ) : (
            <View className="flex-row px-4 items-center" style={{ minHeight: 68, gap: isCompact ? 8 : 12 }}>
              {selectedCandidates.map((c) =>
                renderCandidateHeader(c, {
                  showBio: false,
                  compact: isCompact,
                  onLearnMore: isSingle ? () => setShowCandidateInfo(true) : undefined,
                })
              )}
            </View>
          )}

          {/* ThemeTabBar — always at the same position */}
          <View className="mt-3">
            <ThemeTabBar
              themes={themes}
              activeThemeId={activeThemeId}
              onSelectTheme={setActiveThemeId}
            />
          </View>

          {/* Position content */}
          {count === 0 ? (
            <View className="px-4 mt-3 pb-6">
              <Text className="font-body text-sm text-text-caption">
                {activeTheme?.description ?? ""}
              </Text>
            </View>
          ) : isSingle ? (
            <SinglePositionView
              candidate={selectedCandidates[0]}
              activeThemeId={activeThemeId}
              positions={positions}
              onDebatePress={handleDebate}
            />
          ) : (
            <View className="mt-3 pb-6 flex-1 px-4">
              <View style={{ marginHorizontal: -16 }}>
                <ComparisonView
                  candidates={candidates}
                  selectedCandidateIds={selectedIds}
                  positions={positions}
                  activeThemeId={activeThemeId}
                />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
      {showCandidateInfo && isSingle && (
        <CandidateInfoModal
          candidate={selectedCandidates[0]}
          onClose={() => setShowCandidateInfo(false)}
        />
      )}
    </SafeAreaView>
  );
}
