import React from "react";
import { type ViewStyle, View } from "react-native";

type ClipCorner = "top-right" | "bottom-left" | "none";

export interface DistrictBlockCardProps {
  clipCorner?: ClipCorner;
  children: React.ReactNode;
  className?: string;
  style?: ViewStyle;
}

const CLIP_SIZE = 16;

export default function DistrictBlockCard({
  clipCorner = "none",
  children,
  className = "",
  style,
}: DistrictBlockCardProps) {
  if (clipCorner === "none") {
    return (
      <View className={`rounded-xl overflow-hidden ${className}`} style={style}>
        {children}
      </View>
    );
  }

  return (
    <View className={`rounded-xl overflow-hidden ${className}`} style={style}>
      {children}
      {clipCorner === "top-right" && (
        <View
          style={{
            position: "absolute",
            top: -CLIP_SIZE / 2,
            right: -CLIP_SIZE / 2,
            width: CLIP_SIZE,
            height: CLIP_SIZE,
            backgroundColor: "#FAFAF8",
            transform: [{ rotate: "45deg" }],
          }}
        />
      )}
      {clipCorner === "bottom-left" && (
        <View
          style={{
            position: "absolute",
            bottom: -CLIP_SIZE / 2,
            left: -CLIP_SIZE / 2,
            width: CLIP_SIZE,
            height: CLIP_SIZE,
            backgroundColor: "#FAFAF8",
            transform: [{ rotate: "45deg" }],
          }}
        />
      )}
    </View>
  );
}
