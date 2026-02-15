import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { useTranslation } from "react-i18next";
import { submitFeedback } from "../../services/feedback";

interface FeedbackActionProps {
  screen: "candidate" | "assistant" | "comparison" | "survey";
  entityId?: string;
}

type FeedbackType = "unclear" | "missing" | "general";

export function FeedbackAction({ screen, entityId }: FeedbackActionProps) {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    if (!selectedType) return;
    submitFeedback({
      screen,
      entityId: entityId ?? null,
      type: selectedType,
      text: text.trim() || null,
    });
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setSelectedType(null);
      setText("");
    }, 2000);
  };

  if (submitted) {
    return (
      <View className="py-3 px-4">
        <Text className="text-sm text-green-700 text-center">
          {t("feedbackThanks")}
        </Text>
      </View>
    );
  }

  if (!isOpen) {
    return (
      <Pressable
        onPress={() => setIsOpen(true)}
        className="py-3 px-4"
        style={{ minHeight: 44 }}
        accessibilityRole="button"
        accessibilityLabel={t("feedbackSignal")}
      >
        <Text className="text-sm text-blue-600 text-center">
          {t("feedbackSignal")}
        </Text>
      </Pressable>
    );
  }

  const feedbackTypes: { type: FeedbackType; label: string }[] = [
    { type: "unclear", label: t("feedbackUnclear") },
    { type: "missing", label: t("feedbackMissing") },
    { type: "general", label: t("feedbackGeneral") },
  ];

  return (
    <View className="py-3 px-4 bg-gray-50 rounded-lg">
      <View className="flex-row flex-wrap gap-2 mb-3">
        {feedbackTypes.map(({ type, label }) => (
          <Pressable
            key={type}
            onPress={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded-full border ${
              selectedType === type
                ? "bg-blue-100 border-blue-400"
                : "bg-white border-gray-300"
            }`}
            style={{ minHeight: 36 }}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedType === type }}
            accessibilityLabel={label}
          >
            <Text
              className={`text-sm ${
                selectedType === type ? "text-blue-700" : "text-gray-600"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        className="bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 mb-3"
        placeholder={t("feedbackPlaceholder")}
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={2}
        accessibilityLabel={t("feedbackPlaceholder")}
      />
      <View className="flex-row justify-end gap-2">
        <Pressable
          onPress={() => {
            setIsOpen(false);
            setSelectedType(null);
            setText("");
          }}
          className="px-4 py-2"
          style={{ minHeight: 44 }}
          accessibilityRole="button"
          accessibilityLabel={t("cancel")}
        >
          <Text className="text-sm text-gray-500">{t("cancel")}</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          className={`px-4 py-2 rounded-lg ${
            selectedType ? "bg-blue-600" : "bg-gray-300"
          }`}
          style={{ minHeight: 44 }}
          disabled={!selectedType}
          accessibilityRole="button"
          accessibilityLabel={t("feedbackSubmit")}
        >
          <Text
            className={`text-sm font-semibold ${
              selectedType ? "text-white" : "text-gray-500"
            }`}
          >
            {t("feedbackSubmit")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
