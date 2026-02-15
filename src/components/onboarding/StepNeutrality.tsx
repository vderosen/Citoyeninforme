import { View, Text } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { OnboardingStep } from "./OnboardingStep";

interface StepNeutralityProps {
  onNext: () => void;
  onComplete: (target: "survey" | "candidates" | "assistant") => void;
  currentStep: number;
  totalSteps: number;
}

export function StepNeutrality({
  onNext,
  currentStep,
  totalSteps,
}: StepNeutralityProps) {
  const { t } = useTranslation("onboarding");

  const bullets = [
    t("step2.bullet1"),
    t("step2.bullet2"),
    t("step2.bullet3"),
  ];

  return (
    <OnboardingStep
      title={t("step2.title")}
      illustration={
        <Ionicons name="shield-checkmark" size={72} color="#1B2A4A" />
      }
      ctaLabel={t("step2.cta")}
      onCtaPress={onNext}
      currentStep={currentStep}
      totalSteps={totalSteps}
    >
      <View className="gap-4">
        {bullets.map((text, i) => (
          <View key={i} className="flex-row items-start gap-3">
            <Ionicons
              name="checkmark-circle"
              size={20}
              color="#16A34A"
              style={{ marginTop: 2 }}
            />
            <Text className="font-body text-base text-text-body flex-1 leading-6">
              {text}
            </Text>
          </View>
        ))}
      </View>
    </OnboardingStep>
  );
}
