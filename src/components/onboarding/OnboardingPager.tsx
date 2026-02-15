import { useRef, useState, useCallback, ComponentType } from "react";
import {
  FlatList,
  useWindowDimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "../../stores/app";
import { StepPurpose } from "./StepPurpose";
import { StepNeutrality } from "./StepNeutrality";
import { StepModes } from "./StepModes";
import { StepTrust } from "./StepTrust";
import { StepReady } from "./StepReady";

// --- Types (from contracts/onboarding-navigation.ts) ---

type OnboardingStepKey = "purpose" | "neutrality" | "modes" | "trust" | "ready";
type EntryPointTarget = "survey" | "candidates" | "assistant";

const ENTRY_POINT_ROUTES: Record<EntryPointTarget, string> = {
  survey: "/(tabs)/",
  candidates: "/(tabs)/candidates",
  assistant: "/(tabs)/assistant",
};

interface StepContentProps {
  onNext: () => void;
  onComplete: (target: EntryPointTarget) => void;
  currentStep: number;
  totalSteps: number;
}

interface StepConfig {
  key: OnboardingStepKey;
  component: ComponentType<StepContentProps>;
}

const STEPS: StepConfig[] = [
  { key: "purpose", component: StepPurpose },
  { key: "neutrality", component: StepNeutrality },
  { key: "modes", component: StepModes },
  { key: "trust", component: StepTrust },
  { key: "ready", component: StepReady },
];

export function OnboardingPager() {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { width } = useWindowDimensions();
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const handleNext = useCallback(() => {
    if (currentIndex < STEPS.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    }
  }, [currentIndex]);

  const handleComplete = useCallback(
    (target: EntryPointTarget) => {
      completeOnboarding();
      router.replace(ENTRY_POINT_ROUTES[target] as any);
    },
    [completeOnboarding, router]
  );

  const handleMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      setCurrentIndex(index);
    },
    [width]
  );

  const getItemLayout = useCallback(
    (_: any, index: number) => ({
      length: width,
      offset: width * index,
      index,
    }),
    [width]
  );

  const renderItem = useCallback(
    ({ item }: { item: StepConfig }) => {
      const StepComponent = item.component;
      const stepIndex = STEPS.findIndex((s) => s.key === item.key);
      return (
        <StepComponent
          onNext={handleNext}
          onComplete={handleComplete}
          currentStep={stepIndex + 1}
          totalSteps={STEPS.length}
        />
      );
    },
    [handleNext, handleComplete]
  );

  return (
    <FlatList
      ref={flatListRef}
      data={STEPS}
      keyExtractor={(item) => item.key}
      renderItem={renderItem}
      extraData={currentIndex}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      bounces={false}
      scrollEnabled
      onMomentumScrollEnd={handleMomentumScrollEnd}
      getItemLayout={getItemLayout}
      initialNumToRender={1}
      maxToRenderPerBatch={2}
      windowSize={3}
    />
  );
}
