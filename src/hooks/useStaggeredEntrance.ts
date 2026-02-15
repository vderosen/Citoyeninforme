import { FadeInDown } from "react-native-reanimated";
import { useMotionPreference } from "./useMotionPreference";

interface StaggerConfig {
  index: number;
  staggerMs?: number;
  durationMs?: number;
}

export function useStaggeredEntrance({ index, staggerMs = 50, durationMs = 400 }: StaggerConfig) {
  const { shouldAnimate } = useMotionPreference();

  if (!shouldAnimate) {
    return undefined;
  }

  return FadeInDown.delay(index * staggerMs).duration(durationMs);
}
