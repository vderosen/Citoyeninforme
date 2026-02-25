import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { PositionCard } from "./PositionCard";
import type { Candidate, Position } from "../../data/schema";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";

interface SinglePositionViewProps {
    candidate: Candidate;
    activeThemeId: string;
    positions: Position[];
    onDebatePress: () => void;
}

export function SinglePositionView({
    candidate,
    activeThemeId,
    positions,
    onDebatePress,
}: SinglePositionViewProps) {
    const { t } = useTranslation("candidates");

    const partyColor = getCandidatePartyColor(candidate.id);
    const activePosition = positions.find(
        (p) => p.candidateId === candidate.id && p.themeId === activeThemeId
    );

    return (
        <View testID="single-position-view-container" className="px-4 mt-3 pb-6">
            {activePosition ? (
                <PositionCard position={activePosition} partyColor={partyColor} />
            ) : (
                <View className="bg-warm-gray rounded-lg p-3">
                    <Text className="font-body text-sm text-text-caption italic">
                        {t("noPositionDocumented")}
                    </Text>
                    <Text className="font-body text-xs text-text-caption mt-1">
                        {t("noPositionNote")}
                    </Text>
                </View>
            )}

            {/* Debate button */}
            <View className="pt-5 pb-4 items-center">
                <Pressable
                    onPress={onDebatePress}
                    className="rounded-xl py-3 px-8 flex-row items-center justify-center"
                    style={{
                        minHeight: 48,
                        borderWidth: 1.5,
                        borderColor: "#1B2A4A",
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={t("debate")}
                >
                    <Ionicons
                        name="chatbubble-outline"
                        size={18}
                        color="#1B2A4A"
                        style={{ marginRight: 8 }}
                    />
                    <Text className="font-display-medium text-sm text-civic-navy">
                        {t("debate")}
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}
