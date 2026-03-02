import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useCallback,
  useState,
  useEffect,
} from "react";
import {
  View,
  Text,
  Pressable,
  useWindowDimensions,
  type LayoutChangeEvent,
  type TextLayoutEventData,
  type NativeSyntheticEvent,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolate,
  Extrapolation,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useMotionPreference } from "../../hooks/useMotionPreference";
import { SwipeOverlay } from "./SwipeOverlay";
import { getCategoryTheme } from "../../utils/categoryTheme";
import { useSwipeAnimation, detectDirection } from "../../hooks/useSwipeAnimation";
import type { StatementCard, SwipeDirection } from "../../data/schema";

const DOUBLE_TAP_DELAY = 350;

export interface SwipeCardHandle {
  triggerSwipe: (direction: SwipeDirection) => void;
}

interface SwipeCardProps {
  card: StatementCard;
  onSwipe: (cardId: string, direction: SwipeDirection, isX2Enabled: boolean) => void;
  onShowDescription?: () => void;
  isTop: boolean;
  cardHeight: number;
  isX2Enabled: boolean;
  onToggleX2?: () => void;
}

function getMaxTitleFontSize(isTabletLayout: boolean, isLargePhone: boolean, isSmallPhone: boolean): number {
  if (isTabletLayout) return 28;
  if (isLargePhone) return 22;
  if (isSmallPhone) return 20;
  return 21;
}

function getAbsoluteMinTitleFontSize(
  isTabletLayout: boolean,
  isLargePhone: boolean,
  isSmallPhone: boolean,
): number {
  if (isTabletLayout) return 18;
  if (isLargePhone) return 15;
  if (isSmallPhone) return 13;
  return 14;
}

