import { useRef, useState, useCallback, ComponentType } from "react";
import {
  FlatList,
  Platform,
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
  const currentIndexRef = useRef(0);
  const { width } = useWindowDimensions();
  const router = useRouter();
  const completeOnboarding = useAppStore((s) => s.completeOnboarding);

  const goToIndex = useCallback(
    (index: number) => {
      currentIndexRef.current = index;
      setCurrentIndex(index);
      flatListRef.current?.scrollToIndex({ index, animated: true });
    },
    []
  );

  const handleNext = useCallback(() => {
    const next = currentIndexRef.current + 1;
    if (next < STEPS.length) {
      goToIndex(next);
    }
  }, [goToIndex]);

  const handleComplete = useCallback(
    (target: EntryPointTarget) => {
      completeOnboarding();
      router.replace(ENTRY_POINT_ROUTES[target] as any);
    },
    [completeOnboarding, router]
  );

  const handleScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(e.nativeEvent.contentOffset.x / width);
      if (index !== currentIndexRef.current) {
        currentIndexRef.current = index;
        setCurrentIndex(index);
      }
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
    ({ item, index }: { item: StepConfig; index: number }) => {
      const StepComponent = item.component;
      return (
        <StepComponent
          onNext={handleNext}
          onComplete={handleComplete}
          currentStep={index + 1}
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
      onMomentumScrollEnd={handleScrollEnd}
      onScrollEndDrag={Platform.OS === "web" ? handleScrollEnd : undefined}
      getItemLayout={getItemLayout}
      initialNumToRender={STEPS.length}
      windowSize={5}
    />
  );
}
