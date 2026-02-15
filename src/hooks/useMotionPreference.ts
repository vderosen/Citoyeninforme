import { useReducedMotion } from "react-native-reanimated";

export function useMotionPreference() {
  const reduceMotion = useReducedMotion();
  return { shouldAnimate: !reduceMotion };
}
