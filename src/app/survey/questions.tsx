import { View, Text, Pressable, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { useTranslation } from "react-i18next";
import { SafeAreaView } from "react-native-safe-area-context";
import { useElectionStore } from "../../stores/election";
import { useSurveyStore } from "../../stores/survey";
import { QuestionCard } from "../../components/survey/QuestionCard";
import { ProgressBar } from "../../components/survey/ProgressBar";
import { computeMatching } from "../../services/matching";
import { detectContradictions } from "../../services/contradiction";
import type { CandidatePositions } from "../../services/matching";

export default function QuestionsScreen() {
  const { t } = useTranslation(["survey", "common"]);
  const router = useRouter();
  const election = useElectionStore((s) => s.election);
  const surveyQuestions = useElectionStore((s) => s.surveyQuestions);
  const positions = useElectionStore((s) => s.positions);
  const candidates = useElectionStore((s) => s.candidates);
  const themes = useElectionStore((s) => s.themes);

  const currentIndex = useSurveyStore((s) => s.currentQuestionIndex);
  const answers = useSurveyStore((s) => s.answers);
  const importanceWeights = useSurveyStore((s) => s.importanceWeights);
  const answerQuestion = useSurveyStore((s) => s.answerQuestion);
  const setImportanceWeight = useSurveyStore((s) => s.setImportanceWeight);
  const nextQuestion = useSurveyStore((s) => s.nextQuestion);
  const previousQuestion = useSurveyStore((s) => s.previousQuestion);
  const setComputing = useSurveyStore((s) => s.setComputing);
  const setResults = useSurveyStore((s) => s.setResults);

  const currentQuestion = surveyQuestions[currentIndex];
  const isLast = currentIndex === surveyQuestions.length - 1;
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : null;

  const handleNext = () => {
    if (isLast) {
      setComputing();
      computeResults();
    } else {
      nextQuestion();
    }
  };

  const computeResults = () => {
    // Build candidate position scores from actual positions
    const candidatePositions: CandidatePositions[] = candidates.map((c) => {
      const positionScores: Record<string, number> = {};
      for (const theme of themes) {
        const position = positions.find(
          (p) => p.candidateId === c.id && p.themeId === theme.id
        );
        // Simple heuristic: position exists = positive score, no position = neutral
        positionScores[theme.id] = position ? 1 : 0;
      }
      return { candidateId: c.id, positionScores };
    });

    const questionDefs = surveyQuestions.map((q) => ({
      id: q.id,
      themeIds: q.themeIds,
      options: q.options.map((o) => ({
        id: o.id,
        themeScores: o.themeScores,
      })),
    }));

    const matchingResult = computeMatching({
      answers,
      importanceWeights,
      questions: questionDefs,
      candidates: candidatePositions,
    });

    const contradictions = detectContradictions(
      matchingResult.themeScores,
      answers,
      surveyQuestions
    );

    setResults(
      {
        surveyAnswers: answers,
        themeScores: matchingResult.themeScores,
        importanceWeights,
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
  };

  if (!currentQuestion) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">{t("common:loading")}</Text>
      </SafeAreaView>
    );
  }

  const primaryThemeId = currentQuestion.themeIds[0];

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ProgressBar current={currentIndex} total={surveyQuestions.length} />
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        <QuestionCard
          question={currentQuestion}
          selectedOptionId={currentAnswer ?? null}
          importance={importanceWeights[primaryThemeId] ?? 0.5}
          onSelectOption={(optionId) =>
            answerQuestion(currentQuestion.id, optionId)
          }
          onSetImportance={(value) =>
            setImportanceWeight(primaryThemeId, value)
          }
          currentIndex={currentIndex}
          totalQuestions={surveyQuestions.length}
        />
      </ScrollView>

      <View className="flex-row justify-between px-6 pb-6">
        {currentIndex > 0 ? (
          <Pressable
            onPress={previousQuestion}
            accessibilityRole="button"
            accessibilityLabel={t("common:back")}
            className="bg-gray-200 rounded-xl py-3 px-6"
            style={{ minHeight: 44 }}
          >
            <Text className="text-gray-700 font-medium">
              {t("common:back")}
            </Text>
          </Pressable>
        ) : (
          <View />
        )}

        <Pressable
          onPress={handleNext}
          accessibilityRole="button"
          accessibilityLabel={isLast ? t("common:confirm") : t("common:next")}
          className={`rounded-xl py-3 px-6 ${
            currentAnswer ? "bg-blue-600" : "bg-gray-300"
          }`}
          disabled={!currentAnswer}
          style={{ minHeight: 44 }}
        >
          <Text
            className={`font-medium ${
              currentAnswer ? "text-white" : "text-gray-500"
            }`}
          >
            {isLast ? t("common:confirm") : t("common:next")}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
