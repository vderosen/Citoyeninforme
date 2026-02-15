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
        <Text className="font-body text-sm text-signal-green text-center">
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
        <Text className="font-body-medium text-sm text-accent-coral-dark text-center">
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
    <View className="py-3 px-4 bg-warm-gray rounded-lg">
      <View className="flex-row flex-wrap gap-2 mb-3">
        {feedbackTypes.map(({ type, label }) => (
          <Pressable
            key={type}
            onPress={() => setSelectedType(type)}
            className={`px-3 py-1.5 rounded-full border ${
              selectedType === type
                ? "bg-accent-coral-light border-accent-coral"
                : "bg-warm-white border-warm-gray"
            }`}
            style={{ minHeight: 36 }}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedType === type }}
            accessibilityLabel={label}
          >
            <Text
              className={`font-body text-sm ${
                selectedType === type ? "text-civic-navy" : "text-text-body"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        className="bg-warm-white border border-warm-gray rounded-lg px-3 py-2 font-body text-sm text-text-body mb-3"
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
          <Text className="font-body text-sm text-text-caption">{t("cancel")}</Text>
        </Pressable>
        <Pressable
          onPress={handleSubmit}
          className={`px-4 py-2 rounded-lg ${
            selectedType ? "bg-accent-coral" : "bg-warm-gray"
          }`}
          style={{ minHeight: 44 }}
          disabled={!selectedType}
          accessibilityRole="button"
          accessibilityLabel={t("feedbackSubmit")}
        >
          <Text
            className={`font-body-medium text-sm ${
              selectedType ? "text-text-inverse" : "text-text-caption"
            }`}
          >
            {t("feedbackSubmit")}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
