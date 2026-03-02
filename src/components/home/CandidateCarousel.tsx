import { useState, useMemo } from "react";
import { View, FlatList, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type { Candidate } from "../../data/schema";
import { CandidateAvatar } from "../candidates/CandidateAvatar";
import { CandidateInfoModal } from "../candidates/CandidateInfoModal";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";
import { deterministicShuffle, dailySeed } from "../../utils/shuffle";
import { AppText as Text } from "../ui/AppText";

interface CandidateCarouselProps {
    candidates: Candidate[];
}

export function CandidateCarousel({ candidates }: CandidateCarouselProps) {
    const { t } = useTranslation("home");
    const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

    const selectedCandidate = useMemo(
        () => candidates.find((c) => c.id === selectedCandidateId),
        [candidates, selectedCandidateId]
    );

    const shuffled = useMemo(
        () => deterministicShuffle(candidates, dailySeed()),
        [candidates]
    );

    const renderItem = ({ item }: { item: Candidate }) => {
        const partyColor = getCandidatePartyColor(item.id);

        return (
            <Pressable
                onPress={() => setSelectedCandidateId(item.id)}
                className="mr-3 bg-white rounded-2xl overflow-hidden"
                style={{
                    width: 160,
                    shadowColor: "#1B2A4A",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    elevation: 3,
                }}
                accessibilityRole="button"
                accessibilityLabel={`${item.name}, ${item.party}`}
            >
                {/* Color bar top */}
                <View style={{ height: 4, backgroundColor: partyColor }} />

                {/* Avatar + Name */}
                <View className="items-center pt-4 pb-4 px-3">
                    <CandidateAvatar candidate={item} size={64} showRing />
                    <Text
                        className="font-display-semibold text-sm text-civic-navy mt-3 text-center"
                        numberOfLines={1}
                        maxFontSizeMultiplier={1.2}
                    >
                        {item.name}
                    </Text>
                    <View
                        className="rounded-full px-2.5 py-0.5 mt-1.5"
                        style={{ backgroundColor: partyColor + "1A" }}
                    >
                        <Text
                            className="font-body-medium text-xs text-center"
                            style={{ color: partyColor }}
                            numberOfLines={1}
                            maxFontSizeMultiplier={1.15}
                        >
                            {item.party}
                        </Text>
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <View className="mt-2">
            <View className="flex-row items-center mx-4 mb-3">
                <Ionicons name="people-outline" size={18} color="#1B2A4A" />
                <Text className="font-display-semibold text-sm text-civic-navy ml-2">
                    {t("candidatesTitle")}
                </Text>
            </View>

            <FlatList
                data={shuffled}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 4 }}
            />

            {selectedCandidate && (
                <CandidateInfoModal
                    candidate={selectedCandidate}
                    onClose={() => setSelectedCandidateId(null)}
                />
            )}
        </View>
    );
}
