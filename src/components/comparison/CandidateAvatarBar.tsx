import { useState, useCallback } from "react";
import { View, Text, LayoutChangeEvent } from "react-native";
import type { Candidate } from "../../data/schema";
import { CandidateAvatar } from "../candidates/CandidateAvatar";
import { PressableScale } from "../ui/PressableScale";

const ITEM_WIDTH = 68;
const ITEM_HEIGHT = 80;

interface CandidateAvatarBarProps {
  candidates: Candidate[];
  selectedIds: string[];
  onToggle: (candidateId: string) => void;
  maxSelected?: number;
}

export function CandidateAvatarBar({
  candidates,
  selectedIds,
  onToggle,
  maxSelected = 4,
}: CandidateAvatarBarProps) {
  const maxReached = selectedIds.length >= maxSelected;
  const columnsPerRow = 4;
  const firstRow = candidates.slice(0, columnsPerRow);
  const secondRow = candidates.slice(columnsPerRow);
  const [rowWidth, setRowWidth] = useState(0);

  const onRowLayout = useCallback((e: LayoutChangeEvent) => {
    setRowWidth(e.nativeEvent.layout.width);
  }, []);

  // justify-around places top-row centers at (i+0.5) * rowWidth / topCount.
  // Midpoint between adjacent items i and i+1 = (i+1) * rowWidth / topCount.
  // Each bottom-row item is positioned at that midpoint.
  const topCount = firstRow.length;
  const bottomLeftPositions = secondRow.map((_, i) => {
    const midX = ((i + 1) * rowWidth) / topCount;
    return midX - ITEM_WIDTH / 2;
  });

  const renderCandidate = (candidate: Candidate) => {
    const isSelected = selectedIds.includes(candidate.id);
    const isDisabled = maxReached && !isSelected;

    return (
      <PressableScale
        key={candidate.id}
        onPress={() => {
          if (!isDisabled) onToggle(candidate.id);
        }}
        testID={`candidate-item-${candidate.id}`}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: isSelected, disabled: isDisabled }}
        accessibilityLabel={candidate.name}
        className="items-center px-1 py-2"
        style={{
          width: ITEM_WIDTH,
          height: ITEM_HEIGHT,
          opacity: isDisabled ? 0.3 : isSelected ? 1 : 0.55,
        }}
      >
        <CandidateAvatar candidate={candidate} size={44} showRing={isSelected} />
        <Text
          className={`text-xs text-civic-navy mt-1 text-center ${isSelected ? "font-display-bold" : "font-body-medium"
            }`}
          numberOfLines={1}
        >
          {candidate.name.split(" ").pop()}
        </Text>
      </PressableScale>
    );
  };

  return (
    <View className="px-2 py-1">
      <View className="flex-row justify-around" onLayout={onRowLayout}>
        {firstRow.map(renderCandidate)}
      </View>
      {secondRow.length > 0 && rowWidth > 0 && (
        <View style={{ height: ITEM_HEIGHT, marginTop: -28 }}>
          {secondRow.map((candidate, index) => (
            <View
              key={candidate.id}
              style={{ position: "absolute", left: bottomLeftPositions[index] }}
            >
              {renderCandidate(candidate)}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
