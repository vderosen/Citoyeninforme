import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import type { SurveyQuestion } from "../../data/schema";
import Slider from "@react-native-community/slider";

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
      <Text className="text-sm text-gray-500 mb-2">
        {t("questionProgress", {
          current: currentIndex + 1,
          total: totalQuestions,
        })}
      </Text>

      <View className="w-full h-1 bg-gray-200 rounded-full mb-6">
        <View
          className="h-1 bg-blue-600 rounded-full"
          style={{
            width: `${((currentIndex + 1) / totalQuestions) * 100}%`,
          }}
        />
      </View>

      <Text
        className="text-xl font-semibold text-gray-900 mb-6"
        accessibilityRole="header"
      >
        {question.text}
      </Text>

      {question.options.map((option) => (
        <Pressable
          key={option.id}
          onPress={() => onSelectOption(option.id)}
          accessibilityRole="radio"
          accessibilityState={{ selected: selectedOptionId === option.id }}
          className={`p-4 mb-3 rounded-xl border-2 ${
            selectedOptionId === option.id
              ? "border-blue-600 bg-blue-50"
              : "border-gray-200 bg-white"
          }`}
          style={{ minHeight: 44 }}
        >
          <Text
            className={`text-base ${
              selectedOptionId === option.id
                ? "text-blue-800 font-medium"
                : "text-gray-700"
            }`}
          >
            {option.text}
          </Text>
        </Pressable>
      ))}

      <View className="mt-6 bg-gray-50 rounded-xl p-4">
        <Text className="text-sm font-medium text-gray-700 mb-2">
          {t("importanceLabel")}
        </Text>
        <View className="flex-row justify-between mb-1">
          <Text className="text-xs text-gray-400">{t("importanceLow")}</Text>
          <Text className="text-xs text-gray-400">{t("importanceHigh")}</Text>
        </View>
        <View className="h-10 justify-center">
          <View
            className="w-full h-2 bg-gray-300 rounded-full"
            accessibilityRole="adjustable"
            accessibilityLabel={t("importanceLabel")}
            accessibilityValue={{
              min: 0,
              max: 100,
              now: Math.round(importance * 100),
            }}
          >
            <View
              className="h-2 bg-blue-600 rounded-full"
              style={{ width: `${importance * 100}%` }}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
