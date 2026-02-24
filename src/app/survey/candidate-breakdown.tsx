import { View, Text, ScrollView, Pressable, Modal } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useElectionStore } from '../../stores/election';
import { useSurveyStore } from '../../stores/survey';
import { Feather, Ionicons } from '@expo/vector-icons';
import React, { useState, useMemo } from 'react';
import { getCategoryTheme } from '../../utils/categoryTheme';

export default function CandidateBreakdownScreen() {
    const { candidateId } = useLocalSearchParams<{ candidateId: string }>();
    const router = useRouter();
    const { t } = useTranslation();
    const candidate = useElectionStore(s => s.candidates.find(c => c.id === candidateId));
    const statementCards = useElectionStore(s => s.statementCards);
    const profile = useSurveyStore(s => s.profile);

    const match = profile?.candidateRanking.find(r => r.candidateId === candidateId);

    // State for the description modal
    const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
    const selectedCard = useMemo(
        () => statementCards.find(c => c.id === selectedCardId),
        [statementCards, selectedCardId]
    );
    const theme = getCategoryTheme(selectedCard?.category || 'Autre');

    if (!candidate || !match) {
        return (
            <View className="flex-1 items-center justify-center p-4 bg-warm-white">
                <Text className="font-display-medium text-civic-navy">Détails introuvables</Text>
                <Pressable onPress={() => router.back()} className="mt-4 p-3 bg-civic-navy rounded-xl">
                    <Text className="font-display-medium text-white">Retour</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-warm-white">
            <View className="flex-row items-center p-4 pt-14 bg-white shadow-sm z-10">
                <Pressable onPress={() => router.back()} className="p-2 mr-2 active:opacity-70">
                    <Feather name="chevron-left" size={24} color="#1C2136" />
                </Pressable>
                <Text className="font-display-semibold text-lg text-civic-navy flex-1" numberOfLines={1}>
                    Points pour {candidate.name}
                </Text>
                <Text className="font-display-bold text-xl text-accent-coral ml-2">
                    {match.alignmentScore > 0 ? `+${match.alignmentScore}` : match.alignmentScore} pts
                </Text>
            </View>

            <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingVertical: 16, paddingBottom: 40 }}>
                <Text className="font-body text-sm text-text-body mb-6">
                    Voici l'historique de vos réponses et comment elles ont impacté le score de ce candidat.
                </Text>

                {match.cardBreakdown.length === 0 ? (
                    <Text className="font-body text-center text-warm-gray mt-10">
                        Aucun point attribué avec vos réponses actuelles.
                    </Text>
                ) : (
                    match.cardBreakdown.map((interaction, index) => {
                        const card = statementCards.find(c => c.id === interaction.cardId);
                        const hasDescription = !!card?.description;

                        return (
                            <Pressable
                                key={`${interaction.cardId}-${index}`}
                                onPress={hasDescription ? () => setSelectedCardId(interaction.cardId) : undefined}
                                className="bg-white rounded-xl p-4 mb-3 border border-warm-gray shadow-sm active:opacity-80"
                            >
                                <View className="flex-row justify-between items-start mb-2">
                                    <Text className="font-display-medium text-sm text-civic-navy flex-1 mr-3 leading-5">
                                        {interaction.cardText}
                                    </Text>
                                    <View className={`px-2 py-1 rounded-md ${interaction.pointsAwarded > 0 ? "bg-accent-coral/10" : "bg-warm-gray/30"}`}>
                                        <Text className={`font-display-bold text-sm ${interaction.pointsAwarded > 0 ? "text-accent-coral" : "text-civic-navy"}`}>
                                            {interaction.pointsAwarded > 0 ? `+${interaction.pointsAwarded}` : interaction.pointsAwarded}
                                        </Text>
                                    </View>
                                </View>
                                <Text className="font-body text-xs text-text-body">
                                    Vous avez répondu : <Text className="font-display-semibold text-civic-navy">{interaction.userAnswerText}</Text>
                                </Text>
                            </Pressable>
                        );
                    })
                )}
            </ScrollView>

            {/* Description Modal — same style as the swipe screen */}
            <Modal
                visible={!!selectedCard}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setSelectedCardId(null)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center p-4">
                    <View
                        className="w-full max-w-sm rounded-3xl overflow-hidden shadow-xl max-h-[85vh]"
                        style={{ backgroundColor: theme.bg }}
                    >
                        {/* Category Badge Top Left */}
                        {selectedCard && (
                            <View className="flex-row items-center pt-6 px-6">
                                <View
                                    style={{ backgroundColor: 'white' }}
                                    className="flex-row items-center self-start px-3 py-1.5 rounded-full shadow-sm"
                                >
                                    <Ionicons name={theme.icon as any} size={14} color={theme.bg} />
                                    <Text
                                        className="ml-1.5 font-display-bold text-xs uppercase tracking-widest"
                                        style={{ color: theme.bg }}
                                    >
                                        {selectedCard.category}
                                    </Text>
                                </View>
                            </View>
                        )}

                        <ScrollView className="p-6">
                            <Text
                                className="font-display-bold text-[22px] leading-snug mb-4"
                                style={{ color: "white" }}
                            >
                                {selectedCard?.text}
                            </Text>

                            {selectedCard?.description && (
                                <Text
                                    className="font-body-regular text-base leading-relaxed mb-4"
                                    style={{ color: "white", opacity: 0.9 }}
                                >
                                    {selectedCard.description}
                                </Text>
                            )}
                        </ScrollView>

                        <View className="p-4 border-t border-white/20">
                            <Pressable
                                onPress={() => setSelectedCardId(null)}
                                className="py-3.5 px-6 rounded-xl active:opacity-80 items-center"
                                style={{ backgroundColor: "white" }}
                            >
                                <Text
                                    className="font-display-bold text-sm uppercase tracking-wider"
                                    style={{ color: theme.bg }}
                                >
                                    Fermer
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

