import React from "react";
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";

interface SteppedDividerProps {
  className?: string;
}

const BLOCK_HEIGHTS = [4, 2, 4, 3, 4, 2, 3, 4, 2, 4, 3, 2, 4, 3, 4, 2, 3, 4];
const BLOCK_WIDTH = 20;
const MAX_HEIGHT = 4;

export default function SteppedDivider({ className = "" }: SteppedDividerProps) {
  const totalWidth = BLOCK_HEIGHTS.length * BLOCK_WIDTH;

  return (
    <View className={`w-full items-center ${className}`}>
      <Svg
        width="100%"
        height={MAX_HEIGHT}
        viewBox={`0 0 ${totalWidth} ${MAX_HEIGHT}`}
        preserveAspectRatio="xMidYMax slice"
      >
        {BLOCK_HEIGHTS.map((h, i) => (
          <Rect
            key={i}
            x={i * BLOCK_WIDTH}
            y={MAX_HEIGHT - h}
            width={BLOCK_WIDTH - 1}
            height={h}
            fill="#F0EDE8"
          />
        ))}
      </Svg>
    </View>
  );
}
