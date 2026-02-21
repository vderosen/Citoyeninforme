import { useState, useMemo, useCallback, useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { SwipeStack } from "../../components/survey/SwipeStack";
import { SwipeTutorialOverlay } from "../../components/survey/SwipeTutorialOverlay";
import { ProgressBar } from "../../components/survey/ProgressBar";
import { computeMatching } from "../../services/matching";
import { detectContradictions } from "../../services/contradiction";
import {
  statementCardsToQuestionDefs,
  statementCardsToSurveyQuestions,
} from "../../services/swipe-adapter";
import { deterministicShuffle, dailySeed } from "../../utils/shuffle";
import type { CandidatePositions } from "../../services/matching";
import type { SwipeDirection, StatementCard } from "../../data/schema";

export default function QuestionsScreen() {
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
  const answers = useSurveyStore((s) => s.answers);
  const startQuestionnaire = useSurveyStore((s) => s.startQuestionnaire);
  const markQuestionnaireActive = useSurveyStore(
    (s) => s.markQuestionnaireActive
  );
  const answerQuestion = useSurveyStore((s) => s.answerQuestion);
  const nextQuestion = useSurveyStore((s) => s.nextQuestion);
  const clearAnswer = useSurveyStore((s) => s.clearAnswer);
  const setComputing = useSurveyStore((s) => s.setComputing);
  const setResults = useSurveyStore((s) => s.setResults);

  // Shuffle cards once per session using a deterministic seed
  const [shuffleSeed] = useState(() => dailySeed());
  const shuffledCards = useMemo(
    () => deterministicShuffle(statementCards, shuffleSeed),
    [statementCards, shuffleSeed]
  );

  // Track swiped cards for undo (current session only)
  const [swipedCards, setSwipedCards] = useState<
    { card: StatementCard; direction: SwipeDirection }[]
  >([]);

  useEffect(() => {
    if (surveyStatus === "questionnaire") return;
    if (surveyStatus === "computing" || surveyStatus === "results_ready") {
      return;
    }

    if (surveyStatus === "not_started" || surveyStatus === "completed") {
      startQuestionnaire();
      return;
    }

    markQuestionnaireActive();
  }, [markQuestionnaireActive, startQuestionnaire, surveyStatus]);

  const isLast = currentIndex >= shuffledCards.length - 1;

  const computeResults = useCallback(() => {
    const candidatePositions: CandidatePositions[] = candidates.map((c) => {
      const positionScores: Record<string, number> = {};
      for (const theme of themes) {
        const position = positions.find(
          (p) => p.candidateId === c.id && p.themeId === theme.id
        );
        positionScores[theme.id] = position ? 1 : 0;
      }
      return { candidateId: c.id, positionScores };
    });

    const questionDefs = statementCardsToQuestionDefs(shuffledCards);

    const matchingResult = computeMatching({
      answers,
      importanceWeights: {},
      questions: questionDefs,
      candidates: candidatePositions,
    });

    const adaptedSurveyQuestions =
      statementCardsToSurveyQuestions(shuffledCards);
    const contradictions = detectContradictions(
      matchingResult.themeScores,
      answers,
      adaptedSurveyQuestions
    );

    setResults(
      {
        surveyAnswers: answers,
        themeScores: matchingResult.themeScores,
        importanceWeights: {},
        contradictions: contradictions.map((c) => ({
          themeA: c.themeA,
          themeB: c.themeB,
          description: c.description,
          severity: c.severity,
        })),
        candidateRanking: matchingResult.candidateRanking.map((r) => ({
          candidateId: r.candidateId,
          alignmentScore: r.alignmentScore,
          justification: r.themeBreakdown.map((tb) => ({
            themeId: tb.themeId,
            alignment: tb.alignment,
            weight: tb.weightedContribution,
          })),
        })),
        completedAt: new Date().toISOString(),
      },
      election?.dataVersion ?? "unknown"
    );

    router.replace("/survey/results");
  }, [
    answers,
    candidates,
    election,
    positions,
    router,
    setResults,
    shuffledCards,
    themes,
  ]);

  const handleSwipe = useCallback(
    (cardId: string, direction: SwipeDirection) => {
      // Skip: advance without recording an answer (no score impact)
      if (direction !== "skip") {
        const optionId = `${cardId}-${direction}`;
        answerQuestion(cardId, optionId);
      }

      const card = shuffledCards.find((c) => c.id === cardId);
      if (card) {
        setSwipedCards((prev) => [...prev, { card, direction }]);
      }

      if (isLast) {
        setComputing();
        // Delay to allow state update before computing
        setTimeout(computeResults, 50);
      } else {
        nextQuestion();
      }
    },
    [
      answerQuestion,
      computeResults,
      isLast,
      nextQuestion,
      setComputing,
      shuffledCards,
    ]
  );

  const handleUndo = useCallback(() => {
    if (currentIndex <= 0) return;

    const previousCard = shuffledCards[currentIndex - 1];
    if (!previousCard) return;

    setSwipedCards((prev) => (prev.length > 0 ? prev.slice(0, -1) : prev));
    clearAnswer(previousCard.id);
  }, [clearAnswer, currentIndex, shuffledCards]);

  if (shuffledCards.length === 0) {
    return (
      <View className="flex-1 items-center justify-center bg-warm-white">
        <Text className="font-body text-text-caption">
          {t("common:loading")}
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
      />

      {/* Swipe instruction */}
      <View className="pb-6 px-6">
        <Text className="font-body text-xs text-text-caption text-center">
          {t("survey:swipeInstruction")}
        </Text>
      </View>

      {/* First-launch tutorial overlay */}
      {!hasSeenTutorial && (
        <SwipeTutorialOverlay onDismiss={dismissTutorial} />
      )}
    </View>
  );
}
