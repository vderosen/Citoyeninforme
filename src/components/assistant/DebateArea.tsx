import React, { useRef, useEffect, useCallback, useState } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { DebateTurnCard } from "./DebateTurnCard";
import { DebateThemeGrid } from "./DebateThemeGrid";
import { DebateConclusionCard } from "./DebateConclusionCard";
import { PressableScale } from "../ui/PressableScale";
import {
  useAssistantStore,
  createTurnId,
} from "../../stores/assistant";
import { useSurveyStore } from "../../stores/survey";
import { useElectionStore } from "../../stores/election";
import {
  generateDebateTurn,
  generateConclusion,
  DebateServiceError,
} from "../../services/debate";
import type { DebateTurn } from "../../stores/assistant";

export function DebateArea() {
  const { t } = useTranslation("assistant");
  const flatListRef = useRef<FlatList<DebateTurn>>(null);

  // Store selectors
  const debateTurns = useAssistantStore((s) => s.debateTurns);
  const isDebateActive = useAssistantStore((s) => s.isDebateActive);
  const isGeneratingTurn = useAssistantStore((s) => s.isGeneratingTurn);
  const debateStartThemeId = useAssistantStore((s) => s.debateStartThemeId);
  const startDebate = useAssistantStore((s) => s.startDebate);
  const selectDebateOption = useAssistantStore((s) => s.selectDebateOption);
  const addDebateTurn = useAssistantStore((s) => s.addDebateTurn);
  const setGeneratingTurn = useAssistantStore((s) => s.setGeneratingTurn);
  const endDebate = useAssistantStore((s) => s.endDebate);
  const resetDebate = useAssistantStore((s) => s.resetDebate);
  const selectMode = useAssistantStore((s) => s.selectMode);

  const userProfile = useSurveyStore((s) => s.profile);

  const election = useElectionStore((s) => s.election);
  const candidates = useElectionStore((s) => s.candidates);
  const positions = useElectionStore((s) => s.positions);
  const themes = useElectionStore((s) => s.themes);

  const [error, setError] = useState<string | null>(null);

  // Auto-start for users with a profile
  const hasAutoStarted = useRef(false);
  useEffect(() => {
    if (
      !isDebateActive &&
      !isGeneratingTurn &&
      userProfile &&
      debateTurns.length === 0 &&
      !hasAutoStarted.current
    ) {
      hasAutoStarted.current = true;
      startDebate(null);
      triggerNextTurn([], 1, null);
    }
  }, [userProfile, isDebateActive, isGeneratingTurn, debateTurns.length]);

  // Auto-scroll to bottom on new turn
  useEffect(() => {
    if (debateTurns.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [debateTurns.length, isGeneratingTurn]);

  const triggerNextTurn = useCallback(
    async (
      currentTurns: DebateTurn[],
      turnNumber: number,
      startThemeId: string | null
    ) => {
      if (!election) return;

      setGeneratingTurn(true);
      setError(null);

      try {
        const result = await generateDebateTurn({
          context: { election, candidates, positions, themes },
          previousTurns: currentTurns,
          turnNumber,
          userProfile,
          startThemeId: turnNumber === 1 ? startThemeId : undefined,
        });

        const newTurn: DebateTurn = {
          ...result,
          id: createTurnId(),
          selectedOptionId: null,
          timestamp: new Date().toISOString(),
        };

        addDebateTurn(newTurn);
      } catch (err) {
        const message =
          err instanceof DebateServiceError
            ? err.code === "timeout"
              ? t("debateErrorTimeout")
              : err.code === "parse"
                ? t("debateErrorParse")
                : t("debateErrorGeneric")
            : t("debateErrorGeneric");
        setError(message);
      } finally {
        setGeneratingTurn(false);
      }
    },
    [election, candidates, positions, themes, userProfile]
  );

  const handleSelectOption = useCallback(
    (turnId: string, optionId: string) => {
      selectDebateOption(turnId, optionId);

      // Get updated turns after selection
      const updatedTurns = useAssistantStore.getState().debateTurns;
      const nextTurnNumber = updatedTurns.length + 1;
      triggerNextTurn(
        updatedTurns,
        nextTurnNumber,
        debateStartThemeId
      );
    },
    [selectDebateOption, triggerNextTurn, debateStartThemeId]
  );

  const handleThemeSelect = useCallback(
    (themeId: string) => {
      startDebate(themeId);
      triggerNextTurn([], 1, themeId);
    },
    [startDebate, triggerNextTurn]
  );

  const handleEndDebate = useCallback(async () => {
    if (!election) return;

    endDebate();
    setGeneratingTurn(true);
    setError(null);

    try {
      const currentTurns = useAssistantStore.getState().debateTurns;
      const result = await generateConclusion({
        context: { election, candidates, positions, themes },
        allTurns: currentTurns,
        userProfile,
      });

      const conclusionTurn: DebateTurn = {
        ...result,
        id: createTurnId(),
        selectedOptionId: null,
        timestamp: new Date().toISOString(),
      };

      addDebateTurn(conclusionTurn);
    } catch (err) {
      const message =
        err instanceof DebateServiceError
          ? err.code === "timeout"
            ? t("debateErrorTimeout")
            : t("debateErrorGeneric")
          : t("debateErrorGeneric");
      setError(message);
    } finally {
      setGeneratingTurn(false);
    }
  }, [election, candidates, positions, themes, userProfile]);

  const handleNewDebate = useCallback(() => {
    hasAutoStarted.current = false;
    resetDebate();
  }, [resetDebate]);

  const handleBack = useCallback(() => {
    resetDebate();
    selectMode("comprendre");
  }, [resetDebate, selectMode]);

  const handleRetry = useCallback(() => {
    setError(null);
    const currentTurns = useAssistantStore.getState().debateTurns;
    triggerNextTurn(
      currentTurns,
      currentTurns.length + 1,
      debateStartThemeId
    );
  }, [triggerNextTurn, debateStartThemeId]);

  // Check if the last turn is a conclusion
  const lastTurn = debateTurns[debateTurns.length - 1];
  const isConclusion = lastTurn?.isConclusion === true;

  // Show theme grid for users without profile and no active debate
  if (!isDebateActive && !userProfile && debateTurns.length === 0) {
    return (
      <DebateThemeGrid
        themes={themes}
        onSelectTheme={handleThemeSelect}
      />
    );
  }

  const completedTurnCount = debateTurns.filter(
    (t) => t.selectedOptionId !== null
  ).length;

  return (
    <View className="flex-1">
      <FlatList
        ref={flatListRef}
        data={debateTurns}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => {
          // A turn is "current" if it's the last one and has no selected option
          const isCurrent =
            index === debateTurns.length - 1 &&
            item.selectedOptionId === null &&
            !item.isConclusion;

          if (item.isConclusion) {
            return (
              <DebateConclusionCard
                turn={item}
                candidates={candidates}
                onNewDebate={handleNewDebate}
                onBack={handleBack}
              />
            );
          }

          return (
            <DebateTurnCard
              turn={item}
              isCurrent={isCurrent}
              onSelectOption={(optionId) =>
                handleSelectOption(item.id, optionId)
              }
            />
          );
        }}
        contentContainerStyle={{ paddingBottom: 120 }}
        ListFooterComponent={
          <>
            {/* Loading indicator */}
            {isGeneratingTurn && (
              <View className="items-center py-6 gap-2">
                <ActivityIndicator size="small" color="#2563EB" />
                <Text className="font-body text-xs text-text-caption">
                  {t("debateLoading")}
                </Text>
              </View>
            )}

            {/* Error with retry */}
            {error && !isGeneratingTurn && (
              <View className="items-center py-6 gap-3 px-4">
                <Text className="font-body text-sm text-red-500 text-center">
                  {error}
                </Text>
                <PressableScale
                  onPress={handleRetry}
                  className="bg-accent-blue rounded-full px-6 py-2"
                >
                  <Text className="font-display-medium text-sm text-white">
                    {t("debateRetryButton")}
                  </Text>
                </PressableScale>
              </View>
            )}
          </>
        }
      />

      {/* End debate button */}
      {isDebateActive &&
        !isGeneratingTurn &&
        !isConclusion &&
        completedTurnCount >= 1 && (
          <View className="absolute bottom-0 left-0 right-0 bg-warm-white/95 border-t border-warm-gray px-4 py-3">
            <PressableScale
              onPress={handleEndDebate}
              className="bg-civic-navy rounded-full py-3 items-center"
            >
              <Text className="font-display-medium text-sm text-white">
                {t("debateEndButton")}
              </Text>
            </PressableScale>
          </View>
        )}
    </View>
  );
}

