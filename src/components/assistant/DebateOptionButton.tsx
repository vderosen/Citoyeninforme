import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PressableScale } from "../ui/PressableScale";
import { AppText as Text } from "../ui/AppText";

interface DebateOptionButtonProps {
  /** The option prefix letter (e.g. "a", "b", "c", "d") */
  letter: string;
  /** The option display text */
  text: string;
  /** Visual and interaction state */
  state: "selectable" | "selected" | "disabled";
  /** Tap handler */
  onPress: () => void;
}

export function DebateOptionButton({
  letter,
  text,
  state,
  onPress,
}: DebateOptionButtonProps) {
  const isDisabled = state === "disabled";
  const isSelected = state === "selected";

  return (
    <PressableScale
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled: isDisabled }}
      accessibilityLabel={`${letter.toUpperCase()}. ${text}`}
      className={`flex-row items-center rounded-2xl border px-4 py-3 gap-3 ${
        isSelected
          ? "bg-accent-blue border-accent-blue"
          : isDisabled
            ? "bg-warm-gray border-warm-gray"
            : "bg-warm-white border-civic-navy-light"
      }`}
      style={{ minHeight: 48 }}
      ensureMinTouchTarget
    >
      {/* Letter circle or checkmark */}
      <View
        className={`h-6 w-6 items-center justify-center rounded-full ${
          isSelected
            ? "bg-white/20"
            : isDisabled
              ? "bg-text-caption/15"
              : "border border-civic-navy bg-warm-white"
        }`}
      >
        {isSelected ? (
          <Ionicons name="checkmark" size={14} color="#FAFAF8" />
        ) : (
          <Text
            className={`text-xs font-display-medium ${
              isDisabled ? "text-text-caption" : "text-civic-navy"
            }`}
          >
            {letter.toUpperCase()}
          </Text>
        )}
      </View>

      {/* Option text */}
      <Text
        className={`flex-1 text-sm font-body ${
          isSelected
            ? "text-white"
            : isDisabled
              ? "text-text-caption"
              : "text-civic-navy"
        }`}
      >
        {text}
      </Text>
    </PressableScale>
  );
}
