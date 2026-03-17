import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useIsFocused } from "@react-navigation/native";
import Svg, { Path, Rect, Text as SvgText } from "react-native-svg";
import { useTranslation } from "react-i18next";
import { AppText as Text } from "../../components/ui/AppText";
import {
  PARIS_MAP_AREAS,
  PARIS_SEINE_PATH,
} from "../../data/elections/paris-2026/parisMapGeometry";
import {
  getPreviewSectorById,
  type PreviewFigure,
  type PreviewPoliticalTone,
  type PreviewSector,
  type PreviewSectorList,
} from "../../data/elections/paris-2026/parisSecondRoundPreview";
import { openExternalUrl } from "../../services/open-url";
import { useElectionStore } from "../../stores/election";
import { getCandidatePartyColor } from "../../utils/candidatePartyColor";
import { getCandidateImageSource } from "../../utils/candidateImageSource";
import type { Candidate } from "../../data/schema";

type CandidateMap = Map<string, Candidate>;
const TAB_BAR_OFFSET = 88;
const MAP_VIEWBOX = "18 16 598 326";

const SCREEN_BACKGROUND = ["#FDFBF7", "#F4EEE3"] as const;
const MAP_FILL = "#5B84AF";
const MAP_PRESS_FILL = "#88AED3";
const MAP_HINT_FILL = "#7FA8D1";
const MAP_SELECTED_FILL = "#DC5B48";
const MAP_STROKE = "#EAF0F7";
const MAP_SELECTED_STROKE = "#7F1E16";
const MAP_WATER_COLOR = "#D4E2F3";
const MAP_CANVAS = "#F5ECDF";
const MAP_HORIZONTAL_OFFSET = -7;

const PARIS_MAP_STROKES = PARIS_MAP_AREAS.filter((area) => area.showStroke);

const PARIS_MAP_SECTORS = Array.from(
  PARIS_MAP_AREAS.reduce((map, area) => {
    const existing = map.get(area.sectorId);
    map.set(area.sectorId, {
      sectorId: area.sectorId,
      path: existing ? `${existing.path}${area.path}` : area.path,
    });
    return map;
  }, new Map<string, { sectorId: string; path: string }>()),
).map(([, sector]) => sector);

function getPathCenter(path: string): { x: number; y: number } {
  const points = (path.match(/-?\d+\.?\d*/g) ?? []).map((value) => Number(value));
  if (points.length < 2) return { x: 0, y: 0 };

  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  for (let index = 0; index + 1 < points.length; index += 2) {
    const x = points[index];
    const y = points[index + 1];

    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }

  return {
    x: (minX + maxX) / 2,
    y: (minY + maxY) / 2,
  };
}

const PARIS_MAP_LABELS = PARIS_MAP_SECTORS.map((sector) => {
  const center = getPathCenter(sector.path);
  const labelOverrides: Record<string, { x?: number; y?: number }> = {
    "01": { x: 319, y: 166 },
    "15": { x: 178, y: 236 },
    "12": { x: 536, y: 275 },
  };
  const override = labelOverrides[sector.sectorId];

  return {
    sectorId: sector.sectorId,
    text: sector.sectorId === "01" ? "centre" : `${Number(sector.sectorId)}`,
    x: override?.x ?? center.x,
    y: override?.y ?? center.y + (sector.sectorId === "01" ? 1 : 2),
  };
});

const PARIS_MAP_SECTOR_CENTERS = PARIS_MAP_SECTORS.reduce(
  (map, sector) => {
    map[sector.sectorId] = getPathCenter(sector.path);
    return map;
  },
  {} as Record<string, { x: number; y: number }>,
);

const TONE_STYLES: Record<
  PreviewPoliticalTone,
  { accent: string; badgeBg: string; badgeText: string }
