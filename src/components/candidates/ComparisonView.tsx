import { View, Text, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import type { Candidate, Position, Theme } from "../../data/schema";
import { TrustBadge } from "../shared/TrustBadge";
import { SourceReference } from "../shared/SourceReference";

interface ComparisonViewProps {
  candidates: Candidate[];
  selectedCandidateIds: string[];
  positions: Position[];
  themes: Theme[];
  activeThemeId: string;
  onThemeChange: (themeId: string) => void;
  onCandidateToggle: (candidateId: string) => void;
}

export function ComparisonView({
  candidates,
  selectedCandidateIds,
  positions,
  themes,
  activeThemeId,
  onThemeChange,
  onCandidateToggle,
}: ComparisonViewProps) {
  const { t } = useTranslation("comparison");
  const { t: tCommon } = useTranslation("common");

  const activeTheme = themes.find((th) => th.id === activeThemeId);
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
    <View className="flex-1">
      {activeTheme && (
        <Text
          className="font-display-semibold text-lg text-civic-navy px-4 py-3"
          accessibilityRole="header"
        >
          {activeTheme.icon} {activeTheme.name}
        </Text>
      )}

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

          return (
            <View
              key={candidate.id}
              className={`bg-warm-gray rounded-xl p-4 ${columnWidth}`}
              style={columnStyle}
            >
              <View
                style={{
                  height: 4,
                  backgroundColor: candidate.partyColor || "#9CA3AF",
                  borderRadius: 2,
                  marginBottom: 12,
                }}
              />
              <Text className="font-display-medium text-base text-civic-navy">
                {candidate.name}
              </Text>
              <Text className="font-body text-xs text-text-caption mb-3">
                {candidate.party}
              </Text>

              {position ? (
                <View>
                  <Text className="font-body text-sm text-text-body mb-2">
                    {position.summary}
                  </Text>
                  <Text className="font-body text-sm text-text-caption mb-3">
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
          );
        })}
      </ScrollView>
    </View>
  );
}
