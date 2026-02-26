import { View, Text, Image, ScrollView, Pressable, Modal } from "react-native";
import { useTranslation } from "react-i18next";
import { getCandidateImageSource } from "../../utils/candidateImageSource";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";
import { getCandidatePartyLogo } from "../../utils/candidatePartyLogo";
import { CandidateAvatar } from "./CandidateAvatar";
import type { Candidate } from "../../data/schema";

interface CandidateInfoModalProps {
  candidate: Candidate;
  onClose: () => void;
}

export function CandidateInfoModal({
  candidate,
  onClose,
}: CandidateInfoModalProps) {
  const { t } = useTranslation("candidates");
  const partyColor = getCandidatePartyColor(candidate.id);
  const partyLogo = getCandidatePartyLogo(candidate.id);

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-4">
        <View className="bg-warm-white w-full max-w-sm rounded-2xl overflow-hidden shadow-xl max-h-[85vh]">
          {/* Party color bar */}
          <View style={{ height: 6, backgroundColor: partyColor }} />

          <ScrollView className="p-6">
            {/* Centered avatar */}
            <View className="items-center mb-6">
              <View className="relative">
                <CandidateAvatar candidate={candidate} size={80} showRing />
                {partyLogo && (
                  <View
                    className="absolute bg-white rounded-full items-center justify-center shadow-sm overflow-hidden"
                    style={{
                      width: 39, // 28 * 1.4
                      height: 39,
                      bottom: -2,
                      right: -2,
                      borderWidth: 2,
                      borderColor: "white",
                    }}
                  >
                    <Image
                      source={partyLogo}
                      style={{ width: 24, height: 24 }} // slightly smaller to fit perfectly inside without hitting borders
                      resizeMode="contain"
                    />
                  </View>
                )}
              </View>
              <Text className="font-display-bold text-xl text-civic-navy mt-4 text-center">
                {candidate.name}
              </Text>

              {/* Party badge row */}
              <View className="flex-row items-center mt-2">
                <View
                  className="rounded-full px-3 py-1"
                  style={{ backgroundColor: partyColor + "1A" }}
                >
                  <Text
                    className="font-body-medium text-sm text-center"
                    style={{ color: partyColor }}
                  >
                    {candidate.party}
                  </Text>
                </View>
              </View>
            </View>

            {candidate.bio && (
              <Text className="font-body-regular text-base text-text-secondary leading-relaxed mb-4">
                {candidate.bio}
              </Text>
            )}
          </ScrollView>

          {/* Fermer button — party colored */}
          <View className="p-4 border-t border-warm-gray">
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t("close")}
              className="py-3.5 px-6 rounded-xl active:opacity-80 items-center"
              style={{ backgroundColor: partyColor }}
            >
              <Text className="font-display-bold text-warm-white text-sm uppercase tracking-wider">
                {t("close")}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
