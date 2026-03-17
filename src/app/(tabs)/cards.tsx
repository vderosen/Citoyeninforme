import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { View, Text, Modal, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import {
    SECOND_SURVEY_ROUND,
    useSurveyStore,
} from "../../stores/survey";
import { useAppStore } from "../../stores/app";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SwipeStack } from "../../components/survey/SwipeStack";
import { SwipeTutorialOverlay } from "../../components/survey/SwipeTutorialOverlay";
import { ResultsReminderOverlay } from "../../components/survey/ResultsReminderOverlay";
import { ProgressBar } from "../../components/survey/ProgressBar";
import {
    getParisSecondRoundCandidates,
    getParisSecondRoundStatementCards,
} from "../../data/elections/paris-2026/secondRoundSurvey";

import { balancedShuffle, dailySeed } from "../../utils/shuffle";
import { getCategoryTheme } from "../../utils/categoryTheme";
import {
    areStringArraysEqual,
    deriveEffectiveQuestionOrder,
    findNextUnansweredIndex,
} from "../../utils/questionOrder";
import { buildAnswerId } from "../../utils/swipeAnswer";
import type { SwipeDirection, StatementCard } from "../../data/schema";

export default function CardsScreen() {
    const { t } = useTranslation(["survey", "common"]);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const election = useElectionStore((s) => s.election);
    const statementCards = useElectionStore((s) => s.statementCards);
    const candidates = useElectionStore((s) => s.candidates);
    const secondRoundCards = useMemo(
        () => getParisSecondRoundStatementCards(statementCards),
        [statementCards]
    );
    const secondRoundCandidates = useMemo(
        () => getParisSecondRoundCandidates(candidates),
        [candidates]
    );

    const hasSeenSwipeTutorial = useAppStore((s) => s.hasSeenSwipeTutorial);
    const markSwipeTutorialSeen = useAppStore((s) => s.markSwipeTutorialSeen);
    const [isResultsReminderVisible, setIsResultsReminderVisible] = useState(false);
    const [lastResultsReminderSwipeCount, setLastResultsReminderSwipeCount] = useState(-1);
    const [showSwipeHint, setShowSwipeHint] = useState(false);
    const swipeHintIdleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const shouldTrackFirstActionRef = useRef(false);

    const secondRoundState = useSurveyStore((s) => s.rounds[SECOND_SURVEY_ROUND]);
    const currentIndex = secondRoundState.currentQuestionIndex;
    const questionOrder = secondRoundState.questionOrder;
    const answers = secondRoundState.answers;
    const surveyStatus = secondRoundState.status;
    const resultsReminderDismissCount =
        secondRoundState.resultsReminderDismissCount;
    const hasVisitedResultsTab = secondRoundState.hasVisitedResultsTab;
    const hasSeenInitialResult = secondRoundState.hasSeenInitialResult;
    const startQuestionnaire = useSurveyStore((s) => s.startQuestionnaire);
    const markQuestionnaireActive = useSurveyStore(
        (s) => s.markQuestionnaireActive
    );
    const dismissResultsReminder = useSurveyStore(
        (s) => s.dismissResultsReminder
    );
    const markResultsTabVisited = useSurveyStore((s) => s.markResultsTabVisited);
    const answerQuestion = useSurveyStore((s) => s.answerQuestion);
    const nextQuestion = useSurveyStore((s) => s.nextQuestion);
    const setCurrentQuestionIndex = useSurveyStore((s) => s.setCurrentQuestionIndex);
    const setQuestionOrder = useSurveyStore((s) => s.setQuestionOrder);
    const clearAnswer = useSurveyStore((s) => s.clearAnswer);

    // Shuffle cards with candidate-balanced interleaving.
    // Include opposing candidates in exposure balancing because they are scored on this card too.
    const [shuffleSeed] = useState(() => dailySeed());
    const cardsForShuffle = useMemo(
        () =>
            secondRoundCards.map((card) => ({
                id: card.id,
                candidateIds: Array.from(
                    new Set([...(card.candidateIds ?? []), ...(card.opposingCandidateIds ?? [])])
                ),
            })),
        [secondRoundCards]
    );
    const deterministicCardOrder = useMemo(
        () => balancedShuffle(cardsForShuffle, shuffleSeed).map((card) => card.id),
        [cardsForShuffle, shuffleSeed]
    );
    const availableCardIds = useMemo(
        () => secondRoundCards.map((card) => card.id),
        [secondRoundCards]
    );
    const effectiveCardOrder = useMemo(
        () =>
            deriveEffectiveQuestionOrder({
                persistedOrder: questionOrder,
                deterministicOrder: deterministicCardOrder,
                availableCardIds,
            }),
        [availableCardIds, deterministicCardOrder, questionOrder]
    );

    useEffect(() => {
        if (areStringArraysEqual(questionOrder, effectiveCardOrder)) return;
        setQuestionOrder(effectiveCardOrder, SECOND_SURVEY_ROUND);
    }, [effectiveCardOrder, questionOrder, setQuestionOrder]);

    const shuffledCards = useMemo(
        () => {
            const byId = new Map(secondRoundCards.map((card) => [card.id, card]));
            return effectiveCardOrder
                .map((cardId) => byId.get(cardId))
                .filter((card): card is StatementCard => !!card);
        },
        [effectiveCardOrder, secondRoundCards]
    );

    // Track swiped cards for undo (current session only)
    const [swipedCards, setSwipedCards] = useState<
        { card: StatementCard; direction: SwipeDirection; isX2Enabled: boolean }[]
    >([]);
    const [x2ByCardId, setX2ByCardId] = useState<Record<string, boolean>>({});

    // Track the selectedCardId to display the description Modal
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const selectedCard = useMemo(
        () => shuffledCards.find((c) => c.id === selectedCardId),
        [shuffledCards, selectedCardId]
    );
    // The modal previously showed the theme. We can keep it simple now.
    const selectedTheme = null;

    useEffect(() => {
        if (surveyStatus === "questionnaire" || surveyStatus === "results_ready") return;

        if (surveyStatus === "not_started" || surveyStatus === "completed") {
            startQuestionnaire(SECOND_SURVEY_ROUND);
            return;
        }

        markQuestionnaireActive(SECOND_SURVEY_ROUND);
    }, [markQuestionnaireActive, startQuestionnaire, surveyStatus]);

    useEffect(() => {
        const nextIndex = findNextUnansweredIndex({
            cards: shuffledCards,
            currentIndex,
            answers,
        });
        if (nextIndex !== currentIndex) {
            setCurrentQuestionIndex(nextIndex, SECOND_SURVEY_ROUND);
        }
    }, [answers, currentIndex, setCurrentQuestionIndex, shuffledCards]);

    const isLast = currentIndex >= shuffledCards.length - 1;
    const showProgressBar = currentIndex >= 1;
    const theme = getCategoryTheme(selectedCard?.category || 'Autre');
    const resultsReminderThreshold = resultsReminderDismissCount === 0 ? 10 : 25;
    const canShowResultsReminder = useMemo(() => {
        if (hasVisitedResultsTab) return false;
        if (hasSeenInitialResult) return false;
        return resultsReminderDismissCount < 2;
    }, [hasSeenInitialResult, hasVisitedResultsTab, resultsReminderDismissCount]);

    useEffect(() => {
        if (!canShowResultsReminder) {
            setIsResultsReminderVisible(false);
            return;
        }

        if (isResultsReminderVisible) return;

        if (
            currentIndex >= resultsReminderThreshold &&
            currentIndex > lastResultsReminderSwipeCount
        ) {
            setIsResultsReminderVisible(true);
        }
    }, [
        canShowResultsReminder,
        currentIndex,
        isResultsReminderVisible,
        lastResultsReminderSwipeCount,
        resultsReminderThreshold,
    ]);

    const computeResults = useCallback(() => {
        if (!election) return;
        useSurveyStore.getState().computeAndSetResults(
            shuffledCards,
            secondRoundCandidates,
            election.dataVersion ?? "unknown",
            SECOND_SURVEY_ROUND
        );
    }, [
        election,
        secondRoundCandidates,
        shuffledCards,
    ]);

    const clearSwipeHintIdleTimer = useCallback(() => {
        if (swipeHintIdleTimerRef.current) {
            clearTimeout(swipeHintIdleTimerRef.current);
            swipeHintIdleTimerRef.current = null;
        }
    }, []);

    const registerFirstCardAction = useCallback(() => {
        if (!shouldTrackFirstActionRef.current) return;
        shouldTrackFirstActionRef.current = false;
        clearSwipeHintIdleTimer();
        setShowSwipeHint(false);
    }, [clearSwipeHintIdleTimer]);

    const handleSwipe = useCallback(
        (cardId: string, direction: SwipeDirection, isX2Enabled: boolean) => {
            registerFirstCardAction();
            const optionId = buildAnswerId(cardId, direction, isX2Enabled);
            answerQuestion(cardId, optionId, SECOND_SURVEY_ROUND);

            const card = shuffledCards.find((c) => c.id === cardId);
            if (card) {
                setSwipedCards((prev) => [...prev, { card, direction, isX2Enabled }]);
            }

            // Compute results seamlessly after state updates
            setTimeout(computeResults, 50);

            if (!isLast) {
                nextQuestion(SECOND_SURVEY_ROUND);
            } else {
                // Increment anyways so that the screen shows "finished" message
                nextQuestion(SECOND_SURVEY_ROUND);
            }
        },
        [
            answerQuestion,
            computeResults,
            isLast,
            nextQuestion,
            registerFirstCardAction,
            shuffledCards,
        ]
    );

    const handleToggleX2 = useCallback((cardId: string) => {
        registerFirstCardAction();
        setX2ByCardId((prev) => ({
            ...prev,
            [cardId]: !prev[cardId],
        }));
    }, [registerFirstCardAction]);

    const handleUndo = useCallback(() => {
        registerFirstCardAction();
        if (currentIndex <= 0) return;

        const previousCard = shuffledCards[currentIndex - 1];
        if (!previousCard) return;

        setSwipedCards((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
        clearAnswer(previousCard.id, SECOND_SURVEY_ROUND);

        // recompute results
        setTimeout(computeResults, 50);
    }, [clearAnswer, computeResults, currentIndex, registerFirstCardAction, shuffledCards]);

    const handleOpenResults = useCallback(() => {
        registerFirstCardAction();
        setIsResultsReminderVisible(false);
        setLastResultsReminderSwipeCount(currentIndex);
        markResultsTabVisited(SECOND_SURVEY_ROUND);
        router.push("/(tabs)/matches");
    }, [currentIndex, markResultsTabVisited, registerFirstCardAction, router]);

    const handleDismissResultsReminder = useCallback(() => {
        registerFirstCardAction();
        setIsResultsReminderVisible(false);
        setLastResultsReminderSwipeCount(currentIndex);
        dismissResultsReminder(SECOND_SURVEY_ROUND);
    }, [currentIndex, dismissResultsReminder, registerFirstCardAction]);

    const handleShowDescription = useCallback((cardId: string) => {
        registerFirstCardAction();
        setSelectedCardId(cardId);
    }, [registerFirstCardAction]);

    const dismissTutorial = useCallback(() => {
        markSwipeTutorialSeen();
        setShowSwipeHint(false);
        shouldTrackFirstActionRef.current = true;
        clearSwipeHintIdleTimer();
        swipeHintIdleTimerRef.current = setTimeout(() => {
            if (shouldTrackFirstActionRef.current && currentIndex < shuffledCards.length) {
                setShowSwipeHint(true);
            }
            swipeHintIdleTimerRef.current = null;
        }, 1000);
    }, [clearSwipeHintIdleTimer, currentIndex, markSwipeTutorialSeen, shuffledCards.length]);

    useEffect(() => {
        return () => {
            shouldTrackFirstActionRef.current = false;
            clearSwipeHintIdleTimer();
        };
    }, [clearSwipeHintIdleTimer]);

    if (shuffledCards.length === 0) {
        return (
            <View className="flex-1 items-center justify-center bg-warm-white">
                <Text className="font-body text-text-caption">
                    {t("common:loading")}
                </Text>
            </View>
        );
    }

    // If we are past the last card
    if (currentIndex >= shuffledCards.length) {
        return (
            <View className="flex-1 items-center justify-center bg-warm-white p-6">
                <Text className="font-display-bold text-2xl text-civic-navy mb-4 text-center">
                    {t("survey:allCardsDoneTitle")}
                </Text>
                <Text className="font-body text-text-body text-center mb-8">
                    {t("survey:allCardsDoneMessage")}
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-warm-white" style={{ paddingTop: insets.top }}>
            {/* Header / App Logo */}
            <View className="items-center justify-center py-4 relative">
                <Text className="text-[22px] tracking-wide" style={{ fontFamily: 'ArialRoundedMTBold' }}>
                    <Text style={{ color: '#1A202C' }}>Citoyen </Text>
                    <Text style={{ color: '#60A5FA' }}>Informé</Text>
                </Text>
                <Text className="absolute right-5 font-display-medium text-xs text-text-caption">
                    {t("survey:secondRoundShort")}
                </Text>
            </View>

            <View className="z-20 mb-2">
                {showProgressBar ? (
                    <ProgressBar current={currentIndex} total={shuffledCards.length} />
                ) : (
                    // Keep identical spacing before the bar appears.
                    <View className="px-5 py-1">
                        <View className="h-1.5" />
                    </View>
                )}
            </View>

            <View className="flex-1" style={{ paddingTop: 14 }}>
                <SwipeStack
                    cards={shuffledCards}
                    currentIndex={currentIndex}
                    onSwipe={handleSwipe}
                    swipedCards={swipedCards}
                    x2ByCardId={x2ByCardId}
                    onToggleX2={handleToggleX2}
                    showSwipeHint={showSwipeHint}
                    onUndo={handleUndo}
                    onShowDescription={handleShowDescription}
                />
            </View>

            <View className="pb-6 px-6">
                <Text className="font-body text-xs text-text-caption text-center">
                    {t("survey:swipeInstruction")}
                </Text>
            </View>

            <Modal
                visible={!hasSeenSwipeTutorial}
                transparent={true}
                animationType="fade"
                onRequestClose={dismissTutorial}
            >
                <SwipeTutorialOverlay onDismiss={dismissTutorial} />
            </Modal>

            <Modal
                visible={hasSeenSwipeTutorial && isResultsReminderVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={handleDismissResultsReminder}
            >
                <ResultsReminderOverlay
                    onDismiss={handleDismissResultsReminder}
                    onOpenResults={handleOpenResults}
                />
            </Modal>

            <Modal
                visible={!!selectedCard}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedCardId(null)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-4">
                    <View className="bg-warm-white w-full max-w-sm rounded-2xl overflow-hidden shadow-xl max-h-[85vh]">
                        <ScrollView className="p-6">
                            <Text className="font-display-bold text-xl text-civic-navy mb-4 leading-snug">
                                {selectedCard?.text}
                            </Text>

                            {selectedCard?.description && (
                                <Text className="font-body-regular text-base text-text-secondary leading-relaxed mb-4">
                                    {selectedCard.description}
                                </Text>
                            )}
                        </ScrollView>

                        <View className="p-4 border-t border-warm-gray">
                            <Pressable
                                onPress={() => setSelectedCardId(null)}
                                className="py-3.5 px-6 rounded-xl active:opacity-80 items-center"
                                style={{ backgroundColor: theme.bg }}
                            >
                                <Text
                                    className="font-display-bold text-warm-white text-sm uppercase tracking-wider"
                                    style={{ color: theme.text }}
                                >
                                    {t("common:close")}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
