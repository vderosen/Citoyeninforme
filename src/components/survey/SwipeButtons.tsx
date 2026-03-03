import { View, useWindowDimensions } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import type { SwipeDirection } from "../../data/schema";
import { PressableScale } from "../ui/PressableScale";
import * as Haptics from "expo-haptics";
import { AppText as Text } from "../ui/AppText";

interface SwipeButtonsProps {
  onButtonPress: (direction: SwipeDirection) => void;
  disabled?: boolean;
}

interface ButtonVisualConfig {
  sideButtonSize: number;
  centerButtonSize: number;
  sideIconSize: number;
  centerIconSize: number;
  slotWidth: number;
  rowWidth: number;
  labelSize: number;
  dockPaddingHorizontal: number;
  dockPaddingVertical: number;
  dockRadius: number;
}

function getButtonVisualConfig(width: number): ButtonVisualConfig {
  const isSmallPhone = width <= 375;
  const isLargePhone = width >= 428;

  if (isSmallPhone) {
    return {
      sideButtonSize: 76,
      centerButtonSize: 64,
      sideIconSize: 34,
      centerIconSize: 30,
      slotWidth: 104,
      rowWidth: Math.min(width - 16, 346),
      labelSize: 12,
      dockPaddingHorizontal: 10,
      dockPaddingVertical: 12,
      dockRadius: 26,
    };
  }

  if (isLargePhone) {
    return {
      sideButtonSize: 92,
      centerButtonSize: 78,
      sideIconSize: 42,
      centerIconSize: 37,
      slotWidth: 132,
      rowWidth: Math.min(width - 16, 430),
      labelSize: 14,
      dockPaddingHorizontal: 14,
      dockPaddingVertical: 14,
      dockRadius: 30,
    };
  }

  return {
    sideButtonSize: 84,
    centerButtonSize: 70,
    sideIconSize: 38,
    centerIconSize: 33,
    slotWidth: 120,
    rowWidth: Math.min(width - 16, 390),
    labelSize: 13,
    dockPaddingHorizontal: 12,
    dockPaddingVertical: 13,
    dockRadius: 28,
  };
}

export function SwipeButtons({ onButtonPress, disabled }: SwipeButtonsProps) {
  const { t } = useTranslation("survey");
  const { width } = useWindowDimensions();
  const o = disabled ? 0.5 : 1;
  const visual = getButtonVisualConfig(width);

  return (
    <View className="w-full px-2 pt-3 pb-2" style={{ opacity: o }}>
      <View
        className="self-center"
        style={{
          width: visual.rowWidth,
          borderRadius: visual.dockRadius,
          paddingHorizontal: visual.dockPaddingHorizontal,
          paddingVertical: visual.dockPaddingVertical,
        }}
      >
        <View className="flex-row items-start justify-between">
          <View className="items-center" style={{ width: visual.slotWidth }}>
            <PressableScale
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onButtonPress("disagree");
              }}
              disabled={disabled}
              testID="btn-disagree"
              accessibilityRole="button"
              accessibilityLabel={t("swipeDisagree")}
              className="rounded-full items-center justify-center border-2 border-red-300"
              style={{
                width: visual.sideButtonSize,
                height: visual.sideButtonSize,
                backgroundColor: "#FFF1F2",
              }}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              ensureMinTouchTarget
            >
              <Feather name="x" size={visual.sideIconSize} color="#EF4444" strokeWidth={2.8} />
            </PressableScale>
            <Text
              className="font-display-medium text-text-caption mt-2 text-center"
              maxFontSizeMultiplier={1.1}
              style={{ fontSize: visual.labelSize }}
            >
              {t("swipeDisagree")}
            </Text>
          </View>

          <View className="items-center" style={{ width: visual.slotWidth }}>
            <PressableScale
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onButtonPress("skip");
              }}
              disabled={disabled}
              testID="btn-skip"
              accessibilityRole="button"
              accessibilityLabel={t("swipeSkip")}
              className="items-center justify-center"
              style={{
                width: visual.centerButtonSize,
                height: visual.centerButtonSize,
              }}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              ensureMinTouchTarget
            >
              <Text allowFontScaling={false} style={{ fontSize: visual.centerIconSize, lineHeight: visual.centerIconSize + 2 }}>
                🤷‍♂️
              </Text>
            </PressableScale>
            <Text
              className="font-display-medium text-text-caption mt-2 text-center"
              maxFontSizeMultiplier={1.1}
              style={{ fontSize: visual.labelSize }}
            >
              {t("swipeSkip")}
            </Text>
          </View>

          <View className="items-center" style={{ width: visual.slotWidth }}>
            <PressableScale
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                onButtonPress("agree");
              }}
              disabled={disabled}
              testID="btn-agree"
              accessibilityRole="button"
              accessibilityLabel={t("swipeAgree")}
              className="rounded-full items-center justify-center border-2 border-green-300"
              style={{
                width: visual.sideButtonSize,
                height: visual.sideButtonSize,
                backgroundColor: "#F0FDF4",
              }}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
              ensureMinTouchTarget
            >
              <Feather name="check" size={visual.sideIconSize} color="#16A34A" strokeWidth={2.8} />
            </PressableScale>
            <Text
              className="font-display-medium text-text-caption mt-2 text-center"
              maxFontSizeMultiplier={1.1}
              style={{ fontSize: visual.labelSize }}
            >
              {t("swipeAgree")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
