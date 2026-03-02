import { View, Image, ScrollView, Platform } from "react-native";
import { useTranslation } from "react-i18next";
import type { Candidate, Position } from "../../data/schema";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";
import { getCandidateImageSource } from "../../utils/candidateImageSource";
import { TrustBadge } from "../shared/TrustBadge";
import { SourceReference } from "../shared/SourceReference";
import { AppText as Text } from "../ui/AppText";

interface ComparisonViewProps {
  candidates: Candidate[];
  selectedCandidateIds: string[];
  positions: Position[];
  activeThemeId: string;
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  android: { elevation: 2 },
  default: {},
});

export function ComparisonView({
  candidates,
  selectedCandidateIds,
  positions,
  activeThemeId,
}: ComparisonViewProps) {
  const { t } = useTranslation("comparison");
  const { t: tCommon } = useTranslation("common");

  const selectedCandidates = selectedCandidateIds
    .map((id) => candidates.find((c) => c.id === id))
    .filter(Boolean) as Candidate[];

  if (selectedCandidates.length < 2) {
    return (
      <View className="flex-1 items-center justify-center px-8 py-12">
        <Text className="font-body text-base text-text-caption text-center">
          {t("minimumCandidates")}
        </Text>
      </View>
    );
  }

  const columnWidth = selectedCandidates.length <= 2 ? "flex-1" : "";
  const columnStyle = selectedCandidates.length > 2 ? { width: 240 } : {};

  return (
    <View testID="comparison-view-container" className="flex-1">
      <ScrollView
        horizontal={selectedCandidates.length > 2}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          selectedCandidates.length <= 2
            ? { flexDirection: "row", flex: 1, gap: 12, paddingHorizontal: 16 }
            : { gap: 12, paddingHorizontal: 16 }
        }
      >
        {selectedCandidates.map((candidate) => {
          const position = positions.find(
            (p) =>
              p.candidateId === candidate.id && p.themeId === activeThemeId
          );
          const partyColor = getCandidatePartyColor(candidate.id);
          const imageSource = getCandidateImageSource(candidate);

          return (
            <View
              key={candidate.id}
              className={`bg-warm-white rounded-xl overflow-hidden ${columnWidth}`}
              style={[columnStyle, cardShadow]}
            >
              {/* Header — avatar + name/party, colored background */}
              <View
                style={{ backgroundColor: partyColor + "14" }}
                className="flex-row items-center px-3 pt-3 pb-2"
              >
                {imageSource ? (
                  <Image
                    source={imageSource}
                    className="rounded-full bg-warm-gray"
                    style={{ width: 36, height: 36 }}
                    accessibilityIgnoresInvertColors
                  />
                ) : (
                  <View
                    className="rounded-full bg-warm-gray items-center justify-center"
                    style={{ width: 36, height: 36 }}
                  >
                    <Text className="text-base">👤</Text>
                  </View>
                )}
                <View className="flex-1 ml-2">
                  <Text className="font-display-medium text-sm text-civic-navy" numberOfLines={1}>
                    {candidate.name}
                  </Text>
                  <View
                    className="rounded-full px-2 py-0.5 self-start"
                    style={{ backgroundColor: partyColor + "1A" }}
                  >
                    <Text className="font-body-medium text-xs" style={{ color: partyColor }} numberOfLines={1} maxFontSizeMultiplier={1.15}>
                      {candidate.party}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Position content */}
              <View className="p-3 pt-2">
                {position ? (
                  <View>
                    <Text className="font-body text-sm text-text-body mb-2">
                      {position.summary}
                    </Text>
                    <Text
                      className="font-body text-sm text-text-caption mb-3"
                      numberOfLines={6}
                    >
                      {position.details}
                    </Text>
                    <View className="border-t border-warm-white pt-2 gap-1">
                      {position.sources.map((source, index) => (
                        <SourceReference key={index} source={source} compact />
                      ))}
                    </View>
                  </View>
                ) : (
                  <View>
                    <TrustBadge variant="non_documente" />
                    <Text className="font-body text-sm text-text-caption italic mt-2">
                      {t("positionNotDocumented")}
                    </Text>
                    <Text className="font-body text-xs text-text-caption mt-1">
                      {tCommon("noPositionNote")}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