> = {
  left: { accent: "#1F8F5F", badgeBg: "#EAF6EF", badgeText: "#1F8F5F" },
  right: { accent: "#0F5FB5", badgeBg: "#EAF1FB", badgeText: "#0F5FB5" },
  center: { accent: "#C05F00", badgeBg: "#FBF3E8", badgeText: "#A84F00" },
  "far-right": { accent: "#C93A1C", badgeBg: "#FCECE8", badgeText: "#C93A1C" },
  "left-independent": {
    accent: "#A0417B",
    badgeBg: "#F9EBF4",
    badgeText: "#8B356A",
  },
  "right-independent": {
    accent: "#5B53C6",
    badgeBg: "#EFEEFB",
    badgeText: "#4B45A8",
  },
  "centrist-independent": {
    accent: "#257B8A",
    badgeBg: "#EAF5F7",
    badgeText: "#1F6A77",
  },
};

function formatPercent(pct: number): string {
  return pct.toFixed(2).replace(".", ",");
}

function getListAccentColor(list: PreviewSectorList): string {
  const sponsorFigure = list.figures.find((figure) => !figure.isLead && figure.candidateId);
  if (sponsorFigure?.candidateId) {
    return getCandidatePartyColor(sponsorFigure.candidateId);
  }

  const leadFigureWithCandidate = list.figures.find(
    (figure) => figure.isLead && figure.candidateId,
  );
  if (leadFigureWithCandidate?.candidateId) {
    return getCandidatePartyColor(leadFigureWithCandidate.candidateId);
  }

  return TONE_STYLES[list.tone].accent;
}

function getInitials(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function FigureAvatar({
  figure,
  candidateMap,
  size,
  accentColor,
  secondary = false,
}: {
  figure: PreviewFigure;
  candidateMap: CandidateMap;
  size: number;
  accentColor: string;
  secondary?: boolean;
}) {
  const candidate = figure.candidateId ? candidateMap.get(figure.candidateId) : undefined;
  const imageSource = candidate ? getCandidateImageSource(candidate) : null;

  return (
    <View
      className="items-center justify-center overflow-hidden rounded-full"
      style={{
        width: size,
        height: size,
        backgroundColor: secondary ? "#E6EDF4" : "#EFF3F7",
        borderWidth: 2,
        borderColor: "#FFFFFF",
      }}
    >
      {imageSource ? (
        <Image
          source={imageSource}
          style={{ width: size, height: size }}
          resizeMode="cover"
          accessibilityIgnoresInvertColors
        />
      ) : (
        <Text
          className="font-display-bold"
          style={{ color: accentColor, fontSize: size * 0.34 }}
        >
          {getInitials(figure.name)}
        </Text>
      )}
    </View>
  );
}

function FigureStack({
  figures,
  candidateMap,
  accentColor,
}: {
  figures: PreviewFigure[];
  candidateMap: CandidateMap;
  accentColor: string;
}) {
  const primary = figures[0];
  const secondary = figures[1];
  const primarySize = 60;
  const secondarySize = 40;
  const stackWidth = 88;
  const stackHeight = 78;

  return (
    <View style={{ width: stackWidth, height: stackHeight }}>
      <View
        style={{
          position: "absolute",
          left: (stackWidth - primarySize) / 2,
          top: 0,
        }}
      >
        <FigureAvatar
          figure={primary}
          candidateMap={candidateMap}
          size={primarySize}
          accentColor={accentColor}
        />
      </View>
      {secondary ? (
        <View
          style={{
            position: "absolute",
            right: 2,
            bottom: 0,
          }}
        >
          <FigureAvatar
            figure={secondary}
            candidateMap={candidateMap}
            size={secondarySize}
            accentColor={accentColor}
            secondary
          />
        </View>
      ) : null}
    </View>
  );
}

function SectorListCard({
  list,
  index,
  onPress,
  t,
}: {
  list: PreviewSectorList;
  index: number;
  onPress: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const accentColor = getListAccentColor(list);
  const leadFigure = list.figures[0];
  const progressWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progressWidth.setValue(0);

    const animation = Animated.timing(progressWidth, {
      toValue: Math.min(Math.max(list.pct, 0), 100),
      duration: 430,
      delay: index * 45,
      useNativeDriver: false,
    });

    animation.start();
    return () => animation.stop();
  }, [index, list.pct, progressWidth]);

  const animatedWidth = progressWidth.interpolate({
    inputRange: [0, 100],
    outputRange: ["0%", "100%"],
  });

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      className="mb-3"
      style={{
        borderBottomWidth: 1,
        borderBottomColor: "#E1E8F1",
        paddingBottom: 11,
      }}
    >
      <View className="flex-row items-center justify-between">
        <Text
          className="font-display-semibold text-[17px] text-civic-navy flex-1 pr-3"
          numberOfLines={1}
        >
          {leadFigure.name}
        </Text>
      </View>

      <Text
        className="font-body-medium text-[12px] text-text-caption mt-0.5"
        numberOfLines={1}
      >
        {list.shortBlocLabel}
      </Text>

      <View className="flex-row items-center mt-2.5">
        <View
          className="flex-1 overflow-hidden"
          style={{
            height: 10,
            borderRadius: 999,
            backgroundColor: "#E6EDF5",
          }}
        >
          <Animated.View
            style={{
              width: animatedWidth,
              height: "100%",
              backgroundColor: accentColor,
              borderRadius: 999,
            }}
          />
        </View>

        <Text
          className="font-display-bold text-[16px] ml-2.5"
          style={{ color: accentColor }}
          numberOfLines={1}
        >
          {t("percentLabel", { pct: formatPercent(list.pct) })}
        </Text>
      </View>
    </Pressable>
  );
}

