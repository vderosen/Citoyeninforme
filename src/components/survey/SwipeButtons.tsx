import { View, Text } from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
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
    <View className="px-2 py-4 w-full" style={{ opacity: o }}>
      <View className="flex-row items-center justify-evenly w-full">
        {/* Double Red Cross (-2) */}
        <PressableScale
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onButtonPress("strongly_disagree");
          }}
          disabled={disabled}
          testID="btn-strongly-disagree"
          accessibilityRole="button"
          accessibilityLabel={t("swipeStronglyDisagree")}
          className="bg-white border-2 border-red-500 rounded-full items-center justify-center shadow-sm"
          style={{ width: 52, height: 52 }}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <View className="flex-row items-center" style={{ marginLeft: -4 }}>
            <Feather name="x" size={24} color="#EF4444" strokeWidth={3} style={{ marginRight: -12 }} />
            <Feather name="x" size={24} color="#EF4444" strokeWidth={3} />
          </View>
        </PressableScale>

        {/* Single Red Cross (-1) */}
        <PressableScale
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onButtonPress("disagree");
          }}
          disabled={disabled}
          testID="btn-disagree"
          accessibilityRole="button"
          accessibilityLabel={t("swipeDisagree")}
          className="bg-white border border-red-100 rounded-full items-center justify-center shadow-sm"
          style={{ width: 68, height: 68 }}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Feather name="x" size={32} color="#EF4444" strokeWidth={2.5} />
        </PressableScale>

        {/* Neutral Skip (0) */}
        <PressableScale
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onButtonPress("skip");
          }}
          disabled={disabled}
          testID="btn-skip"
          accessibilityRole="button"
          accessibilityLabel={t("swipeSkip")}
          className="bg-white border border-gray-200 rounded-full items-center justify-center shadow-sm"
          style={{ width: 48, height: 48 }}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Text style={{ fontSize: 20, transform: [{ translateY: -1 }] }}>🤷‍♂️</Text>
        </PressableScale>

        {/* Single Green Tick (+1) */}
        <PressableScale
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            onButtonPress("agree");
          }}
          disabled={disabled}
          testID="btn-agree"
          accessibilityRole="button"
          accessibilityLabel={t("swipeAgree")}
          className="bg-white border border-green-100 rounded-full items-center justify-center shadow-sm"
          style={{ width: 68, height: 68 }}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Feather name="check" size={32} color="#22C55E" strokeWidth={2.5} />
        </PressableScale>

        {/* Double Green Tick (+2) */}
        <PressableScale
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            onButtonPress("strongly_agree");
          }}
          disabled={disabled}
          testID="btn-strongly-agree"
          accessibilityRole="button"
          accessibilityLabel={t("swipeStronglyAgree")}
          className="bg-white border-2 border-green-500 rounded-full items-center justify-center shadow-sm"
          style={{ width: 52, height: 52 }}
          hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
        >
          <Ionicons name="checkmark-done" size={28} color="#22C55E" style={{ marginLeft: 2 }} />
        </PressableScale>
      </View>
    </View>
  );
}