export const SwipeCard = forwardRef<SwipeCardHandle, SwipeCardProps>(
  function SwipeCard(
    { card, onSwipe, onShowDescription, isTop, cardHeight, isX2Enabled, onToggleX2 },
    ref
  ) {
    const { t } = useTranslation("survey");
    const { width, height } = useWindowDimensions();
    const isTabletLayout = width >= 768;
    const isLargePhone = width >= 428;
    const isSmallPhone = width <= 375;
    const { shouldAnimate } = useMotionPreference();
    const lastTapTime = useRef(0);
    const fitLowerBoundRef = useRef(0);
    const fitUpperBoundRef = useRef(0);
    const sideInset = isTabletLayout ? 14 : 32;
    const statementHorizontalPadding = isTabletLayout ? 40 : 28;
    const statementTopPadding = isTabletLayout ? 36 : 20;
    const statementBottomPadding = isTabletLayout ? 28 : isLargePhone ? 18 : 14;
    const absoluteMinTitleFontSize = getAbsoluteMinTitleFontSize(
      isTabletLayout,
      isLargePhone,
      isSmallPhone,
    );
    const deviceMaxTitleFontSize = getMaxTitleFontSize(
      isTabletLayout,
      isLargePhone,
      isSmallPhone,
    );
    const maxTitleFontSize = deviceMaxTitleFontSize;
    const [titleAreaHeight, setTitleAreaHeight] = useState(0);
    const [titleAreaWidth, setTitleAreaWidth] = useState(0);
    const [statementFontSize, setStatementFontSize] = useState(absoluteMinTitleFontSize);
    const availableTitleTextWidth = Math.max(
      1,
      titleAreaWidth - statementHorizontalPadding * 2 - 2,
    );
    const availableTitleTextHeight = Math.max(
      1,
      titleAreaHeight - statementTopPadding - statementBottomPadding,
    );

    const handleSwipe = useCallback(
      (direction: SwipeDirection) => {
        onSwipe(card.id, direction, isX2Enabled);
      },
      [card.id, isX2Enabled, onSwipe]
    );

    const {
      translateX,
      translateY,
      opacity,
      scale,
      skipProgress,
      isAnimatingOut,
      animateButtonExit,
      animateGestureExit,
    } = useSwipeAnimation({
      shouldAnimate,
      width,
      height,
      onCompleteSwipe: handleSwipe,
    });

    const triggerSkip = useCallback(() => {
      animateButtonExit("skip");
    }, [animateButtonExit]);

    const handleCardPress = useCallback(() => {
      const now = Date.now();
      if (now - lastTapTime.current < DOUBLE_TAP_DELAY) {
        lastTapTime.current = 0;
        triggerSkip();
      } else {
        lastTapTime.current = now;
      }
    }, [triggerSkip]);

    useImperativeHandle(ref, () => ({
      triggerSwipe(direction: SwipeDirection) {
        animateButtonExit(direction);
      },
    }));

    const panGesture = Gesture.Pan()
      .enabled(isTop)
      .onUpdate((event) => {
        if (isAnimatingOut.value) return;
        translateX.value = event.translationX;
        translateY.value = event.translationY * 0.1;
      })
      .onEnd((event) => {
        if (isAnimatingOut.value) return;
        const direction = detectDirection(
          event.translationX,
          event.velocityX
        );

        if (direction) {
          animateGestureExit(direction);
        } else {
          translateX.value = withSpring(0, { damping: 20, stiffness: 200 });
          translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
        }
      });

    const cardStyle = useAnimatedStyle(() => {
      if (!shouldAnimate) {
        return {
          transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
            { scale: scale.value },
          ],
          opacity: opacity.value,
        };
      }

      const rotation = interpolate(
        translateX.value,
        [-width, 0, width],
        [-20, 0, 20],
        Extrapolation.CLAMP
      );

      return {
        transform: [
          { translateX: translateX.value },
          { translateY: translateY.value },
          { rotate: `${rotation}deg` },
          { scale: scale.value },
        ],
        opacity: opacity.value,
      };
    });

    useEffect(() => {
      fitLowerBoundRef.current = absoluteMinTitleFontSize;
      fitUpperBoundRef.current = maxTitleFontSize;
      setStatementFontSize(absoluteMinTitleFontSize);
    }, [
      absoluteMinTitleFontSize,
      card.id,
      card.text,
      maxTitleFontSize,
    ]);

    const handleStatementContainerLayout = useCallback(
      (event: LayoutChangeEvent) => {
        const { height: nextHeight, width: nextWidth } = event.nativeEvent.layout;
        if (nextHeight > 0) {
          setTitleAreaHeight((previousHeight) =>
            Math.abs(previousHeight - nextHeight) > 1 ? nextHeight : previousHeight,
          );
        }
        if (nextWidth > 0) {
          setTitleAreaWidth((previousWidth) =>
            Math.abs(previousWidth - nextWidth) > 1 ? nextWidth : previousWidth,
          );
        }
      },
      [],
    );

    const handleStatementTextLayout = useCallback(
      (event: NativeSyntheticEvent<TextLayoutEventData>) => {
        if (!titleAreaHeight || !titleAreaWidth) return;
        const { lines } = event.nativeEvent;
        if (!lines.length) return;

        const lastLine = lines[lines.length - 1];
        const textHeight = lastLine.y + lastLine.height;
        const widestLine = lines.reduce(
          (max, line) => Math.max(max, line.width ?? 0),
          0,
        );
        const hasVerticalOverflow = textHeight > availableTitleTextHeight + 1;
        const hasHorizontalOverflow = widestLine > availableTitleTextWidth + 1;
        const hasOverflow = hasVerticalOverflow || hasHorizontalOverflow;
        const currentLowerBound = fitLowerBoundRef.current;
        const currentUpperBound = fitUpperBoundRef.current;

        if (hasOverflow) {
          fitUpperBoundRef.current = Math.max(
            absoluteMinTitleFontSize,
            Math.min(currentUpperBound, statementFontSize - 1),
          );
        } else {
          fitLowerBoundRef.current = Math.max(currentLowerBound, statementFontSize);
        }

        if (fitLowerBoundRef.current >= fitUpperBoundRef.current) {
          const resolvedFontSize = fitLowerBoundRef.current;
          if (resolvedFontSize !== statementFontSize) {
            setStatementFontSize(resolvedFontSize);
          }
          return;
        }

        const nextFontSize = Math.ceil(
          (fitLowerBoundRef.current + fitUpperBoundRef.current + 1) / 2,
        );
        if (nextFontSize !== statementFontSize) {
          setStatementFontSize(nextFontSize);
        }
      },
      [
        absoluteMinTitleFontSize,
        availableTitleTextHeight,
        availableTitleTextWidth,
        statementFontSize,
        titleAreaHeight,
        titleAreaWidth,
      ],
    );

    const theme = getCategoryTheme(card.category || 'Autre');
    const x2ButtonSize = isTabletLayout ? 50 : isLargePhone ? 48 : 44;
    const x2ValueSize = isTabletLayout ? 17 : isLargePhone ? 16 : 15;
    const x2PrefixSize = isTabletLayout ? 14 : isLargePhone ? 13 : 12;

    return (
      <View style={{ width: "100%", position: "absolute", zIndex: isTop ? 10 : 0 }}>
        {titleAreaWidth > 0 && titleAreaHeight > 0 && (
          <View
            pointerEvents="none"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: availableTitleTextWidth,
              opacity: 0,
              zIndex: -1,
            }}
          >
            <Text
              className="font-display-bold"
              onTextLayout={handleStatementTextLayout}
              allowFontScaling={false}
              style={{
                fontSize: statementFontSize,
                width: availableTitleTextWidth,
                color: "transparent",
              }}
            >
              {card.text}
            </Text>
          </View>
        )}
        <GestureDetector gesture={panGesture}>
          <Animated.View
            testID={isTop ? 'active-card' : `swipe-card-${card.id}`}
            style={[
              cardStyle,
              {
                position: "absolute",
                width: "100%",
                zIndex: isTop ? 10 : 0,
              },
            ]}
          >
            <Pressable onPress={isTop ? handleCardPress : undefined}>
              {/* Fake card stacks in the background - only show for !isTop (the next card) */}
              {!isTop && (
                <>
                  <View
                    className="absolute inset-0 rounded-3xl shadow-sm"
                    style={{
                      marginHorizontal: sideInset,
                      backgroundColor: "#E2E8F0",
                      transform: [{ translateX: 14 }, { translateY: -14 }],
                      zIndex: -2
                    }}
                  />
                  <View
                    className="absolute inset-0 rounded-3xl shadow-sm"
                    style={{
                      marginHorizontal: sideInset,
                      backgroundColor: "#F1F5F9",
                      transform: [{ translateX: 7 }, { translateY: -7 }],
                      zIndex: -1
                    }}
                  />
                </>
              )}
              {/* Main Card */}
              <View
                className="overflow-hidden rounded-3xl shadow-elevated border border-warm-gray/40"
                style={{
                  backgroundColor: theme.bg,
                  marginHorizontal: sideInset,
                  height: cardHeight,
                  minHeight: cardHeight,
                }}
              >
                {/* Category Badge Top Left */}
                <View
                  className="flex-row items-center justify-between"
                  style={{
                    paddingTop: isTabletLayout ? 28 : 24,
                    paddingHorizontal: isTabletLayout ? 28 : 24,
                  }}
                >
                  <View
                    style={{ backgroundColor: 'white' }}
                    className="flex-row items-center self-start px-3 py-1.5 rounded-full shadow-sm"
                  >
                    <Ionicons
                      name={theme.icon as any}
                      size={isTabletLayout ? 18 : 14}
                      color={theme.bg}
                    />
                    <Text
                      className="ml-1.5 font-display-bold uppercase tracking-widest"
                      style={{ color: theme.bg, fontSize: isTabletLayout ? 13 : 12 }}
                    >
                      {card.category}
                    </Text>
                  </View>

                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      onToggleX2?.();
                    }}
                    disabled={!isTop || !onToggleX2}
                    accessibilityRole="button"
                    accessibilityLabel={t("swipeX2Toggle")}
                    accessibilityState={{
                      selected: isX2Enabled,
                      disabled: !isTop || !onToggleX2,
                    }}
                    className="rounded-full items-center justify-center border"
                    style={{
                      width: x2ButtonSize,
                      height: x2ButtonSize,
                      borderColor: "rgba(255,255,255,0.85)",
                      backgroundColor: isX2Enabled ? "white" : "transparent",
                      opacity: isTop ? 1 : 0.7,
                    }}
                    hitSlop={12}
                  >
                    <Text
                      className="font-display-bold"
                      style={{
                        color: isX2Enabled ? theme.bg : "white",
                        fontSize: x2ValueSize,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: x2PrefixSize,
                          opacity: 0.95,
                        }}
                      >
                        x
                      </Text>
                      2
                    </Text>
                  </Pressable>
                </View>

                {/* Statement text */}
                <View
                  className="flex-1 justify-start"
                  onLayout={handleStatementContainerLayout}
                  style={{
                    paddingHorizontal: statementHorizontalPadding,
                    paddingTop: statementTopPadding,
                    paddingBottom: statementBottomPadding,
                  }}
                >
                  <Text
                    className="font-display-bold"
                    allowFontScaling={false}
                    style={{
                      color: "white",
                      fontSize: statementFontSize,
                      width: "100%",
                    }}
                    accessibilityRole="header"
                  >
                    {card.text}
                  </Text>
                </View>

                {card.description && (
                  <Pressable
                    onPress={onShowDescription}
                    className="bg-white rounded-full shadow-sm border border-warm-gray/50 items-center justify-center"
                    style={{
                      marginHorizontal: isTabletLayout ? 40 : 32,
                      marginTop: isTabletLayout ? 16 : isLargePhone ? 14 : 12,
                      marginBottom: isTabletLayout ? 24 : 14,
                      paddingVertical: isTabletLayout ? 16 : 10,
                      paddingHorizontal: 24,
                    }}
                    hitSlop={10}
                  >
                    <Text
                      className="font-display-bold text-civic-navy uppercase tracking-wider"
                      style={{ fontSize: isTabletLayout ? 17 : 14 }}
                    >
                      + EN SAVOIR PLUS
                    </Text>
                  </Pressable>
                )}

                {/* Direction overlays — opacity driven by gesture position */}
                {process.env.NODE_ENV !== 'test' && (
                  <SwipeOverlay
                    translationX={translateX}
                    skipProgress={skipProgress}
                  />
                )}
              </View>
            </Pressable>
          </Animated.View>
        </GestureDetector>
      </View>
    );
  }
);
