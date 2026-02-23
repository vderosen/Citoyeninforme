import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { SwipeDirection } from "../../data/schema";
import { PressableScale } from "../ui/PressableScale";
import * as Haptics from "expo-haptics";

interface SwipeButtonsProps {
  onButtonPress: (direction: SwipeDirection) => void;
  disabled?: boolean;
}

export function SwipeButtons({ onButtonPress, disabled }: SwipeButtonsProps) {
  const { t } = useTranslation("survey");
  const o = disabled ? 0.5 : 1;

  return (
    <View className="px-4 py-4" style={{ opacity: o }}>
      <View className="flex-row items-center justify-between w-full">
        {/* Double Red Cross (-2) */}
        <PressableScale
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onButtonPress("strongly_disagree");
          }}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeStronglyDisagree")}
          className="bg-red-50 border-2 border-red-200 rounded-full items-center justify-center shadow-sm"
          style={{ width: 56, height: 56 }}
        >
          <View className="flex-row items-center" style={{ marginLeft: -4 }}>
            <Ionicons name="close" size={24} color="#E84855" style={{ marginRight: -12 }} />
            <Ionicons name="close" size={24} color="#E84855" />
          </View>
        </PressableScale>

        {/* Single Red Cross (-1) -> Slightly bigger */}
        <PressableScale
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onButtonPress("disagree");
          }}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeDisagree")}
          className="bg-red-50 border-2 border-red-200 rounded-full items-center justify-center shadow-card"
          style={{ width: 72, height: 72 }}
        >
          <Ionicons name="close" size={36} color="#E84855" />
        </PressableScale>

        {/* Neutral Skip (0) */}
        <PressableScale
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onButtonPress("skip");
          }}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeSkip")}
          className="bg-gray-50 border-2 border-gray-200 rounded-full items-center justify-center shadow-sm"
          style={{ width: 56, height: 56 }}
        >
          <Text style={{ fontSize: 26, transform: [{ translateY: -1 }] }}>🤷‍♂️</Text>
        </PressableScale>

        {/* Single Green Tick (+1) -> Slightly bigger */}
        <PressableScale
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onButtonPress("agree");
          }}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeAgree")}
          className="bg-green-50 border-2 border-green-200 rounded-full items-center justify-center shadow-card"
          style={{ width: 72, height: 72 }}
        >
          <Ionicons name="checkmark" size={36} color="#4CAF83" />
        </PressableScale>

        {/* Double Green Tick (+2) */}
        <PressableScale
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onButtonPress("strongly_agree");
          }}
          disabled={disabled}
          accessibilityRole="button"
          accessibilityLabel={t("swipeStronglyAgree")}
          className="bg-green-50 border-2 border-green-200 rounded-full items-center justify-center shadow-sm"
          style={{ width: 56, height: 56 }}
        >
          <Ionicons name="checkmark-done" size={28} color="#4CAF83" />
        </PressableScale>
      </View>
    </View>
  );
}
