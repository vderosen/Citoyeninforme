import { useCallback } from "react";
import {
    useSharedValue,
    withSpring,
    withTiming,
    withSequence,
    withDelay,
    runOnJS,
    type SharedValue,
} from "react-native-reanimated";
import type { SwipeDirection } from "../data/schema";

const SWIPE_THRESHOLD = 120;
const VELOCITY_THRESHOLD = 800;
const VELOCITY_REDUCED_THRESHOLD = 60;

export function detectDirection(
    translationX: number,
    velocityX: number
): SwipeDirection | null {
    "worklet";
    const absX = Math.abs(translationX);
    const fastFlick = Math.abs(velocityX) > VELOCITY_THRESHOLD;
    const threshold = fastFlick ? VELOCITY_REDUCED_THRESHOLD : SWIPE_THRESHOLD;

    if (absX < threshold) return null;
    return translationX > 0 ? "agree" : "disagree";
}

interface UseSwipeAnimationProps {
    shouldAnimate: boolean;
    width: number;
    height: number;
    onCompleteSwipe: (direction: SwipeDirection) => void;
}

export function useSwipeAnimation({
    shouldAnimate,
    width,
    height,
    onCompleteSwipe,
}: UseSwipeAnimationProps) {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(1);
    const scale = useSharedValue(1);
    const skipProgress = useSharedValue(0);
    const isAnimatingOut = useSharedValue(false);

    const animateButtonExit = useCallback(
        (direction: SwipeDirection) => {
            if (isAnimatingOut.value) return;
            isAnimatingOut.value = true;

            if (direction === "skip") {
                skipProgress.value = withTiming(1, { duration: 250 });
                opacity.value = withDelay(
                    300,
                    withTiming(0, { duration: 250 }, () => {
                        runOnJS(onCompleteSwipe)("skip");
                    })
                );
                return;
            }

            const thresholdX =
                direction === "agree"
                    ? SWIPE_THRESHOLD
                    : direction === "disagree"
                        ? -SWIPE_THRESHOLD
                        : 0;
            const thresholdY =
                direction === "strongly_agree"
                    ? -SWIPE_THRESHOLD
                    : direction === "strongly_disagree"
                        ? SWIPE_THRESHOLD
                        : 0;

            const exitX =
                direction === "agree" ? width : direction === "disagree" ? -width : 0;
            const exitY =
                direction === "strongly_agree"
                    ? -height
                    : direction === "strongly_disagree"
                        ? height
                        : 0;

            if (shouldAnimate) {
                translateX.value = withSequence(
                    withTiming(thresholdX, { duration: 200 }),
                    withTiming(exitX, { duration: 400 })
                );
                translateY.value = withSequence(
                    withTiming(thresholdY, { duration: 200 }),
                    withTiming(exitY, { duration: 400 }, () => {
                        runOnJS(onCompleteSwipe)(direction);
                    })
                );
                scale.value = withDelay(200, withTiming(0.92, { duration: 400 }));
            } else {
                translateX.value = withTiming(thresholdX, { duration: 150 });
                translateY.value = withTiming(thresholdY, { duration: 150 });
                opacity.value = withDelay(
                    200,
                    withTiming(0, { duration: 200 }, () => {
                        runOnJS(onCompleteSwipe)(direction);
                    })
                );
            }
        },
        [height, isAnimatingOut, onCompleteSwipe, opacity, scale, shouldAnimate, skipProgress, translateX, translateY, width]
    );

    const animateGestureExit = useCallback(
        (direction: SwipeDirection) => {
            "worklet";
            if (isAnimatingOut.value) return;
            isAnimatingOut.value = true;

            if (shouldAnimate) {
                const exitX =
                    direction === "agree" ? width : direction === "disagree" ? -width : 0;
                const exitY =
                    direction === "strongly_agree"
                        ? -height
                        : direction === "strongly_disagree"
                            ? height
                            : 0;

                translateX.value = withTiming(exitX, { duration: 500 });
                translateY.value = withTiming(exitY, { duration: 500 }, () => {
                    runOnJS(onCompleteSwipe)(direction);
                });
                scale.value = withTiming(0.92, { duration: 500 });
            } else {
                const flashX =
                    direction === "agree"
                        ? SWIPE_THRESHOLD
                        : direction === "disagree"
                            ? -SWIPE_THRESHOLD
                            : 0;
                const flashY =
                    direction === "strongly_agree"
                        ? -SWIPE_THRESHOLD
                        : direction === "strongly_disagree"
                            ? SWIPE_THRESHOLD
                            : 0;

                translateX.value = withTiming(flashX, { duration: 150 });
                translateY.value = withTiming(flashY, { duration: 150 });
                opacity.value = withTiming(0, { duration: 300 }, () => {
                    runOnJS(onCompleteSwipe)(direction);
                });
            }
        },
        [height, isAnimatingOut, onCompleteSwipe, opacity, scale, shouldAnimate, translateX, translateY, width]
    );

    return {
        translateX,
        translateY,
        opacity,
        scale,
        skipProgress,
        isAnimatingOut,
        animateButtonExit,
        animateGestureExit,
    };
}
