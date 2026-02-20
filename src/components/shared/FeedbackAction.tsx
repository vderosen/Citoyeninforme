import { useState } from "react";
import { View, Text, Pressable, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { submitFeedback } from "../../services/feedback";

interface FeedbackActionProps {
  screen: "candidate" | "assistant" | "comparison" | "survey";
  entityId?: string;
  /** Start with the form visible (skip the "Signaler" button). */
  initiallyOpen?: boolean;
  /** Called after successful submission or when user cancels (for modal usage). */
  onDone?: () => void;
}

type FeedbackType = "unclear" | "missing" | "general";

export function FeedbackAction({ screen, entityId, initiallyOpen = false, onDone }: FeedbackActionProps) {
  const { t } = useTranslation("common");
  const [isOpen, setIsOpen] = useState(initiallyOpen);
  const [selectedType, setSelectedType] = useState<FeedbackType | null>(null);
  const [text, setText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setSelectedType(null);
    setText("");
  };

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
      setSubmitted(false);
      reset();
      if (initiallyOpen) {
        onDone?.();
      } else {
        setIsOpen(false);
      }
    }, 1500);
  };

  if (submitted) {
    return (
      <View className="items-center py-6">
        <Ionicons name="checkmark-circle" size={32} color="#16A34A" />
        <Text className="mt-2 text-center font-body text-sm text-signal-green">
          {t("feedbackThanks")}
        </Text>
      </View>
    );
  }

  if (!isOpen) {
    return (
      <Pressable
        onPress={() => setIsOpen(true)}
        className="px-4 py-3"
        style={{ minHeight: 44 }}
        accessibilityRole="button"
        accessibilityLabel={t("feedbackSignal")}
      >
        <Text className="text-center font-body-medium text-sm text-accent-coral-dark">
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
    <View>
      <View className="mb-4 flex-row flex-wrap gap-2">
        {feedbackTypes.map(({ type, label }) => (
          <Pressable
            key={type}
            onPress={() => setSelectedType(type)}
            className={`rounded-full border px-4 py-2 ${
              selectedType === type
                ? "border-accent-coral bg-accent-coral-light"
                : "border-warm-gray bg-warm-white"
            }`}
            style={{ minHeight: 40 }}
            accessibilityRole="button"
            accessibilityState={{ selected: selectedType === type }}
            accessibilityLabel={label}
          >
            <Text
              className={`font-body-medium text-sm ${
                selectedType === type ? "text-civic-navy" : "text-text-body"
              }`}
            >
              {label}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        className="mb-4 rounded-xl border border-warm-gray bg-warm-white px-4 py-3 font-body text-sm text-text-body"
        placeholder={t("feedbackPlaceholder")}
        placeholderTextColor="#9CA3AF"
        value={text}
        onChangeText={setText}
        multiline
        numberOfLines={4}
        style={{ minHeight: 100, textAlignVertical: "top" }}
        accessibilityLabel={t("feedbackPlaceholder")}
      />
      <Pressable
        onPress={handleSubmit}
        className={`items-center rounded-xl py-3.5 ${
          selectedType ? "bg-civic-navy" : "bg-warm-gray"
        }`}
        style={{ minHeight: 48 }}
        disabled={!selectedType}
        accessibilityRole="button"
        accessibilityLabel={t("feedbackSubmit")}
      >
        <Text
          className={`font-display-semibold text-base ${
            selectedType ? "text-text-inverse" : "text-text-caption"
          }`}
        >
          {t("feedbackSubmit")}
        </Text>
      </Pressable>
    </View>
  );
}
