import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingStep } from "./OnboardingStep";

interface StepPurposeProps {
  onNext: () => void;
  onComplete: (target: "survey" | "candidates" | "assistant") => void;
  currentStep: number;
  totalSteps: number;
}

export function StepPurpose({
  onNext,
  currentStep,
  totalSteps,
}: StepPurposeProps) {
  const { t } = useTranslation("onboarding");

  return (
    <OnboardingStep
      title={t("step1.title")}
      illustration={
        <Ionicons name="search" size={72} color="#1B2A4A" />
      }
      ctaLabel={t("step1.cta")}
      onCtaPress={onNext}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <Text className="font-body text-base text-text-body leading-6">
        {t("step1.description")}
      </Text>
    </OnboardingStep>
  );
}
