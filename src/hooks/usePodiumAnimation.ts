import { useEffect } from "react";
import { useSharedValue, withSequence, withTiming, withSpring, withDelay, useAnimatedStyle, Easing } from "react-native-reanimated";

export function usePodiumAnimation(triggerCelebration: boolean, isStatic?: boolean, reduceMotion?: boolean) {
    const riseProgress = useSharedValue(reduceMotion || !triggerCelebration ? 1 : 0);

    const trophyScale = useSharedValue(0);
    const trophyTranslateY = useSharedValue(20);
    const trophyRotate = useSharedValue(0);

    const trophyAnimatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateY: trophyTranslateY.value },
            { scale: trophyScale.value },
            { rotate: `${trophyRotate.value}deg` }
        ],
        opacity: trophyScale.value > 0 ? 1 : 0,
    }));

    useEffect(() => {
        if (triggerCelebration && !reduceMotion) {
            riseProgress.value = 0;
            trophyScale.value = 0;
            trophyTranslateY.value = 20;
            trophyRotate.value = 0;

            const startDelay = 500;

            riseProgress.value = withDelay(
                100,
                withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
            );

            trophyScale.value = withDelay(
                startDelay,
                withSpring(1, { damping: 12, stiffness: 100 })
            );

            trophyTranslateY.value = withDelay(
                startDelay,
                withSequence(
                    withTiming(-15, { duration: 300, easing: Easing.out(Easing.back(1.5)) }),
                    withSpring(0, { damping: 14, stiffness: 120 })
                )
            );

            trophyRotate.value = withDelay(
                startDelay + 400,
                withSpring(15, { damping: 10, mass: 0.8, stiffness: 150 })
            );
        } else {
            riseProgress.value = 1;
            trophyScale.value = 1;
            trophyTranslateY.value = 0;
            trophyRotate.value = 15;
        }
    }, [triggerCelebration, reduceMotion]);

    return {
        riseProgress,
        trophyAnimatedStyle
    };
}
