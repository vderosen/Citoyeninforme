import { forwardRef, type ComponentRef } from "react";
import { Text as RNText, type TextProps } from "react-native";

const DEFAULT_MAX_FONT_SIZE_MULTIPLIER = 1.4;
const SINGLE_LINE_MINIMUM_FONT_SCALE = 0.85;

type AppTextProps = TextProps;

export const AppText = forwardRef<ComponentRef<typeof RNText>, AppTextProps>(function AppText(
  {
    allowFontScaling = true,
    maxFontSizeMultiplier = DEFAULT_MAX_FONT_SIZE_MULTIPLIER,
    minimumFontScale,
    numberOfLines,
    ...props
  },
  ref,
) {
  const shouldAdjustSingleLine = typeof numberOfLines === "number" && numberOfLines === 1;

  return (
    <RNText
      ref={ref}
      allowFontScaling={allowFontScaling}
      maxFontSizeMultiplier={maxFontSizeMultiplier}
      numberOfLines={numberOfLines}
      adjustsFontSizeToFit={shouldAdjustSingleLine}
      minimumFontScale={minimumFontScale ?? (shouldAdjustSingleLine ? SINGLE_LINE_MINIMUM_FONT_SCALE : undefined)}
      {...props}
    />
  );
});
