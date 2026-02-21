import { useState, useCallback, useMemo } from "react";
import { View, Text, Image, LayoutAnimation, ScrollView, Platform, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { useElectionStore } from "../../stores/election";
import { useAssistantStore } from "../../stores/assistant";
import { LoadingState } from "../../components/shared/LoadingState";
import { CandidateAvatarBar } from "../../components/comparison/CandidateAvatarBar";
import { ThemeTabBar } from "../../components/candidates/ThemeTabBar";
import { PositionCard } from "../../components/candidates/PositionCard";
import { TrustBadge } from "../../components/shared/TrustBadge";
import { SourceReference } from "../../components/shared/SourceReference";
import { getCandidateImageSource } from "../../utils/candidateImageSource";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";
import { deterministicShuffle, dailySeed } from "../../utils/shuffle";
import { CandidateInfoModal } from "../../components/candidates/CandidateInfoModal";
import type { Candidate } from "../../data/schema";

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
  const { t: tComparison } = useTranslation("comparison");
  const { t: tCommon } = useTranslation("common");
  const router = useRouter();
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const candidates = useElectionStore((s) => s.candidates);
  const themes = useElectionStore((s) => s.themes);
  const positions = useElectionStore((s) => s.positions);
  const getCandidateById = useElectionStore((s) => s.getCandidateById);
  const selectMode = useAssistantStore((s) => s.selectMode);
  const selectCandidate = useAssistantStore((s) => s.selectCandidate);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeThemeId, setActiveThemeId] = useState(themes[0]?.id ?? "");
  const [showCandidateInfo, setShowCandidateInfo] = useState(false);

  const shuffledCandidates = useMemo(
    () => deterministicShuffle(candidates, dailySeed()),
    [candidates]
  );

  const selectedCandidates = useMemo(
    () =>
      selectedIds
        .map((id) => getCandidateById(id))
        .filter(Boolean) as Candidate[],
    [selectedIds, getCandidateById]
  );

  const toggleCandidate = useCallback(
    (candidateId: string) => {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setSelectedIds((prev) => {
        if (prev.includes(candidateId)) {
          return prev.filter((id) => id !== candidateId);
        }
        if (prev.length >= MAX_SELECTED) return prev;
        return [...prev, candidateId];
      });
    },
    []
  );

  const handleDebate = useCallback(() => {
    if (selectedIds.length !== 1) return;
    selectMode("parler");
    selectCandidate(selectedIds[0]);
    router.push("/(tabs)/assistant");
  }, [selectedIds, selectMode, selectCandidate, router]);

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

  const renderContent = () => {
    const count = selectedCandidates.length;
    const isSingle = count === 1;
    const isCompact = count >= 3;

    return (
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
        {count === 0
          ? renderThemeDescription()
          : isSingle
            ? renderSinglePosition()
            : renderMultiPositions(isCompact)}
      </View>
    );
  };

  const renderThemeDescription = () => (
    <View className="px-4 mt-3 pb-6">
      <Text className="font-body text-sm text-text-caption">
        {activeTheme?.description ?? ""}
      </Text>
    </View>
  );

  const renderSinglePosition = () => {
    const candidate = selectedCandidates[0];
    const partyColor = getCandidatePartyColor(candidate.id);
    const activePosition = positions.find(
      (p) => p.candidateId === candidate.id && p.themeId === activeThemeId
    );

    return (
      <View className="px-4 mt-3 pb-6">
        {activePosition ? (
          <PositionCard position={activePosition} partyColor={partyColor} />
        ) : (
          <View className="bg-warm-gray rounded-lg p-3">
            <Text className="font-body text-sm text-text-caption italic">
              {t("noPositionDocumented")}
            </Text>
            <Text className="font-body text-xs text-text-caption mt-1">
              {t("noPositionNote")}
            </Text>
          </View>
        )}

        {/* Debate button */}
        <View className="pt-5 pb-4 items-center">
          <Pressable
            onPress={handleDebate}
            className="rounded-xl py-3 px-8 flex-row items-center justify-center"
            style={{
              minHeight: 48,
              borderWidth: 1.5,
              borderColor: "#1B2A4A",
            }}
            accessibilityRole="button"
            accessibilityLabel={t("debate")}
          >
            <Ionicons
              name="chatbubble-outline"
              size={18}
              color="#1B2A4A"
              style={{ marginRight: 8 }}
            />
            <Text className="font-display-medium text-sm text-civic-navy">
              {t("debate")}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  };

  const renderMultiPositions = (compact: boolean) => {
    const textClass = compact ? "text-xs" : "text-sm";
    const maxLines = compact ? 4 : 6;

    return (
      <View
        className="flex-row px-4 mt-3 pb-6"
        style={{ gap: compact ? 8 : 12 }}
      >
        {selectedCandidates.map((candidate) => {
          const position = positions.find(
            (p) =>
              p.candidateId === candidate.id && p.themeId === activeThemeId
          );
          return (
            <View
              key={candidate.id}
              className={`flex-1 bg-warm-white rounded-xl ${compact ? "p-2" : "p-3"}`}
              style={cardShadow}
            >
              {position ? (
                <View>
                  <Text className={`font-body ${textClass} text-text-body mb-1`}>
                    {position.summary}
                  </Text>
                  <Text
                    className={`font-body ${textClass} text-text-caption mb-2`}
                    numberOfLines={maxLines}
                  >
                    {position.details}
                  </Text>
                  {!compact && (
                    <View className="border-t border-warm-gray pt-2 gap-1">
                      {position.sources.map((source, index) => (
                        <SourceReference
                          key={index}
                          source={source}
                          compact
                        />
                      ))}
                    </View>
                  )}
                </View>
              ) : (
                <View>
                  <TrustBadge variant="non_documente" />
                  <Text
                    className={`font-body ${textClass} text-text-caption italic mt-2`}
                  >
                    {tComparison("positionNotDocumented")}
                  </Text>
                </View>
              )}
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-warm-white" edges={[]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <CandidateAvatarBar
          candidates={shuffledCandidates}
          selectedIds={selectedIds}
          onToggle={toggleCandidate}
          maxSelected={MAX_SELECTED}
        />
        {renderContent()}
      </ScrollView>
      {showCandidateInfo && selectedCandidates.length === 1 && (
        <CandidateInfoModal
          candidate={selectedCandidates[0]}
          onClose={() => setShowCandidateInfo(false)}
        />
      )}
    </SafeAreaView>
  );
}
