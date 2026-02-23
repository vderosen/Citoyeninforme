import { useState, useMemo } from "react";
import { View, Text, FlatList, Pressable, LayoutAnimation } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import type { Candidate } from "../../data/schema";
import { CandidateAvatar } from "../candidates/CandidateAvatar";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";
import { deterministicShuffle, dailySeed } from "../../utils/shuffle";

interface CandidateCarouselProps {
    candidates: Candidate[];
}

export function CandidateCarousel({ candidates }: CandidateCarouselProps) {
    const { t } = useTranslation("home");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const shuffled = useMemo(
        () => deterministicShuffle(candidates, dailySeed()),
        [candidates]
    );

    const toggleExpand = (id: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpandedId((prev) => (prev === id ? null : id));
    };

    const renderItem = ({ item }: { item: Candidate }) => {
        const isExpanded = expandedId === item.id;
        const partyColor = getCandidatePartyColor(item.id);

        return (
            <Pressable
                onPress={() => toggleExpand(item.id)}
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
                <View className="items-center pt-4 pb-3 px-3">
                    <CandidateAvatar candidate={item} size={64} showRing />
                    <Text
                        className="font-display-semibold text-sm text-civic-navy mt-2 text-center"
                        numberOfLines={1}
                    >
                        {item.name}
                    </Text>
                    <View
                        className="rounded-full px-2.5 py-0.5 mt-1"
                        style={{ backgroundColor: partyColor + "1A" }}
                    >
                        <Text
                            className="font-body-medium text-xs text-center"
                            style={{ color: partyColor }}
                            numberOfLines={1}
                        >
                            {item.party}
                        </Text>
                    </View>

                    {/* Expand hint */}
                    <Ionicons
                        name={isExpanded ? "chevron-up" : "chevron-down"}
                        size={16}
                        color="#9CA3AF"
                        style={{ marginTop: 6 }}
                    />
                </View>

                {/* Bio — expandable */}
                {isExpanded && item.bio ? (
                    <View className="px-3 pb-4 border-t border-warm-gray">
                        <Text className="font-body text-xs text-text-body mt-2 leading-relaxed">
                            {item.bio}
                        </Text>
                    </View>
                ) : null}
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
        </View>
    );
}
