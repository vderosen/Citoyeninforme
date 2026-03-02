import { View } from "react-native";
import { useTranslation } from "react-i18next";

interface ProgressBarProps {
  current: number;
  total: number;
}

export function ProgressBar({ current, total }: ProgressBarProps) {
  const { t } = useTranslation("survey");
  const answeredCount = Math.max(0, Math.min(current, total));
  const progressPercent = total > 0 ? (answeredCount / total) * 100 : 0;

  return (
    <View
      testID="survey-progress-bar"
      className="px-5 py-1"
      style={{ zIndex: 30, elevation: 30 }}
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: total, now: answeredCount }}
      accessibilityLabel={t("cardProgress", { current: answeredCount, total })}
    >
      <View className="h-1.5 overflow-hidden rounded-full bg-warm-gray/60">
        <View
          className="h-full rounded-full bg-accent-coral"
          style={{ width: `${progressPercent}%` }}
        />
      </View>
    </View>
  );
}
