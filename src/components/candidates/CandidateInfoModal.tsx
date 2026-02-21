import { View, Text, Image, Pressable } from "react-native";
import Animated, { FadeIn } from "react-native-reanimated";
import { useTranslation } from "react-i18next";
import { useMotionPreference } from "../../hooks/useMotionPreference";
import { getCandidateImageSource } from "../../utils/candidateImageSource";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";
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
  const { shouldAnimate } = useMotionPreference();

  const entering = shouldAnimate ? FadeIn.duration(300) : undefined;
  const partyColor = getCandidatePartyColor(candidate.id);
  const imageSource = getCandidateImageSource(candidate);

  return (
    <Animated.View
      entering={entering}
      accessibilityViewIsModal={true}
      className="absolute inset-0 z-50 items-center justify-center bg-black/60"
    >
      <View className="bg-white rounded-2xl mx-6 p-6 max-w-sm w-full">
        {/* Avatar + name + party badge */}
        <View className="flex-row items-center mb-4">
          {imageSource ? (
            <Image
              source={imageSource}
              className="rounded-full bg-warm-gray"
              style={{ width: 48, height: 48 }}
              accessibilityIgnoresInvertColors
            />
          ) : (
            <View
              className="rounded-full bg-warm-gray items-center justify-center"
              style={{ width: 48, height: 48 }}
            >
              <Text className="text-xl">👤</Text>
            </View>
          )}
          <View className="flex-1 ml-3" style={{ minWidth: 0 }}>
            <Text className="font-display-bold text-base text-civic-navy" numberOfLines={1}>
              {candidate.name}
            </Text>
            <View
              className="rounded-full px-2 py-0.5 mt-0.5 self-start"
              style={{ backgroundColor: partyColor + "1A" }}
            >
              <Text
                className="font-body-medium text-xs"
                style={{ color: partyColor }}
                numberOfLines={1}
              >
                {candidate.party}
              </Text>
            </View>
          </View>
        </View>

        {/* Bio */}
        {candidate.bio ? (
          <Text className="font-body text-sm text-text-body leading-relaxed mb-5">
            {candidate.bio}
          </Text>
        ) : null}

        {/* Close button */}
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          accessibilityLabel={t("close")}
          className="bg-civic-navy rounded-xl py-3 items-center"
          style={{ minHeight: 48 }}
        >
          <Text className="font-heading text-base text-white">
            {t("close")}
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
}
