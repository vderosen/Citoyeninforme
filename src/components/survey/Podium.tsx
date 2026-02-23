import { View, Text, Image, Pressable } from "react-native";
import Animated, { FadeInUp, useReducedMotion } from "react-native-reanimated";
import type { Candidate } from "../../data/schema";
import type { CandidateMatchResult } from "../../services/matching";
import { getCandidateImageSource } from "../../utils/candidateImageSource";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";

interface PodiumProps {
    ranking: CandidateMatchResult[];
    candidates: Candidate[];
    onCandidatePress: (candidateId: string) => void;
}

/**
 * Classic podium: 2nd | 1st | 3rd
 * Only renders when at least 3 candidates have been scored.
 * Handles ties at the top (ex-aequo 1st places).
 */
export function Podium({ ranking, candidates, onCandidatePress }: PodiumProps) {
    const reduceMotion = useReducedMotion();

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
            entering={reduceMotion ? undefined : FadeInUp.duration(600)}
            className="mb-6"
        >
            <View className="flex-row items-end justify-center" style={{ gap: 8 }}>
                {podiumSlots.map((slot, i) => {
                    const candidate = candidates.find((c) => c.id === slot.match.candidateId);
                    if (!candidate) return null;
                    const imageSource = getCandidateImageSource(candidate);
                    const partyColor = getCandidatePartyColor(candidate.id);
                    const isFirst = slot.rank === 1;
                    const avatarSize = isFirst ? 56 : 46;
                    const podiumColor = isFirst ? "#E84855" : "#718096"; // text-caption for neutrals

                    return (
                        <Animated.View
                            key={slot.match.candidateId}
                            entering={reduceMotion ? undefined : FadeInUp.delay(i * 100).springify().damping(18).mass(0.8)}
                            className="items-center flex-1"
                        >
                            <Pressable
                                onPress={() => onCandidatePress(slot.match.candidateId)}
                                className="items-center w-full"
                                accessibilityRole="button"
                                accessibilityLabel={`${candidate.name}, ${slot.label}`}
                            >
                                {/* Avatar */}
                                <View
                                    className={`rounded-full border-[3px] mb-2 overflow-hidden ${isFirst ? 'shadow-elevated z-10' : 'shadow-sm z-0'}`}
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

                                {/* Podium bar */}
                                <View
                                    className={`w-full rounded-t-2xl items-center justify-start pt-4 border-t border-l border-r border-white/20 ${isFirst ? 'shadow-elevated z-10' : 'shadow-card z-0'}`}
                                    style={{
                                        height: slot.height + (isFirst ? 20 : 0), // Extra height for 1st place
                                        backgroundColor: podiumColor,
                                    }}
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
                                    <Text className="font-display-bold text-white text-sm mt-1">
                                        {slot.match.alignmentScore > 0 ? `+${slot.match.alignmentScore}` : slot.match.alignmentScore}
                                    </Text>
                                </View>
                            </Pressable>
                        </Animated.View>
                    );
                })}
            </View>
        </Animated.View>
    );
}
