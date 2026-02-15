import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { PressableScale } from "../ui/PressableScale";
import type { SurveyQuestion } from "../../data/schema";

interface Props {
  question: SurveyQuestion;
  selectedOptionId: string | null;
  importance: number;
  onSelectOption: (optionId: string) => void;
  onSetImportance: (value: number) => void;
  currentIndex: number;
  totalQuestions: number;
}

export function QuestionCard({
  question,
  selectedOptionId,
  importance,
  onSelectOption,
  onSetImportance,
  currentIndex,
  totalQuestions,
}: Props) {
  const { t } = useTranslation("survey");

  return (
    <View className="px-4">
      <Text
        className="font-display-bold text-xl text-civic-navy mb-6 leading-snug"
        accessibilityRole="header"
      >
        {question.text}
      </Text>

      {question.options.map((option) => {
        const isSelected = selectedOptionId === option.id;
        return (
          <PressableScale
            key={option.id}
            onPress={() => onSelectOption(option.id)}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            className={`p-4 mb-3 rounded-xl border-2 ${
              isSelected
                ? "border-accent-coral bg-accent-coral-light"
                : "border-warm-gray bg-warm-white"
            }`}
            style={{ minHeight: 48 }}
          >
            <Text
              className={`font-body text-base ${
                isSelected
                  ? "text-civic-navy font-body-medium"
                  : "text-text-body"
              }`}
            >
              {option.text}
            </Text>
          </PressableScale>
        );
      })}

      <View className="mt-6 bg-warm-gray rounded-xl p-4">
        <Text className="font-body-medium text-sm text-civic-navy mb-2">
          {t("importanceLabel")}
        </Text>
        <View className="flex-row justify-between mb-1">
          <Text className="font-body text-xs text-text-caption">{t("importanceLow")}</Text>
          <Text className="font-body text-xs text-text-caption">{t("importanceHigh")}</Text>
        </View>
        <View className="h-10 justify-center">
          <View
            className="w-full h-2 bg-warm-white rounded-full"
            accessibilityRole="adjustable"
            accessibilityLabel={t("importanceLabel")}
            accessibilityValue={{
              min: 0,
              max: 100,
              now: Math.round(importance * 100),
            }}
          >
            <View
              className="h-2 bg-accent-coral rounded-full"
              style={{ width: `${importance * 100}%` }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
