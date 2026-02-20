import { View, Text, Image } from "react-native";
import type { Candidate } from "../../data/schema";
import { getCandidateImageSource } from "../../utils/candidateImageSource";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";

interface CandidateAvatarProps {
  candidate: Candidate;
  size?: number;
  showRing?: boolean;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function CandidateAvatar({
  candidate,
  size = 44,
  showRing = true,
}: CandidateAvatarProps) {
  const imageSource = getCandidateImageSource(candidate);
  const partyColor = getCandidatePartyColor(candidate.id);
  const ringWidth = showRing ? 2 : 0;
  const outerSize = size + ringWidth * 2;

  return (
    <View
      style={{
        width: outerSize,
        height: outerSize,
        borderRadius: outerSize / 2,
        borderWidth: ringWidth,
        borderColor: showRing ? partyColor : "transparent",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
          }}
          accessibilityLabel={candidate.name}
        />
      ) : (
        <View
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: partyColor,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text
            style={{ fontSize: size * 0.38, fontWeight: "600", color: "#FAFAF8" }}
          >
            {getInitials(candidate.name)}
          </Text>
        </View>
      )}
    </View>
  );
}
