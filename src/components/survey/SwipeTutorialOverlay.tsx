import { View, Text, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useMotionPreference } from "../../hooks/useMotionPreference";

interface SwipeTutorialOverlayProps {
  onDismiss: () => void;
}

const GESTURES: {
  i18nKey: string;
  actionKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}[] = [
    {
      i18nKey: "tutorialSwipeRight",
      actionKey: "swipeAgree",
      icon: "arrow-forward",
      color: "#16a34a",
    },
    {
      i18nKey: "tutorialSwipeLeft",
      actionKey: "swipeDisagree",
      icon: "arrow-back",
      color: "#dc2626",
    },
    {
      i18nKey: "tutorialButtonStrongAgree",
      actionKey: "swipeStronglyAgree",
      icon: "checkmark-done",
      color: "#16a34a",
    },
    {
      i18nKey: "tutorialButtonAgree",
      actionKey: "swipeAgree",
      icon: "checkmark",
      color: "#16a34a",
    },
    {
      i18nKey: "tutorialButtonSkip",
      actionKey: "swipeSkip",
      icon: "remove-outline",
      color: "#9ca3af",
    },
    {
      i18nKey: "tutorialButtonDisagree",
      actionKey: "swipeDisagree",
      icon: "close",
      color: "#dc2626",
    },
    {
      i18nKey: "tutorialButtonStrongDisagree",
      actionKey: "swipeStronglyDisagree",
      icon: "close-circle",
      color: "#dc2626",
    },
  ];

export function SwipeTutorialOverlay({ onDismiss }: SwipeTutorialOverlayProps) {
  const { t } = useTranslation("survey");
  const { shouldAnimate } = useMotionPreference();

  const entering = shouldAnimate ? FadeIn.duration(300) : undefined;

  return (
    <Animated.View
      entering={entering}
      accessibilityViewIsModal={true}
      className="absolute inset-0 z-50 items-center justify-center bg-black/60"
    >
      <View className="bg-white rounded-2xl mx-6 p-6 max-w-sm w-full">
        <Text className="font-heading text-lg text-civic-navy text-center mb-5">
          {t("tutorialTitle")}
        </Text>

        <View className="gap-4 mb-6">
          {GESTURES.map((gesture) => (
            <View key={gesture.i18nKey} className="flex-row items-center gap-3">
              <View
                className="w-8 h-8 rounded-full items-center justify-center"
                style={{ backgroundColor: `${gesture.color}15` }}
              >
                <Ionicons name={gesture.icon} size={18} color={gesture.color} />
              </View>
              <Text className="font-body text-sm text-civic-navy flex-1">
                <Text style={{ color: gesture.color }} className="font-semibold">
                  {t(gesture.i18nKey)}
                </Text>
                {" = "}
                {t(gesture.actionKey)}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel={t("tutorialDismiss")}
          className="bg-accent-coral rounded-xl py-3 items-center"
          style={{ minHeight: 48 }}
        >
          <Text className="font-heading text-base text-white">
            {t("tutorialDismiss")}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
