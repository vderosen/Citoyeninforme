import React, { useRef } from "react";
import { View, Text, Modal, Pressable, StyleSheet, SafeAreaView, ActivityIndicator, Share } from "react-native";
import { captureRef } from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { Podium } from "./Podium";
import type { CandidateMatchResult } from "../../services/matching";
import type { Candidate } from "../../data/schema";

interface ShareResultsModalProps {
    visible: boolean;
    onClose: () => void;
    ranking: CandidateMatchResult[];
    candidates: Candidate[];
    totalVotes: number;
}

export function ShareResultsModal({ visible, onClose, ranking, candidates, totalVotes }: ShareResultsModalProps) {
    const { t } = useTranslation(["survey", "common"]);
    const viewRef = useRef<View>(null);
    const [isSharing, setIsSharing] = React.useState(false);

    const handleShare = async () => {
        try {
            setIsSharing(true);
            const uri = await captureRef(viewRef, {
                format: "png",
                quality: 1,
            });

            const shareMessage = t("survey:shareText");

            // First attempt: send image + text/link together for apps that support mixed payloads.
            // Fallback preserves existing image-only behavior.
            try {
                await Share.share({
                    message: shareMessage,
                    url: uri,
                    title: t("survey:myResults"),
                });
            } catch {
                await Sharing.shareAsync(uri, {
                    dialogTitle: t("survey:myResults"),
                    mimeType: "image/png",
                });
            }

            onClose();
        } catch (error) {
            console.error("Error capturing or sharing view:", error);
        } finally {
            setIsSharing(false);
        }
    };

    if (!visible) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <SafeAreaView style={styles.container}>
                <View style={styles.modalContent}>
                    <Text style={styles.headerTitle}>{t("survey:shareResults")}</Text>

                    {/* View to be captured */}
                    <View style={styles.captureContainer} ref={viewRef} collapsable={false}>
                        <View style={styles.card}>
                            <View style={styles.cardHeader}>
                                <Text style={[styles.appName, { flexDirection: 'row' }]}>
                                    <Text style={{ color: '#1A202C' }}>Citoyen </Text>
                                    <Text style={{ color: '#60A5FA' }}>Informé</Text>
                                </Text>
                                <View style={styles.appHandleRow}>
                                    <Ionicons name="logo-instagram" size={14} color="#E1306C" />
                                    <Text style={styles.appHandle}>@Citoyen.Informe</Text>
                                </View>
                            </View>

                            <Text style={styles.resultsTitle}>{t("survey:shareCardTitle")}</Text>
                            <Text style={styles.votesCount}>{t("survey:basedOnCards", { count: totalVotes })}</Text>

                            <View style={styles.podiumContainer}>
                                <Podium
                                    ranking={ranking}
                                    candidates={candidates}
                                    onCandidatePress={() => { }} // Disabled in share view
                                    triggerCelebration={false} // Static for screenshot
                                    isStatic={true}
                                />
                            </View>
                        </View>
                    </View>

                    <View style={styles.actionsContainer}>
                        <Pressable
                            style={[styles.shareButton, isSharing && styles.buttonDisabled]}
                            onPress={handleShare}
                            disabled={isSharing}
                        >
                            {isSharing ? (
                                <ActivityIndicator color="#FFFFFF" />
                            ) : (
                                <Text style={styles.shareButtonText}>↥ {t("survey:shareResults")}</Text>
                            )}
                        </Pressable>

                        <Pressable style={styles.cancelButton} onPress={onClose} disabled={isSharing}>
                            <Text style={styles.cancelButtonText}>{t("survey:cancel")}</Text>
                        </Pressable>
                    </View>
                </View>
            </SafeAreaView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F7F5F0", // warm-white
    },
    modalContent: {
        flex: 1,
        padding: 24,
        justifyContent: "space-between",
    },
    headerTitle: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 28,
        color: "#1A202C", // civic-navy
        textAlign: "center",
        marginTop: 20,
        marginBottom: 30,
    },
    captureContainer: {
        alignItems: "center",
        justifyContent: "center",
    },
    card: {
        backgroundColor: "#FFFFFF",
        width: 320,
        padding: 24,
        borderWidth: 6,
        borderColor: "#4285F4", // a nice blue border as seen in the mockup
        alignItems: "center",
    },
    cardHeader: {
        alignItems: "center",
        marginBottom: 20,
    },
    appName: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 24,
        color: "#1A202C",
        letterSpacing: -0.5,
    },
    appHandle: {
        fontFamily: "Inter_400Regular",
        fontSize: 14,
        color: "#718096",
    },
    appHandleRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginTop: 2,
    },
    resultsTitle: {
        fontFamily: "SpaceGrotesk_700Bold",
        fontSize: 22,
        color: "#1A202C",
        marginBottom: 4,
    },
    votesCount: {
        fontFamily: "Inter_500Medium",
        fontSize: 14,
        color: "#4A5568",
        textTransform: "uppercase",
        letterSpacing: 0.5,
        marginBottom: 30,
    },
    podiumContainer: {
        width: "100%",
        alignItems: "center",
        // Min height to ensure podium fits nicely in the card
        minHeight: 220,
        justifyContent: "flex-end",
    },
    actionsContainer: {
        gap: 16,
        marginTop: 40,
        marginBottom: 20,
    },
    shareButton: {
        backgroundColor: "#FF3B30", // Reddish button
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    shareButtonText: {
        fontFamily: "SpaceGrotesk_700Bold",
        color: "#FFFFFF",
        fontSize: 18,
    },
    cancelButton: {
        backgroundColor: "transparent",
        borderWidth: 1,
        borderColor: "#FF3B30",
        borderRadius: 12,
        paddingVertical: 16,
        alignItems: "center",
    },
    cancelButtonText: {
        fontFamily: "SpaceGrotesk_700Bold",
        color: "#FF3B30",
        fontSize: 18,
    },
    buttonDisabled: {
        opacity: 0.7,
    },
});
