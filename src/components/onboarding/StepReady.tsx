import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingStep } from "./OnboardingStep";
import { PressableScale } from "../ui/PressableScale";
import * as Haptics from "expo-haptics";

type EntryPointTarget = "survey" | "candidates" | "assistant";

interface StepReadyProps {
  onNext: () => void;
  onComplete: (target: EntryPointTarget) => void;
  currentStep: number;
  totalSteps: number;
}

export function StepReady({
  onComplete,
  currentStep,
  totalSteps,
}: StepReadyProps) {
  const { t } = useTranslation("onboarding");

  return (
    <OnboardingStep
      title={t("step5.title")}
      illustration={
        <Ionicons name="chatbubbles" size={72} color="#1B2A4A" />
      }
      ctaLabel={t("step5.cta")}
      onCtaPress={() => onComplete("survey")}
      currentStep={currentStep}
      totalSteps={totalSteps}
      hideCta
    >
      <Text className="font-body text-base text-text-body leading-6 mb-8">
        {t("step5.description")}
      </Text>

      {/* Primary CTA */}
      <PressableScale
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onComplete("survey");
        }}
        className="bg-civic-navy rounded-xl py-4 w-full items-center mb-4 shadow-sm"
        style={{ minHeight: 48 }}
        accessibilityRole="button"
        accessibilityLabel={t("step5.cta")}
      >
        <Text className="font-display-medium text-text-inverse text-base">
          {t("step5.cta")}
        </Text>
      </PressableScale>

      {/* Secondary links */}
      <Pressable
        onPress={() => onComplete("candidates")}
        className="py-3 items-center"
        accessibilityRole="button"
        accessibilityLabel={t("step5.secondary1")}
      >
        <Text className="font-display-medium text-base text-civic-navy">
          {t("step5.secondary1")}
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onComplete("assistant")}
        className="py-3 items-center"
        accessibilityRole="button"
        accessibilityLabel={t("step5.secondary2")}
      >
        <Text className="font-display-medium text-base text-civic-navy">
          {t("step5.secondary2")}
        </Text>
      </Pressable>

    </OnboardingStep>
  );
}
