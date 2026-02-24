import { View, Text, Image, Pressable } from "react-native";
import Animated, { FadeInUp, FadeIn, useReducedMotion, useSharedValue, withSequence, withTiming, withSpring, withDelay, useAnimatedStyle, Easing, interpolate } from "react-native-reanimated";
import { useEffect } from "react";
import type { Candidate } from "../../data/schema";
import type { CandidateMatchResult } from "../../services/matching";
import { getCandidateImageSource } from "../../utils/candidateImageSource";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";

interface PodiumProps {
    ranking: CandidateMatchResult[];
    candidates: Candidate[];
    onCandidatePress: (candidateId: string) => void;
    triggerCelebration?: boolean;
    isStatic?: boolean;
}

function PodiumBar({
    slot,
    candidate,
    isFirst,
    index,
    imageSource,
    onCandidatePress,
    reduceMotion,
    triggerCelebration,
    trophyAnimatedStyle,
    riseProgress,
    isStatic
}: any) {
    const avatarSize = isFirst ? 56 : 46;
    const podiumColor = isFirst ? "#E84855" : "#718096";

    // Extra height for #1
    const finalHeight = slot.height + (isFirst ? 20 : 0);

    const animatedHeightStyle = useAnimatedStyle(() => {
        return {
            height: interpolate(riseProgress.value, [0, 1], [80, finalHeight])
        };
    });

    const enteringAnim = isStatic || reduceMotion
        ? undefined
        : (triggerCelebration
            ? FadeIn.delay(index * 100)
            : FadeInUp.delay(index * 100).springify().damping(18).mass(0.8));

    return (
        <Animated.View
            entering={enteringAnim}
            className="items-center flex-1"
        >
            <Pressable
                onPress={() => onCandidatePress(slot.match.candidateId)}
                className="items-center w-full"
                accessibilityRole="button"
                accessibilityLabel={`${candidate.name}, ${slot.label}`}
            >
                {/* Avatar */}
                <View className="mb-2 items-center justify-center relative">
                    <View
                        className={`rounded-full border-[3px] overflow-hidden ${isFirst ? 'shadow-elevated z-10' : 'shadow-sm z-0'}`}
                        style={{
                            width: avatarSize + 6,
                            height: avatarSize + 6,
                            borderColor: podiumColor,
                            backgroundColor: "#FFFFFF",
                            marginBottom: isFirst ? 16 : 8,
                        }}
                    >
                        {imageSource ? (
                            <Image
                                source={imageSource}
                                style={{ width: avatarSize, height: avatarSize, borderRadius: avatarSize / 2 }}
                                accessibilityIgnoresInvertColors
                            />
                        ) : (
                            <View
                                className="items-center justify-center"
                                style={{ width: avatarSize, height: avatarSize }}
                            >
                                <Text style={{ fontSize: isFirst ? 22 : 18 }}>👤</Text>
                            </View>
                        )}
                    </View>

                    {/* Trophy positioned bottom-right */}
                    {isFirst && (
                        isStatic ? (
                            <View
                                style={[
                                    { position: 'absolute', bottom: 12, right: -4, alignItems: 'center', zIndex: 100, elevation: 100 },
                                    { transform: [{ translateY: 0 }, { scale: 1 }, { rotate: '15deg' }] }
                                ]}
                            >
                                <Text style={{ fontSize: 24, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>
                                    🏆
                                </Text>
                            </View>
                        ) : (
                            <Animated.View
                                style={[
                                    { position: 'absolute', bottom: 12, right: -4, alignItems: 'center', zIndex: 100, elevation: 100 },
                                    trophyAnimatedStyle
                                ]}
                            >
                                <Text style={{ fontSize: 24, textShadowColor: 'rgba(0,0,0,0.2)', textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }}>
                                    🏆
                                </Text>
                            </Animated.View>
                        )
                    )}
                </View>

                {/* Podium bar */}
                <Animated.View
                    className={`w-full rounded-t-2xl items-center justify-start pt-4 border-t border-l border-r border-white/20 ${isFirst ? 'shadow-elevated z-10' : 'shadow-card z-0'}`}
                    style={[
                        { backgroundColor: podiumColor },
                        isStatic ? { height: finalHeight } : animatedHeightStyle
                    ]}
                >
                    <Text className="font-display-bold text-white text-lg mb-1">
                        {slot.label}
                    </Text>
                    <Text
                        className="font-display-medium text-white/90 text-xs text-center px-1"
                        numberOfLines={2}
                    >
                        {candidate.name}
                    </Text>
                    {!isStatic && (
                        <Text className="font-display-bold text-white text-sm mt-1">
                            {slot.match.alignmentScore > 0 ? `+${slot.match.alignmentScore}` : slot.match.alignmentScore}
                        </Text>
                    )}
                </Animated.View>
            </Pressable>
        </Animated.View>
    );
}

/**
 * Classic podium: 2nd | 1st | 3rd
 * Only renders when at least 3 candidates have been scored.
 * Handles ties at the top (ex-aequo 1st places).
 */
export function Podium({ ranking, candidates, onCandidatePress, triggerCelebration, isStatic }: PodiumProps) {
    const reduceMotion = useReducedMotion();

    const riseProgress = useSharedValue(reduceMotion || !triggerCelebration ? 1 : 0);

    // -- Animation state for the trophy --
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
            // Reset to hidden
            riseProgress.value = 0;
            trophyScale.value = 0;
            trophyTranslateY.value = 20;
            trophyRotate.value = 0;

            const startDelay = 500;

            // Rise podium smoothly
            riseProgress.value = withDelay(
                100,
                withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) })
            );

            // Sequence: pop up, settle down slightly, tilt right
            trophyScale.value = withDelay(
                startDelay,
                withSpring(1, { damping: 12, stiffness: 100 })
            );

            // Pop up higher then settle down
            trophyTranslateY.value = withDelay(
                startDelay,
                withSequence(
                    withTiming(-15, { duration: 300, easing: Easing.out(Easing.back(1.5)) }),
                    withSpring(0, { damping: 14, stiffness: 120 })
                )
            );

            // Tilt right after settling
            trophyRotate.value = withDelay(
                startDelay + 400,
                withSpring(15, { damping: 10, mass: 0.8, stiffness: 150 })
            );
        } else if (triggerCelebration && reduceMotion) {
            // Static if user prefers reduced motion
            riseProgress.value = 1;
            trophyScale.value = 1;
            trophyTranslateY.value = 0;
            trophyRotate.value = 15;
        } else {
            // Show static trophy without animating if no celebration is triggered
            riseProgress.value = 1;
            trophyScale.value = 1;
            trophyTranslateY.value = 0;
            trophyRotate.value = 15;
        }
    }, [triggerCelebration, reduceMotion]);

    if (ranking.length < 3) return null;

    // Take top 3 from the pre-sorted ranking
    const top3 = ranking.slice(0, 3);

    // Determine actual ranks accounting for ties
    const ranks: number[] = [];
    let currentRank = 1;
    for (let i = 0; i < top3.length; i++) {
        if (i > 0 && top3[i].alignmentScore === top3[i - 1].alignmentScore) {
            ranks.push(ranks[i - 1]);
        } else {
            ranks.push(currentRank);
        }
        currentRank = i + 2;
    }

    // Bar heights keyed by rank — tied candidates get the same height
    const rankToHeight: Record<number, number> = { 1: 150, 2: 110, 3: 80 };

    // Podium visual order: [position-1 (left), position-0 (center), position-2 (right)]
    const podiumSlots = [
        { match: top3[1], rank: ranks[1], label: `#${ranks[1]}`, height: rankToHeight[ranks[1]] ?? 80 },
        { match: top3[0], rank: ranks[0], label: `#${ranks[0]}`, height: rankToHeight[ranks[0]] ?? 150 },
        { match: top3[2], rank: ranks[2], label: `#${ranks[2]}`, height: rankToHeight[ranks[2]] ?? 80 },
    ];

    return (
        <Animated.View
            entering={isStatic || reduceMotion ? undefined : FadeInUp.duration(600)}
            className="mb-6 w-full"
        >
            <View className="flex-row items-end justify-center w-full" style={{ gap: 8 }}>
                {podiumSlots.map((slot, i) => {
                    const candidate = candidates.find((c) => c.id === slot.match.candidateId);
                    if (!candidate) return null;
                    const imageSource = getCandidateImageSource(candidate);
                    const isFirst = slot.rank === 1;

                    return (
                        <PodiumBar
                            key={slot.match.candidateId}
                            slot={slot}
                            candidate={candidate}
                            imageSource={imageSource}
                            isFirst={isFirst}
                            index={i}
                            onCandidatePress={onCandidatePress}
                            reduceMotion={reduceMotion}
                            triggerCelebration={triggerCelebration}
                            trophyAnimatedStyle={trophyAnimatedStyle}
                            riseProgress={riseProgress}
                            isStatic={isStatic}
                        />
                    );
                })}
            </View>
        </Animated.View>
    );
}