function PreviewListModal({
  sector,
  list,
  candidateMap,
  visible,
  onClose,
  t,
}: {
  sector: PreviewSector | null;
  list: PreviewSectorList | null;
  candidateMap: CandidateMap;
  visible: boolean;
  onClose: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  if (!sector || !list) return null;

  const accentColor = getListAccentColor(list);
  const leadFigure = list.figures[0];
  const handleOpenSource = async () => {
    const opened = await openExternalUrl(sector.sourceUrl);
    if (!opened) {
      Alert.alert(
        t("common:linkOpenErrorTitle"),
        t("common:linkOpenErrorMessage")
      );
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View className="flex-1 bg-black/45 justify-end">
        <View className="rounded-t-[32px] bg-warm-white px-5 pt-5 pb-8" style={{ maxHeight: "88%" }}>
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-1 pr-4">
              <Text className="font-display-bold text-[21px] text-civic-navy">
                {t("detailTitle")}
              </Text>
              <Text className="font-body text-[13px] text-text-caption mt-1">
                {sector.label}
              </Text>
            </View>
            <Pressable
              onPress={onClose}
              accessibilityRole="button"
              accessibilityLabel={t("detailClose")}
              className="w-10 h-10 rounded-full items-center justify-center"
              style={{ backgroundColor: "#EEF2F7" }}
            >
              <Ionicons name="close" size={20} color="#1E2A44" />
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View className="rounded-[24px] bg-white p-4 mb-4" style={{ borderWidth: 1, borderColor: "#DEE7F1" }}>
              <Text className="font-display-semibold text-[14px] text-text-caption">
                {t("detailUnionTitle")}
              </Text>
              <View className="flex-row items-center mt-3">
                <FigureStack figures={list.figures} candidateMap={candidateMap} accentColor={accentColor} />
                <View className="flex-1 ml-4">
                  <Text className="font-display-bold text-[22px] text-civic-navy">
                    {list.shortBlocLabel}
                  </Text>
                  <Text className="font-display-semibold text-[14px] text-text-caption mt-1" numberOfLines={1}>
                    {leadFigure.name}
                  </Text>
                  <Text className="font-display-bold text-[30px] mt-2" style={{ color: accentColor }}>
                    {t("percentLabel", { pct: formatPercent(list.pct) })}
                  </Text>
                </View>
              </View>
            </View>

            <View className="rounded-[24px] bg-[#EEF2F7] p-4 mb-4">
              <Text className="font-display-semibold text-[16px] text-civic-navy mb-2">
                {t("detailProfileTitle")}
              </Text>
              <Text className="font-body text-[14px] text-text-body">
                {leadFigure.bio}
              </Text>
            </View>

            <View className="rounded-[24px] bg-[#EEF2F7] p-4 mb-4">
              <Text className="font-display-semibold text-[16px] text-civic-navy mb-2">
                {t("detailAllianceTitle")}
              </Text>
              <Text className="font-body text-[14px] text-text-body">
                {t("detailAlliancePlaceholder")}
              </Text>
            </View>

            <View className="rounded-[24px] bg-[#EEF2F7] p-4">
              <Text className="font-display-semibold text-[16px] text-civic-navy mb-2">
                {t("detailSourceTitle")}
              </Text>
              <Text className="font-body text-[13px] text-text-body mb-3">
                {t("officialSourceLabel")}
              </Text>
              <Pressable
                onPress={() => {
                  void handleOpenSource();
                }}
                className="rounded-[16px] px-4 py-3 items-center"
                style={{ backgroundColor: accentColor }}
              >
                <Text className="font-display-semibold text-white">
                  {t("detailSourceLink")}
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function ParisMap({
  selectedSectorId,
  onSelectSector,
  screenFocused,
}: {
  selectedSectorId: string | null;
  onSelectSector: (sectorId: string) => void;
  screenFocused: boolean;
}) {
  const [pressedSectorId, setPressedSectorId] = useState<string | null>(null);
  const [hintDismissed, setHintDismissed] = useState(false);
  const [hintProgress, setHintProgress] = useState(0);

  useEffect(() => {
    if (!screenFocused) return;
    setHintDismissed(false);
    setHintProgress(0);
  }, [screenFocused]);

  useEffect(() => {
    if (!screenFocused || selectedSectorId || hintDismissed) return;

    let frame = 0;
    const totalFrames = 40;
    const interval = setInterval(() => {
      frame = (frame + 1) % totalFrames;
      setHintProgress(frame / totalFrames);
    }, 50);

    return () => clearInterval(interval);
  }, [hintDismissed, screenFocused, selectedSectorId]);

  const hintSectorId = "13";
  const hintActive = screenFocused && !hintDismissed && !selectedSectorId;
  const hintWave = Math.sin(hintProgress * Math.PI);
  const hintScale = 1 + 0.14 * hintWave;
  const hintDrop = 5.2 * hintWave;
  const hintedSector = PARIS_MAP_SECTORS.find((sector) => sector.sectorId === hintSectorId) ?? null;
  const hintCenter = PARIS_MAP_SECTOR_CENTERS[hintSectorId];
  const hintTransform =
    hintActive && hintCenter
      ? `translate(0 ${hintDrop}) translate(${hintCenter.x} ${hintCenter.y}) scale(${hintScale}) translate(${-hintCenter.x} ${-hintCenter.y})`
      : undefined;

  const orderedSectors = selectedSectorId
    ? [
        ...PARIS_MAP_SECTORS.filter((sector) => sector.sectorId !== selectedSectorId),
        ...PARIS_MAP_SECTORS.filter((sector) => sector.sectorId === selectedSectorId),
      ]
    : PARIS_MAP_SECTORS;

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox={MAP_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
    >
      <Rect x={0} y={0} width={640} height={540} fill={MAP_CANVAS} />

      {orderedSectors.map((sector) => {
        const isSelected = sector.sectorId === selectedSectorId;
        const isPressed = sector.sectorId === pressedSectorId;
        const fillColor = isSelected
          ? MAP_SELECTED_FILL
          : isPressed
            ? MAP_PRESS_FILL
            : MAP_FILL;

        return (
          <Path
            key={sector.sectorId}
            d={sector.path}
            fill={fillColor}
            onPressIn={(event) => {
              if (!hintDismissed) {
                setHintDismissed(true);
                setHintProgress(0);
              }
              setPressedSectorId(sector.sectorId);
              return event;
            }}
            onPressOut={(event) => {
              setTimeout(() => {
                setPressedSectorId((current) =>
                  current === sector.sectorId ? null : current,
                );
              }, 170);
              return event;
            }}
            onPress={(event) => {
              onSelectSector(sector.sectorId);
              return event;
            }}
          />
        );
      })}

      {PARIS_MAP_STROKES.map((area) => (
        <Path
          key={`stroke-${area.arrondissementId}`}
          d={area.path}
          fill="none"
          stroke={MAP_STROKE}
          strokeWidth={2.4}
          strokeOpacity={0.82}
          strokeLinecap="round"
          strokeLinejoin="round"
          pointerEvents="none"
        />
      ))}

      {selectedSectorId
        ? PARIS_MAP_AREAS.filter(
            (area) => area.sectorId === selectedSectorId && area.showStroke,
          ).map((area) => (
            <Path
              key={`selected-${area.arrondissementId}`}
              d={area.path}
              fill="none"
              stroke={MAP_SELECTED_STROKE}
              strokeWidth={3.2}
              strokeLinecap="round"
              strokeLinejoin="round"
              pointerEvents="none"
            />
          ))
        : null}

      {hintActive && hintedSector ? (
        <>
          <Path
            d={hintedSector.path}
            fill={MAP_HINT_FILL}
            transform={hintTransform}
            pointerEvents="none"
          />
          <Path
            d={hintedSector.path}
            fill="none"
            stroke="#F3F8FE"
            strokeWidth={2.8}
            strokeOpacity={0.95}
            transform={hintTransform}
            pointerEvents="none"
          />
        </>
      ) : null}

      <Path
        d={PARIS_SEINE_PATH}
        fill="none"
        stroke={MAP_CANVAS}
        strokeWidth={14}
        strokeOpacity={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="none"
      />
      <Path
        d={PARIS_SEINE_PATH}
        fill="none"
        stroke={MAP_WATER_COLOR}
        strokeWidth={7}
        strokeOpacity={1}
        strokeLinecap="round"
        strokeLinejoin="round"
        pointerEvents="none"
      />

      {PARIS_MAP_LABELS.map((label) => (
        <SvgText
          key={`label-${label.sectorId}`}
          x={label.x}
          y={label.y}
          fontSize={16}
          fontWeight="700"
          fill="#F8FCFF"
          textAnchor="middle"
          alignmentBaseline="middle"
          pointerEvents="none"
        >
          {label.text}
        </SvgText>
      ))}
    </Svg>
  );
}

function SectorPanel({
  sector,
  onClose,
  onOpenList,
  bottomInset,
  t,
}: {
  sector: PreviewSector;
  onClose: () => void;
  onOpenList: (list: PreviewSectorList) => void;
  bottomInset: number;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  const orderedLists = useMemo(
    () => [...sector.lists].sort((a, b) => b.pct - a.pct),
    [sector.lists],
  );

  return (
    <View
      className="absolute inset-x-0"
      style={{ bottom: TAB_BAR_OFFSET, paddingHorizontal: 12 }}
      pointerEvents="box-none"
    >
      <View
        className="rounded-t-[32px] rounded-b-[28px] bg-warm-white px-5 pt-4"
        style={{
          maxHeight: 460,
          paddingBottom: bottomInset + 14,
          borderWidth: 1,
          borderColor: "#E8EDF4",
          shadowColor: "#0F172A",
          shadowOpacity: 0.12,
          shadowRadius: 18,
          shadowOffset: { width: 0, height: -6 },
          elevation: 12,
        }}
      >
        <View className="h-1.5 w-14 self-center rounded-full bg-[#D8DDE7] mb-4" />

        <View className="flex-row items-start justify-between mb-4">
          <View className="flex-1 pr-3">
            <Text className="font-display-bold text-[24px] text-civic-navy">
              {sector.label}
            </Text>
            {sector.id === "01" ? (
              <Text className="font-body text-[13px] text-text-caption mt-1" numberOfLines={1}>
                {sector.arrondissementLabel}
              </Text>
            ) : null}
          </View>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel={t("closePanel")}
            className="w-10 h-10 rounded-full items-center justify-center"
            style={{ backgroundColor: "#EEF2F7" }}
          >
            <Ionicons name="close" size={18} color="#1E2A44" />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          <View className="pb-1">
            {orderedLists.map((list, index) => (
              <SectorListCard
                key={`${sector.id}-${list.id}`}
                list={list}
                index={index}
                onPress={() => onOpenList(list)}
                t={t}
              />
            ))}
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

export default function CarteScreen() {
  const { t } = useTranslation("map");
  const isFocused = useIsFocused();
  const insets = useSafeAreaInsets();
  const candidates = useElectionStore((state) => state.candidates);
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedList, setSelectedList] = useState<PreviewSectorList | null>(null);

  const candidateMap = useMemo(
    () => new Map(candidates.map((candidate) => [candidate.id, candidate])),
    [candidates],
  );

  const selectedSector = selectedSectorId ? getPreviewSectorById(selectedSectorId) ?? null : null;

  return (
    <SafeAreaView className="flex-1 bg-warm-white" edges={["top"]}>
      <LinearGradient colors={SCREEN_BACKGROUND} style={{ flex: 1 }}>
        <View className="flex-1">
          <View className="pt-2 pb-1 px-4 items-center">
            <View
              className="rounded-full px-4 py-1"
              style={{ backgroundColor: "#1E2A44" }}
            >
              <Text
                className="text-[22px] tracking-wide"
                style={{ fontFamily: "ArialRoundedMTBold" }}
              >
                <Text style={{ color: "#FFFFFF" }}>Citoyen </Text>
                <Text style={{ color: "#60A5FA" }}>Informé</Text>
              </Text>
            </View>
          </View>

          <View
            className="flex-1"
            style={{
              paddingTop: 8,
              paddingHorizontal: 12,
              paddingBottom: selectedSector ? 332 : TAB_BAR_OFFSET + 22,
            }}
          >
            <View
              className="flex-1 overflow-hidden"
              style={{
                borderRadius: 36,
                backgroundColor: "#F6EEE2",
                borderWidth: 1,
                borderColor: "rgba(255,255,255,0.62)",
                shadowColor: "#6A3E27",
                shadowOpacity: 0.08,
                shadowRadius: 20,
                shadowOffset: { width: 0, height: 8 },
                elevation: 7,
              }}
            >
              <View
                pointerEvents="none"
                style={{
                  position: "absolute",
                  left: 20,
                  right: 20,
                  bottom: 18,
                  zIndex: 1,
                  alignItems: "center",
                }}
              >
                <Text
                  className="font-display-bold text-center"
                  style={{
                    fontSize: 28,
                    lineHeight: 29,
                    color: "#9E6C43",
                    opacity: 0.58,
                    textTransform: "uppercase",
                    letterSpacing: 0.9,
                  }}
                >
                  {t("mapSubtitle")}
                </Text>
              </View>

              <View
                className="flex-1 items-center justify-center"
                style={{
                  paddingHorizontal: 4,
                  paddingVertical: selectedSector ? 10 : 12,
                  transform: [{ translateX: MAP_HORIZONTAL_OFFSET }],
                }}
              >
                <ParisMap
                  selectedSectorId={selectedSectorId}
                  onSelectSector={(sectorId) => {
                    setSelectedSectorId(sectorId);
                    setSelectedList(null);
                  }}
                  screenFocused={isFocused}
                />
              </View>
            </View>
          </View>

          {selectedSector ? (
            <SectorPanel
              sector={selectedSector}
              onClose={() => {
                setSelectedSectorId(null);
                setSelectedList(null);
              }}
              onOpenList={setSelectedList}
              bottomInset={insets.bottom}
              t={t}
            />
          ) : null}

          <PreviewListModal
            sector={selectedSector}
            list={selectedList}
            candidateMap={candidateMap}
            visible={Boolean(selectedList)}
            onClose={() => setSelectedList(null)}
            t={t}
          />
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}
