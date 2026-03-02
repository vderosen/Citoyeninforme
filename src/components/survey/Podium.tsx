import { View, Image, Pressable } from "react-native";
import Animated, { FadeInUp, FadeIn, useReducedMotion, useAnimatedStyle, interpolate } from "react-native-reanimated";
import type { Candidate } from "../../data/schema";
import type { CandidateMatchResult } from "../../services/matching";
import { getCandidateImageSource } from "../../utils/candidateImageSource";
import { resolvePodiumTies, type PodiumSlot } from "../../utils/rankings";
import { usePodiumAnimation } from "../../hooks/usePodiumAnimation";
import { AppText as Text } from "../ui/AppText";

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
    let podiumColor = candidate.partyColor || "#A0AEC0"; // fallback 3rd place
    if (!candidate.partyColor) {
        if (slot.rank === 1) podiumColor = "#E84855"; // fallback 1st place
        else if (slot.rank === 2) podiumColor = "#718096"; // fallback 2nd place
    }

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
                testID={`podium-rank-${slot.rank}`}
                onPress={() => onCandidatePress(slot.match.candidateId)}
                className="items-center w-full"
                hitSlop={8}
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
                        className="font-display-medium text-white/90 text-xs text-center px-1 w-full"
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.15}
                    >
                        {candidate.name}
                    </Text>
                    <Text className="font-display-bold text-white text-sm mt-1">
                        {slot.match.alignmentScore > 0 ? `+${slot.match.alignmentScore}` : slot.match.alignmentScore} pts
                    </Text>
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
    const { riseProgress, trophyAnimatedStyle } = usePodiumAnimation(!!triggerCelebration, isStatic, reduceMotion);

    if (ranking.length < 3) return null;

    const podiumSlots = resolvePodiumTies(ranking);

    return (
        <Animated.View
            testID="podium-container"
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
