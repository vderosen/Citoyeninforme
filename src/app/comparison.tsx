import { useState, useEffect } from "react";
import { View, Text, ScrollView, Pressable } from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useElectionStore } from "../stores/election";
import { LoadingState } from "../components/shared/LoadingState";
import { ComparisonView } from "../components/candidates/ComparisonView";
import { CandidateSelectCard } from "../components/comparison/CandidateSelectCard";
import { ThemeChipSelector } from "../components/comparison/ThemeChipSelector";
import { ComparisonBottomBar } from "../components/comparison/ComparisonBottomBar";

const BOTTOM_BAR_HEIGHT = 120;

export default function ComparisonScreen() {
  const { t } = useTranslation("comparison");
  const params = useLocalSearchParams<{ selected?: string }>();
  const insets = useSafeAreaInsets();
  const isLoaded = useElectionStore((s) => s.isLoaded);
  const candidates = useElectionStore((s) => s.candidates);
  const themes = useElectionStore((s) => s.themes);
  const positions = useElectionStore((s) => s.positions);

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeThemeId, setActiveThemeId] = useState<string | null>(null);

  useEffect(() => {
    if (params.selected) {
      const ids = params.selected
        .split(",")
        .filter((id) => candidates.some((c) => c.id === id));
      if (ids.length > 0) setSelectedIds(ids);
    }
  }, [params.selected, candidates]);

  if (!isLoaded) {
    return (
      <View className="flex-1 bg-warm-white">
        <LoadingState />
      </View>
    );
  }

  const toggleCandidate = (candidateId: string) => {
    setSelectedIds((prev) =>
      prev.includes(candidateId)
        ? prev.filter((id) => id !== candidateId)
        : prev.length >= 4
          ? prev
          : [...prev, candidateId]
    );
  };

  if (step === 2) {
    const themeIdForView = activeThemeId ?? themes[0]?.id;
    return (
      <View className="flex-1 bg-warm-white">
        <Stack.Screen
          options={{
            headerLeft: () => (
              <Pressable
                onPress={() => setStep(1)}
                accessibilityRole="button"
                accessibilityLabel={t("backToCandidates")}
                className="ml-2 flex-row items-center rounded-full px-3 py-2"
                hitSlop={8}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.72 : 1,
                })}
              >
                <Ionicons name="chevron-back" size={18} color="#FAFAF8" />
                <Text className="ml-1 font-body-medium text-sm text-text-inverse">
                  {t("backToCandidates")}
                </Text>
              </Pressable>
            ),
          }}
        />
        <Text className="font-body-medium text-sm text-text-caption px-4 pt-2 pb-1">
          {t("stepIndicator", { current: 2, total: 2 })}
        </Text>
        {themeIdForView && (
          <ComparisonView
            candidates={candidates}
            selectedCandidateIds={selectedIds}
            positions={positions}
            themes={themes}
            activeThemeId={themeIdForView}
            onThemeChange={setActiveThemeId}
            onCandidateToggle={toggleCandidate}
          />
        )}
      </View>
    );
  }

  return (
    <View className="flex-1 bg-warm-white">
      <ScrollView
        contentContainerStyle={{
          paddingBottom: BOTTOM_BAR_HEIGHT + insets.bottom + 16,
          paddingHorizontal: 16,
        }}
      >
        {/* Step indicator */}
        <Text className="font-body-medium text-sm text-text-caption pt-2 pb-4">
          {t("stepIndicator", { current: 1, total: 2 })}
        </Text>

        {/* Candidates section */}
        <View>
          <View className="flex-row items-center justify-between mb-3">
            <Text className="font-display-bold text-lg text-civic-navy">
              {t("candidatesSection")}
            </Text>
            <Text className="font-body-medium text-sm text-text-caption">
              {t("selectedCount", { count: selectedIds.length })}
            </Text>
          </View>
          <View className="gap-2">
            {candidates.map((candidate) => (
              <CandidateSelectCard
                key={candidate.id}
                candidate={candidate}
                isSelected={selectedIds.includes(candidate.id)}
                isDisabled={
                  !selectedIds.includes(candidate.id) &&
                  selectedIds.length >= 4
                }
                onToggle={() => toggleCandidate(candidate.id)}
              />
            ))}
          </View>
        </View>

        {/* Theme section */}
        <View className="mt-6">
          <Text className="font-display-bold text-lg text-civic-navy mb-3">
            {t("themeSection")}
          </Text>
          <ThemeChipSelector
            themes={themes}
            selectedThemeId={activeThemeId}
            onSelectTheme={setActiveThemeId}
          />
        </View>
      </ScrollView>

      <ComparisonBottomBar
        selectedCount={selectedIds.length}
        themeName={
          activeThemeId
            ? themes.find((th) => th.id === activeThemeId)?.name ??
              t("allThemes")
            : t("allThemes")
        }
        isEnabled={selectedIds.length >= 2}
        onCompare={() => setStep(2)}
      />
    </View>
  );
}
