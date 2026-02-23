import { useState, useMemo, useCallback, useEffect } from "react";
import { View, Text, Modal, ScrollView, Pressable } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { SwipeStack } from "../../components/survey/SwipeStack";
import { SwipeTutorialOverlay } from "../../components/survey/SwipeTutorialOverlay";
import { ProgressBar } from "../../components/survey/ProgressBar";
import { computeMatching } from "../../services/matching";
import { balancedShuffle, dailySeed } from "../../utils/shuffle";
import type { SwipeDirection, StatementCard } from "../../data/schema";

export default function CardsScreen() {
    const { t } = useTranslation(["survey", "common"]);
    const router = useRouter();
    const election = useElectionStore((s) => s.election);
    const statementCards = useElectionStore((s) => s.statementCards);
    const positions = useElectionStore((s) => s.positions);
    const candidates = useElectionStore((s) => s.candidates);
    const themes = useElectionStore((s) => s.themes);

    const [hasSeenTutorial, setHasSeenTutorial] = useState(false);
    const dismissTutorial = useCallback(() => setHasSeenTutorial(true), []);

    const currentIndex = useSurveyStore((s) => s.currentQuestionIndex);
    const surveyStatus = useSurveyStore((s) => s.status);
    const startQuestionnaire = useSurveyStore((s) => s.startQuestionnaire);
    const markQuestionnaireActive = useSurveyStore(
        (s) => s.markQuestionnaireActive
    );
    const answerQuestion = useSurveyStore((s) => s.answerQuestion);
    const nextQuestion = useSurveyStore((s) => s.nextQuestion);
    const clearAnswer = useSurveyStore((s) => s.clearAnswer);
    const setResults = useSurveyStore((s) => s.setResults);

    // Shuffle cards with candidate-balanced interleaving
    const [shuffleSeed] = useState(() => dailySeed());
    const shuffledCards = useMemo(
        () => balancedShuffle(statementCards, shuffleSeed),
        [statementCards, shuffleSeed]
    );

    // Track swiped cards for undo (current session only)
    const [swipedCards, setSwipedCards] = useState<
        { card: StatementCard; direction: SwipeDirection }[]
    >([]);

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
            startQuestionnaire();
            return;
        }

        markQuestionnaireActive();
    }, [markQuestionnaireActive, startQuestionnaire, surveyStatus]);

    const isLast = currentIndex >= shuffledCards.length - 1;

    const computeResults = useCallback(() => {
        // We get the absolutely latest answers from the store to avoid stale closures
        const currentAnswers = useSurveyStore.getState().answers;

        // Check if we have answers at all
        if (Object.keys(currentAnswers).length === 0) {
            return;
        }

        const matchingResult = computeMatching({
            answers: currentAnswers,
            cards: shuffledCards,
            candidates: candidates,
        });

        setResults(
            {
                surveyAnswers: currentAnswers,
                candidateRanking: matchingResult.candidateRanking,
                completedAt: new Date().toISOString(),
            },
            election?.dataVersion ?? "unknown"
        );
    }, [
        candidates,
        election,
        setResults,
        shuffledCards,
    ]);

    const handleSwipe = useCallback(
        (cardId: string, direction: SwipeDirection) => {
            if (direction !== "skip") {
                const optionId = `${cardId}-${direction}`;
                answerQuestion(cardId, optionId);
            }

            const card = shuffledCards.find((c) => c.id === cardId);
            if (card) {
                setSwipedCards((prev) => [...prev, { card, direction }]);
            }

            // Compute results seamlessly after state updates
            setTimeout(computeResults, 50);

            if (!isLast) {
                nextQuestion();
            } else {
                // Increment anyways so that the screen shows "finished" message
                nextQuestion();
            }
        },
        [
            answerQuestion,
            computeResults,
            isLast,
            nextQuestion,
            shuffledCards,
        ]
    );

    const handleUndo = useCallback(() => {
        if (currentIndex <= 0) return;

        const previousCard = shuffledCards[currentIndex - 1];
        if (!previousCard) return;

        setSwipedCards((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
        clearAnswer(previousCard.id);

        // recompute results
        setTimeout(computeResults, 50);
    }, [clearAnswer, currentIndex, shuffledCards, computeResults]);

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
                    Cartes Swipe terminées !
                </Text>
                <Text className="font-body text-text-body text-center mb-8">
                    Vous avez swipé toutes les cartes. Allez dans l'onglet Résultats pour voir vos matchs en détail.
                </Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-warm-white">
            <ProgressBar current={currentIndex} total={shuffledCards.length} />

            <SwipeStack
                cards={shuffledCards}
                currentIndex={currentIndex}
                onSwipe={handleSwipe}
                swipedCards={swipedCards}
                onUndo={handleUndo}
                onShowDescription={setSelectedCardId}
            />

            <View className="pb-6 px-6">
                <Text className="font-body text-xs text-text-caption text-center">
                    {t("survey:swipeInstruction")}
                </Text>
            </View>

            {!hasSeenTutorial && (
                <SwipeTutorialOverlay onDismiss={dismissTutorial} />
            )}

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
                                className="bg-civic-navy py-3.5 px-6 rounded-xl active:opacity-80 items-center"
                            >
                                <Text className="font-display-bold text-warm-white text-sm uppercase tracking-wider">
                                    Fermer
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
