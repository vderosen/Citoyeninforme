import { ReactNode } from "react";
import { View, Text, Pressable, ScrollView, useWindowDimensions } from "react-native";
import { useTranslation } from "react-i18next";

interface OnboardingStepProps {
  title: ReactNode;
  illustration?: ReactNode;
  children: ReactNode;
  ctaLabel: string;
  onCtaPress: () => void;
  currentStep: number;
  totalSteps: number;
  /** Hide the primary CTA (e.g., when step handles its own CTAs) */
  hideCta?: boolean;
}

const MAX_CONTENT_WIDTH = 480;

export function OnboardingStep({
  title,
  illustration,
  children,
  ctaLabel,
  onCtaPress,
  currentStep,
  totalSteps,
  hideCta,
}: OnboardingStepProps) {
  const { t } = useTranslation("onboarding");
  const { width } = useWindowDimensions();

  return (
    <View style={{ width }} className="flex-1 bg-warm-white">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 48,
          paddingBottom: 32,
          alignItems: "center",
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          className="flex-1 w-full"
          style={{ maxWidth: MAX_CONTENT_WIDTH }}
        >
          {/* Title */}
          <View className="mb-6">
            {typeof title === "string" ? (
              <Text
                className="font-display-bold text-3xl text-civic-navy"
                accessibilityRole="header"
              >
                {title}
              </Text>
            ) : (
              title
            )}
          </View>

          {/* Illustration */}
          {illustration && (
            <View className="mb-8 items-center">{illustration}</View>
          )}

          {/* Content */}
          <View className="flex-1">{children}</View>

          {/* Bottom section: CTA + progress */}
          <View className="mt-8 items-center">
            {!hideCta && (
              <Pressable
                onPress={onCtaPress}
                className="bg-accent-coral rounded-xl py-4 w-full items-center mb-4"
                style={{ minHeight: 48 }}
                accessibilityRole="button"
                accessibilityLabel={ctaLabel}
              >
                <Text className="font-display-medium text-text-inverse text-base">
                  {ctaLabel}
                </Text>
              </Pressable>
            )}

            <Text className="font-body text-sm text-text-caption">
              {t("progress", { current: currentStep, total: totalSteps })}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
